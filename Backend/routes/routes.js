const { Router } = require('express');

const controller = require('../controllers/controllers');
const clinical = require('../controllers/clinical.controller');

const {
    authenticate,
    authorize,
    staffOnly,
    ownerOrStaff,
    ownsRecord,
    forcePatientSelf,
    forcePatientRole,
    forceSender
} = require('../middleware/auth');

const router = Router();


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (no token needed)
|--------------------------------------------------------------------------
*/

router.get('/test', (req, res) => {
    res.json({ message: 'Mobile Clinic route working' });
});

// Public sign-up always creates a PATIENT account.
router.post('/signup', forcePatientRole, controller.addUser);

router.post('/login', controller.login);


/*
|--------------------------------------------------------------------------
| EVERYTHING BELOW REQUIRES A VALID LOGIN TOKEN
|--------------------------------------------------------------------------
*/

router.use(authenticate);

// Who am I? (used by the frontend to check the session)
router.get('/auth/me', controller.getCurrentUser);

// Only an admin can create doctor / nurse / admin accounts.
router.post('/users', authorize('admin'), controller.addUser);


/*
|--------------------------------------------------------------------------
| PATIENTS
|--------------------------------------------------------------------------
*/

router.get('/patients', staffOnly, controller.getPatients);

router.get('/patients/:id', ownerOrStaff('id'), controller.getPatientById);

router.post('/patients', authorize('admin', 'nurse'), controller.createPatient);

// Everything a nurse / doctor needs about one patient
router.get('/patients/:id/clinical-summary', staffOnly, clinical.getPatientClinicalSummary);


/*
|--------------------------------------------------------------------------
| SERVICES + DOCTORS (patients need these to book)
|--------------------------------------------------------------------------
*/

router.get('/services', controller.getServices);

router.get('/doctors', controller.getDoctors);

router.get('/doctors/:id', controller.getDoctorById);

router.get('/doctors/service/:serviceId', controller.getDoctorsByService);


/*
|--------------------------------------------------------------------------
| APPOINTMENTS
|--------------------------------------------------------------------------
*/

// A patient always books for themselves (patient_id is taken from the token).
router.post('/appointments', forcePatientSelf, controller.bookAppointment);

router.get('/appointments', staffOnly, controller.getAppointments);

router.get(
    '/appointments/patient/:patientId',
    ownerOrStaff('patientId'),
    controller.getAppointmentsByPatient
);

router.get(
    '/appointments/:id',
    ownsRecord('appointment'),
    controller.getAppointmentById
);

router.put(
    '/appointments/:id/cancel',
    ownsRecord('appointment'),
    controller.cancelAppointment
);

// Check in / complete / cancel (staff only; a doctor only for their own)
router.put('/appointments/:id/status', staffOnly, clinical.updateAppointmentStatus);


/*
|--------------------------------------------------------------------------
| MEDICAL RECORDS + PRESCRIPTIONS
|--------------------------------------------------------------------------
*/

router.get(
    '/medical-records/patient/:patientId',
    ownerOrStaff('patientId'),
    controller.getMedicalRecords
);

// Only a doctor writes medical records (linked to their doctor profile)
router.post('/medical-records', authorize('doctor'), clinical.createMedicalRecord);

router.get(
    '/medical-records/:id',
    ownsRecord('medicalRecord'),
    controller.getMedicalRecordById
);

router.get(
    '/prescriptions/patient/:patientId',
    ownerOrStaff('patientId'),
    controller.getPrescriptions
);


/*
|--------------------------------------------------------------------------
| MESSAGES
|--------------------------------------------------------------------------
*/

router.get('/messages/:patientId', ownerOrStaff('patientId'), controller.getMessages);

// The sender is always the logged-in user.
router.post('/messages', forceSender, controller.sendMessage);

// Only the recipient can mark a message as read.
router.put(
    '/messages/:id/read',
    ownsRecord('message', { staffBypass: false }),
    controller.markMessageRead
);


/*
|--------------------------------------------------------------------------
| HEALTH TIPS + SYMPTOMS
|--------------------------------------------------------------------------
*/

router.get('/health-tips', controller.getHealthTips);

router.get('/symptoms', controller.getSymptoms);


/*
|--------------------------------------------------------------------------
| STAFF DASHBOARD
|--------------------------------------------------------------------------
*/

router.get('/dashboard/stats', staffOnly, controller.getDashboardStats);

router.get('/nurses', staffOnly, controller.getNurses);

router.get('/nurse/queue', authorize('nurse', 'admin'), clinical.getNurseQueue);

router.post('/assessments', authorize('nurse', 'admin'), clinical.createAssessment);

router.get('/doctor/appointments', authorize('doctor'), clinical.getDoctorAppointments);


/*
|--------------------------------------------------------------------------
| AI / MACHINE LEARNING
|--------------------------------------------------------------------------
*/

router.get('/dataset/eda/current', authorize('admin'), controller.getCurrentDatasetEda);

router.get('/ai/analytics', authorize('admin', 'doctor'), controller.getAiAnalytics);

// Staff can predict for any patient; a patient only for themselves.
router.post('/ai/triage/predict', forcePatientSelf, controller.predictDisease);

router.get('/ai/triage/cases', staffOnly, controller.getRecentAiTriageCases);


module.exports = router;
