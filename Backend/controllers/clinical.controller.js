const pool = require('../db/pool');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];


// ======================================================
// HELPERS
// ======================================================

const fail = (res, status, message) =>
    res.status(status).json({ success: false, error: message, message });

const serverError = (res, label, error) => {
    console.error(`${label}:`, error);
    return fail(res, 500, 'Something went wrong on the server');
};

// The day to show. Use ?date=YYYY-MM-DD, otherwise the database's today.
const resolveDate = (value) =>
    typeof value === 'string' && DATE_PATTERN.test(value) ? value : null;

// Finds the doctors row linked to the logged-in doctor user.
const getDoctorForUser = async (userId) => {
    const result = await pool.query(
        `SELECT id, name, specialty
           FROM doctors
          WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0] || null;
};

const NOT_LINKED =
    'Your login is not linked to a doctor profile yet. Ask the administrator to link it.';

const withTransaction = async (work) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Shared SELECT used by the nurse queue and the doctor list.
// $1 = date (or NULL for today). Extra filters are appended by the caller.
const APPOINTMENT_LIST_SQL = `
    SELECT
        a.id,
        a.appointment_date::text AS appointment_date,
        a.appointment_time,
        a.status,
        a.patient_id,
        a.doctor_id,
        u.first_name || ' ' || u.last_name AS patient,
        u.phone AS patient_phone,
        d.name AS doctor,
        d.specialty,
        s.name AS service,
        p.predicted_disease,
        p.confidence,
        p.priority,
        p.created_at AS predicted_at,
        na.id AS assessment_id,
        na.temperature,
        na.blood_pressure,
        na.pulse,
        na.weight,
        na.notes AS assessment_notes
    FROM appointments a
    JOIN users u ON u.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    JOIN services s ON s.id = a.service_id
    LEFT JOIN LATERAL (
        SELECT predicted_disease, confidence, priority, created_at
          FROM ai_predictions
         WHERE patient_id = a.patient_id
         ORDER BY created_at DESC
         LIMIT 1
    ) p ON TRUE
    LEFT JOIN LATERAL (
        SELECT id, temperature, blood_pressure, pulse, weight, notes
          FROM nurse_assessments
         WHERE appointment_id = a.id
         ORDER BY created_at DESC
         LIMIT 1
    ) na ON TRUE
    WHERE a.appointment_date = COALESCE($1::date, CURRENT_DATE)
      AND a.status <> 'Cancelled'
`;


// ======================================================
// NURSE: TODAY'S QUEUE
// GET /api/nurse/queue?date=YYYY-MM-DD
// ======================================================

const getNurseQueue = async (req, res) => {

    try {

        const result = await pool.query(
            `${APPOINTMENT_LIST_SQL} ORDER BY a.appointment_time ASC, a.id ASC`,
            [resolveDate(req.query.date)]
        );

        return res.json({ success: true, data: result.rows });

    } catch (error) {
        return serverError(res, 'Nurse queue error', error);
    }
};


// ======================================================
// DOCTOR: OWN APPOINTMENTS
// GET /api/doctor/appointments?date=YYYY-MM-DD
// ======================================================

const getDoctorAppointments = async (req, res) => {

    try {

        const doctor = await getDoctorForUser(req.user.id);

        if (!doctor) {
            return fail(res, 404, NOT_LINKED);
        }

        const result = await pool.query(
            `${APPOINTMENT_LIST_SQL}
              AND a.doctor_id = $2
            ORDER BY a.appointment_time ASC, a.id ASC`,
            [resolveDate(req.query.date), doctor.id]
        );

        return res.json({ success: true, doctor, data: result.rows });

    } catch (error) {
        return serverError(res, 'Doctor appointments error', error);
    }
};


// ======================================================
// CLINICAL SUMMARY FOR ONE PATIENT (nurse / doctor / admin)
// GET /api/patients/:id/clinical-summary
// ======================================================

const getPatientClinicalSummary = async (req, res) => {

    try {

        const patientId = Number(req.params.id);

        if (!Number.isSafeInteger(patientId) || patientId <= 0) {
            return fail(res, 400, 'Invalid patient id');
        }

        const [patient, predictions, assessments, records] = await Promise.all([

            pool.query(
                `SELECT id, first_name, last_name, email, phone, created_at
                   FROM users
                  WHERE id = $1 AND role = 'patient'`,
                [patientId]
            ),

            pool.query(
                `SELECT id, predicted_disease, confidence, priority,
                        model_name, input_data, created_at
                   FROM ai_predictions
                  WHERE patient_id = $1
                  ORDER BY created_at DESC
                  LIMIT 5`,
                [patientId]
            ),

            pool.query(
                `SELECT na.id, na.appointment_id, na.temperature, na.blood_pressure,
                        na.pulse, na.weight, na.notes, na.created_at,
                        n.first_name || ' ' || n.last_name AS nurse
                   FROM nurse_assessments na
                   JOIN users n ON n.id = na.nurse_id
                  WHERE na.patient_id = $1
                  ORDER BY na.created_at DESC
                  LIMIT 5`,
                [patientId]
            ),

            pool.query(
                `SELECT mr.id, mr.visit_date::text AS visit_date, mr.diagnosis, mr.notes, mr.treatment,
                        d.name AS doctor
                   FROM medical_records mr
                   JOIN doctors d ON d.id = mr.doctor_id
                  WHERE mr.patient_id = $1
                  ORDER BY mr.visit_date DESC, mr.id DESC
                  LIMIT 10`,
                [patientId]
            )
        ]);

        if (patient.rows.length === 0) {
            return fail(res, 404, 'Patient not found');
        }

        return res.json({
            success: true,
            data: {
                patient: patient.rows[0],
                predictions: predictions.rows,
                assessments: assessments.rows,
                records: records.rows
            }
        });

    } catch (error) {
        return serverError(res, 'Clinical summary error', error);
    }
};


// ======================================================
// CHANGE APPOINTMENT STATUS (check in / complete / cancel)
// PUT /api/appointments/:id/status    { "status": "Confirmed" }
// ======================================================

const updateAppointmentStatus = async (req, res) => {

    try {

        const appointmentId = Number(req.params.id);
        const { status } = req.body || {};

        if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
            return fail(res, 400, 'Invalid appointment id');
        }

        if (!VALID_STATUSES.includes(status)) {
            return fail(res, 400, `Status must be one of: ${VALID_STATUSES.join(', ')}`);
        }

        const existing = await pool.query(
            'SELECT id, doctor_id FROM appointments WHERE id = $1',
            [appointmentId]
        );

        if (existing.rows.length === 0) {
            return fail(res, 404, 'Appointment not found');
        }

        // A doctor may only change their own appointments.
        if (req.user.role === 'doctor') {

            const doctor = await getDoctorForUser(req.user.id);

            if (!doctor) {
                return fail(res, 404, NOT_LINKED);
            }

            if (Number(existing.rows[0].doctor_id) !== Number(doctor.id)) {
                return fail(res, 403, 'This appointment belongs to another doctor');
            }
        }

        const result = await pool.query(
            `UPDATE appointments
                SET status = $1
              WHERE id = $2
          RETURNING id, status`,
            [status, appointmentId]
        );

        return res.json({ success: true, data: result.rows[0] });

    } catch (error) {
        return serverError(res, 'Update status error', error);
    }
};


// ======================================================
// NURSE ASSESSMENT (vitals + notes)
// POST /api/assessments
// ======================================================

const parseOptionalNumber = (value, label, min, max) => {

    if (value === undefined || value === null || value === '') {
        return { value: null };
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < min || number > max) {
        return { error: `${label} must be a number between ${min} and ${max}` };
    }

    return { value: number };
};

const createAssessment = async (req, res) => {

    try {

        const body = req.body || {};
        const appointmentId = Number(body.appointment_id);

        if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
            return fail(res, 400, 'A valid appointment_id is required');
        }

        const temperature = parseOptionalNumber(body.temperature, 'Temperature', 30, 45);
        const pulse = parseOptionalNumber(body.pulse, 'Pulse', 20, 250);
        const weight = parseOptionalNumber(body.weight, 'Weight', 1, 500);

        const invalid = [temperature, pulse, weight].find((field) => field.error);

        if (invalid) {
            return fail(res, 400, invalid.error);
        }

        const bloodPressure =
            typeof body.blood_pressure === 'string' && body.blood_pressure.trim()
                ? body.blood_pressure.trim()
                : null;

        if (bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(bloodPressure)) {
            return fail(res, 400, 'Blood pressure must look like 120/80');
        }

        const notes =
            typeof body.notes === 'string' && body.notes.trim()
                ? body.notes.trim().slice(0, 2000)
                : null;

        if (
            temperature.value === null &&
            pulse.value === null &&
            weight.value === null &&
            !bloodPressure &&
            !notes
        ) {
            return fail(res, 400, 'Enter at least one measurement or a note');
        }

        const appointment = await pool.query(
            'SELECT id, patient_id, status FROM appointments WHERE id = $1',
            [appointmentId]
        );

        if (appointment.rows.length === 0) {
            return fail(res, 404, 'Appointment not found');
        }

        const saved = await withTransaction(async (client) => {

            const inserted = await client.query(
                `INSERT INTO nurse_assessments
                    (appointment_id, patient_id, nurse_id, temperature,
                     blood_pressure, pulse, weight, notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    appointmentId,
                    appointment.rows[0].patient_id,
                    req.user.id,
                    temperature.value,
                    bloodPressure,
                    pulse.value,
                    weight.value,
                    notes
                ]
            );

            // Taking vitals means the patient has arrived.
            if (appointment.rows[0].status === 'Pending') {
                await client.query(
                    `UPDATE appointments SET status = 'Confirmed' WHERE id = $1`,
                    [appointmentId]
                );
            }

            return inserted.rows[0];
        });

        return res.status(201).json({ success: true, data: saved });

    } catch (error) {
        return serverError(res, 'Create assessment error', error);
    }
};


// ======================================================
// DOCTOR: SAVE A MEDICAL RECORD (and finish the visit)
// POST /api/medical-records
// { appointment_id?, patient_id?, diagnosis, treatment?, notes? }
// ======================================================

const createMedicalRecord = async (req, res) => {

    try {

        const body = req.body || {};

        const diagnosis =
            typeof body.diagnosis === 'string' ? body.diagnosis.trim() : '';

        if (!diagnosis) {
            return fail(res, 400, 'A diagnosis is required');
        }

        const text = (value) =>
            typeof value === 'string' && value.trim()
                ? value.trim().slice(0, 4000)
                : null;

        const doctor = await getDoctorForUser(req.user.id);

        if (!doctor) {
            return fail(res, 404, NOT_LINKED);
        }

        let patientId = Number(body.patient_id);
        let appointmentId = null;
        let visitDate = null;

        if (body.appointment_id !== undefined && body.appointment_id !== null) {

            appointmentId = Number(body.appointment_id);

            if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
                return fail(res, 400, 'Invalid appointment_id');
            }

            const appointment = await pool.query(
                `SELECT id, patient_id, doctor_id, appointment_date
                   FROM appointments
                  WHERE id = $1`,
                [appointmentId]
            );

            if (appointment.rows.length === 0) {
                return fail(res, 404, 'Appointment not found');
            }

            if (Number(appointment.rows[0].doctor_id) !== Number(doctor.id)) {
                return fail(res, 403, 'This appointment belongs to another doctor');
            }

            patientId = Number(appointment.rows[0].patient_id);
            visitDate = appointment.rows[0].appointment_date;
        }

        if (!Number.isSafeInteger(patientId) || patientId <= 0) {
            return fail(res, 400, 'A valid patient_id or appointment_id is required');
        }

        const record = await withTransaction(async (client) => {

            const inserted = await client.query(
                `INSERT INTO medical_records
                    (patient_id, doctor_id, visit_date, diagnosis, notes, treatment)
                 VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4, $5, $6)
                 RETURNING *`,
                [
                    patientId,
                    doctor.id,
                    visitDate,
                    diagnosis.slice(0, 4000),
                    text(body.notes),
                    text(body.treatment)
                ]
            );

            if (appointmentId) {
                await client.query(
                    `UPDATE appointments SET status = 'Completed' WHERE id = $1`,
                    [appointmentId]
                );
            }

            return inserted.rows[0];
        });

        return res.status(201).json({ success: true, data: record });

    } catch (error) {
        return serverError(res, 'Create medical record error', error);
    }
};

module.exports = {
    getNurseQueue,
    getDoctorAppointments,
    getPatientClinicalSummary,
    updateAppointmentStatus,
    createAssessment,
    createMedicalRecord
};
