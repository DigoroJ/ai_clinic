require('dotenv').config();

// Fail early with a clear message instead of strange 500 errors later.
const missingEnv = ['DATABASE_URL', 'JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY']
    .filter((name) => !process.env[name]);

if (missingEnv.length > 0) {
    console.error('Missing required .env variables:', missingEnv.join(', '));
    process.exit(1);
}

const express = require('express');
const cors = require('cors');

const router = require('./routes/routes');
const supabase = require('./supabase');
const { authenticate, authorize } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;


// ======================================================
// MIDDLEWARE
// ======================================================

// CORS_ORIGIN can hold one or more comma-separated frontend URLs,
// e.g. http://localhost:4200,https://your-app.netlify.app
// If it is not set, every origin is allowed (fine for local development).
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : true;

app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ======================================================
// ROOT / SERVER TEST
// ======================================================

app.get('/', (req, res) => {

    res.json({
        message: 'Mobile Clinic API is running',
        status: 'online',
        version: '1.0.0'
    });

});


// ======================================================
// SUPABASE CONNECTION TEST
// ======================================================

app.get('/api/test-supabase', authenticate, authorize('admin'), async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('services')
            .select('*')
            .limit(1);

        if (error) {

            console.error('Supabase error:', error);

            return res.status(500).json({
                success: false,
                message: 'Supabase connection failed',
                error: error.message
            });

        }

        res.json({
            success: true,
            message: 'Successfully connected to Supabase',
            data: data
        });

    } catch (error) {

        console.error('Supabase connection error:', error);

        res.status(500).json({
            success: false,
            message: 'Supabase connection failed',
            error: error.message
        });

    }

});


// ======================================================
// API ROUTES
// ======================================================

app.use('/api', router);


// ======================================================
// 404 - ROUTE NOT FOUND
// ======================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });

});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {

    console.error('Server error:', err);

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });

});


// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {

    console.log('======================================');
    console.log('     MOBILE CLINIC BACKEND API');
    console.log('======================================');
    console.log(`Server running on port: ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log('======================================');

});