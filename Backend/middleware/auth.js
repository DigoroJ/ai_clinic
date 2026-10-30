const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const STAFF_ROLES = ['admin', 'nurse', 'doctor'];


// ======================================================
// AUTHENTICATE
// Requires a valid "Authorization: Bearer <token>" header.
// Sets req.user = { id, role }.
// ======================================================

const authenticate = (req, res, next) => {

    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'Authentication required'
        });
    }

    try {

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: Number(payload.id),
            role: payload.role
        };

        return next();

    } catch (error) {

        const message =
            error.name === 'TokenExpiredError'
                ? 'Your session has expired. Please log in again.'
                : 'Invalid authentication token';

        return res.status(401).json({
            success: false,
            error: message,
            message
        });
    }
};


// ======================================================
// AUTHORIZE
// authorize('admin', 'nurse') -> only those roles may continue.
// Must be used after authenticate.
// ======================================================

const authorize = (...roles) => (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'You do not have permission to perform this action',
            message: 'You do not have permission to perform this action'
        });
    }

    return next();
};

const staffOnly = authorize(...STAFF_ROLES);


// ======================================================
// PATIENT OWNERSHIP HELPERS
// Patients may only touch their own data. Staff may touch any.
// ======================================================

// For URLs like /appointments/patient/:patientId
const ownerOrStaff = (param) => (req, res, next) => {

    if (STAFF_ROLES.includes(req.user.role)) {
        return next();
    }

    if (Number(req.params[param]) === req.user.id) {
        return next();
    }

    return res.status(403).json({
        success: false,
        error: 'You can only access your own information',
        message: 'You can only access your own information'
    });
};

// For request bodies that carry patient_id (booking, AI prediction).
// A logged-in patient can never act for another patient.
const forcePatientSelf = (req, res, next) => {

    if (req.user.role === 'patient') {
        req.body = req.body || {};
        req.body.patient_id = req.user.id;
    }

    return next();
};

// Public sign-up can only ever create patient accounts.
const forcePatientRole = (req, res, next) => {

    req.body = req.body || {};
    req.body.role = 'patient';

    if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters',
            message: 'Password must be at least 8 characters'
        });
    }

    if (typeof req.body.email === 'string') {
        req.body.email = req.body.email.trim().toLowerCase();
    }

    return next();
};

// Messages are always sent as the logged-in user.
const forceSender = (req, res, next) => {

    req.body = req.body || {};
    req.body.sender_id = req.user.id;

    return next();
};

// Fixed whitelist -> table/column names are never user input.
const OWNERSHIP = {
    appointment: { table: 'appointments', column: 'patient_id' },
    medicalRecord: { table: 'medical_records', column: 'patient_id' },
    message: { table: 'messages', column: 'recipient_id' }
};

// For URLs like /appointments/:id where the row has an owner.
// staffBypass=false means even staff must be the owner (messages).
const ownsRecord = (kind, { staffBypass = true } = {}) => {

    const { table, column } = OWNERSHIP[kind];

    return async (req, res, next) => {

        try {

            if (staffBypass && STAFF_ROLES.includes(req.user.role)) {
                return next();
            }

            const id = Number(req.params.id);

            if (!Number.isSafeInteger(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid id',
                    message: 'Invalid id'
                });
            }

            const result = await pool.query(
                `SELECT ${column} AS owner FROM ${table} WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Not found',
                    message: 'Not found'
                });
            }

            if (Number(result.rows[0].owner) !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only access your own information',
                    message: 'You can only access your own information'
                });
            }

            return next();

        } catch (error) {

            console.error('Ownership check error:', error);

            return res.status(500).json({
                success: false,
                error: 'Authorization check failed',
                message: 'Authorization check failed'
            });
        }
    };
};

module.exports = {
    STAFF_ROLES,
    authenticate,
    authorize,
    staffOnly,
    ownerOrStaff,
    ownsRecord,
    forcePatientSelf,
    forcePatientRole,
    forceSender
};
