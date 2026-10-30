/*
|--------------------------------------------------------------------------
| USER QUERIES
|--------------------------------------------------------------------------
*/

const addUser = `
    INSERT INTO users
    (first_name, last_name, email, password, role, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, first_name, last_name, email, role, phone
`;

const getUsers = `
    SELECT
        id,
        first_name,
        last_name,
        email,
        role,
        phone,
        created_at
    FROM users
    ORDER BY created_at DESC
`;

const getPatients = `
    SELECT
        id,
        first_name,
        last_name,
        email,
        role,
        phone,
        created_at
    FROM users
    WHERE LOWER(role) = 'patient'
    ORDER BY created_at DESC
`;

const getUserById = `
    SELECT
        id,
        first_name,
        last_name,
        email,
        role,
        phone,
        created_at
    FROM users
    WHERE id = $1
`;

const getUserByEmail = `
    SELECT *
    FROM users
    WHERE email = $1
`;

const deleteUser = `
    DELETE FROM users
    WHERE id = $1
`;


/*
|--------------------------------------------------------------------------
| DOCTOR QUERIES
|--------------------------------------------------------------------------
*/

const getDoctors = `
    SELECT
        d.id,
        d.name,
        d.specialty,
        d.experience,
        d.rating,
        d.available,
        d.location
    FROM doctors d
    ORDER BY d.name
`;

const getDoctorById = `
    SELECT *
    FROM doctors
    WHERE id = $1
`;

const getDoctorsByService = `
    SELECT
        d.id,
        d.name,
        d.specialty,
        d.experience,
        d.rating,
        d.available,
        d.location
    FROM doctors d
    JOIN doctor_services ds
        ON d.id = ds.doctor_id
    WHERE ds.service_id = $1
      AND d.available = true
    ORDER BY d.rating DESC
`;


/*
|--------------------------------------------------------------------------
| SERVICE QUERIES
|--------------------------------------------------------------------------
*/

const getServices = `
    SELECT *
    FROM services
    WHERE active = true
    ORDER BY name
`;

const getServiceById = `
    SELECT *
    FROM services
    WHERE id = $1
`;


/*
|--------------------------------------------------------------------------
| APPOINTMENT QUERIES
|--------------------------------------------------------------------------
*/

const createAppointment = `
    INSERT INTO appointments
    (
        patient_id,
        doctor_id,
        service_id,
        appointment_date,
        appointment_time,
        status
    )
    VALUES ($1, $2, $3, $4, $5, 'Confirmed')
    RETURNING *
`;

const getAppointments = `
    SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        u.first_name || ' ' || u.last_name AS patient,
        d.name AS doctor,
        d.specialty,
        s.name AS service
    FROM appointments a
    JOIN users u
        ON a.patient_id = u.id
    JOIN doctors d
        ON a.doctor_id = d.id
    JOIN services s
        ON a.service_id = s.id
    ORDER BY a.appointment_date, a.appointment_time
`;

const getAppointmentsByPatient = `
    SELECT
        a.id,
        a.appointment_date::text AS appointment_date,
        a.appointment_time,
        a.status,
        d.name AS doctor,
        d.specialty,
        s.name AS service
    FROM appointments a
    JOIN doctors d
        ON a.doctor_id = d.id
    JOIN services s
        ON a.service_id = s.id
    WHERE a.patient_id = $1
    ORDER BY
        a.appointment_date DESC,
        a.appointment_time DESC
`;

const getAppointmentById = `
    SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        d.name AS doctor,
        d.specialty,
        s.name AS service
    FROM appointments a
    JOIN doctors d
        ON a.doctor_id = d.id
    JOIN services s
        ON a.service_id = s.id
    WHERE a.id = $1
`;

const cancelAppointment = `
    UPDATE appointments
    SET status = 'Cancelled'
    WHERE id = $1
    RETURNING *
`;


/*
|--------------------------------------------------------------------------
| MEDICAL RECORD QUERIES
|--------------------------------------------------------------------------
*/

const getMedicalRecords = `
    SELECT
        mr.id,
        mr.visit_date::text AS visit_date,
        mr.diagnosis,
        mr.notes,
        mr.treatment,
        d.name AS doctor,
        d.specialty
    FROM medical_records mr
    JOIN doctors d
        ON mr.doctor_id = d.id
    WHERE mr.patient_id = $1
    ORDER BY mr.visit_date DESC
`;

const getMedicalRecordById = `
    SELECT
        mr.*,
        d.name AS doctor,
        d.specialty
    FROM medical_records mr
    JOIN doctors d
        ON mr.doctor_id = d.id
    WHERE mr.id = $1
`;


/*
|--------------------------------------------------------------------------
| PRESCRIPTION QUERIES
|--------------------------------------------------------------------------
*/

const getPrescriptions = `
    SELECT
        p.id,
        p.medicine,
        p.dosage,
        p.frequency,
        p.start_date,
        p.end_date,
        p.status,
        d.name AS doctor
    FROM prescriptions p
    JOIN doctors d
        ON p.doctor_id = d.id
    WHERE p.patient_id = $1
    ORDER BY p.start_date DESC
`;


/*
|--------------------------------------------------------------------------
| MESSAGE QUERIES
|--------------------------------------------------------------------------
*/

const getMessages = `
    SELECT *
    FROM messages
    WHERE recipient_id = $1
    ORDER BY created_at DESC
`;

const createMessage = `
    INSERT INTO messages
    (
        sender_id,
        recipient_id,
        subject,
        message
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
`;

const markMessageRead = `
    UPDATE messages
    SET is_read = true
    WHERE id = $1
    RETURNING *
`;


/*
|--------------------------------------------------------------------------
| HEALTH TIP QUERIES
|--------------------------------------------------------------------------
*/

const getHealthTips = `
    SELECT *
    FROM health_tips
    WHERE active = true
    ORDER BY created_at DESC
`;


/*
|--------------------------------------------------------------------------
| SYMPTOM CHECKER
|--------------------------------------------------------------------------
*/

const getSymptoms = `
    SELECT *
    FROM symptoms
    ORDER BY name
`;

const getSymptomsByIds = `
    SELECT *
    FROM symptoms
    WHERE id = ANY($1)
`;


/*
|--------------------------------------------------------------------------
| DASHBOARD QUERIES
|--------------------------------------------------------------------------
*/

const totalPatients = `
    SELECT COUNT(*) AS total
    FROM users
    WHERE LOWER(role) = 'patient'
`;

const totalDoctors = `
    SELECT COUNT(*) AS total
    FROM doctors
`;

const totalAppointments = `
    SELECT COUNT(*) AS total
    FROM appointments
`;

const upcomingAppointments = `
    SELECT COUNT(*) AS total
    FROM appointments
    WHERE appointment_date >= CURRENT_DATE
      AND status = 'Confirmed'
`;

const getNurses = `
    SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at
    FROM users
    WHERE LOWER(role) = 'nurse'
    ORDER BY first_name, last_name
`;


/*
|--------------------------------------------------------------------------
| AI TRIAGE QUERIES
|--------------------------------------------------------------------------
*/

const insertAiPrediction = `
  INSERT INTO public.ai_predictions (
    patient_id,
    predicted_disease,
    confidence,
    model_name,
    model_version,
    input_data,
    priority,
    created_at
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
  RETURNING *;
`;

const getRecentAiPredictions = `
  SELECT
    id,
    patient_id,
    predicted_disease,
    confidence,
    model_name,
    model_version,
    input_data,
    priority,
    created_at
  FROM public.ai_predictions
  ORDER BY created_at DESC
  LIMIT 20
`;

const createPatient = `
  INSERT INTO users (
    first_name,
    last_name,
    email,
    phone,
    password,
    role
  )
  VALUES ($1, $2, $3, $4, $5, 'patient')
  RETURNING id, first_name, last_name, email, phone, role;
`;




/*
|--------------------------------------------------------------------------
| EXPORT QUERIES
|--------------------------------------------------------------------------
*/

module.exports = {
    // Users
    addUser,
    getUsers,
    getPatients,
    getUserById,
    getUserByEmail,
    deleteUser,

    // Nurses
    getNurses,

    // Doctors
    getDoctors,
    getDoctorById,
    getDoctorsByService,

    // Services
    getServices,
    getServiceById,

    // Appointments
    createAppointment,
    getAppointments,
    getAppointmentsByPatient,
    getAppointmentById,
    cancelAppointment,

    // Medical records
    getMedicalRecords,
    getMedicalRecordById,

    // Prescriptions
    getPrescriptions,

    // Messages
    getMessages,
    createMessage,
    markMessageRead,

    // Health tips
    getHealthTips,

    // Symptoms
    getSymptoms,
    getSymptomsByIds,

    // Dashboard
    totalPatients,
    totalDoctors,
    totalAppointments,
    upcomingAppointments,
    createPatient,

    // AI triage
    insertAiPrediction,
    getRecentAiPredictions,
};