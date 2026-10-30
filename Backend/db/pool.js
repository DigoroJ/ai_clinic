const { Pool } = require('pg');

// One shared PostgreSQL pool for the whole backend
// (controllers and middleware import this file).
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;
