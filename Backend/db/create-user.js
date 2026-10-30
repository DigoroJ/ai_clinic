// Create (or reset the password of) a user from the command line.
//
// Usage (run inside the Backend folder):
//   node db/create-user.js <email> <password> <role> "<First name>" "<Last name>" [doctorId]
//
// For role "doctor", pass the id of the row in the doctors table so this
// login is linked to that doctor profile (the doctor dashboard needs it).
//
// Example:
//   node db/create-user.js admin@clinic.com "Admin#12345" admin Clinic Admin
//
// Roles: patient | doctor | nurse | admin

require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('./pool');

const ROLES = ['patient', 'doctor', 'nurse', 'admin'];

(async () => {

    const [email, password, role, firstName, lastName, doctorId] = process.argv.slice(2);

    if (!email || !password || !ROLES.includes(role) || !firstName || !lastName) {
        console.error('Usage: node db/create-user.js <email> <password> <role> "<First name>" "<Last name>" [doctorId]');
        console.error('Roles:', ROLES.join(' | '));
        process.exit(1);
    }

    if (password.length < 8) {
        console.error('Password must be at least 8 characters.');
        process.exit(1);
    }

    if (doctorId && (role !== 'doctor' || !/^\d+$/.test(doctorId))) {
        console.error('doctorId must be a number and only works with role "doctor".');
        process.exit(1);
    }

    try {

        const hash = await bcrypt.hash(password, 10);

        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        let userId;

        if (existing.rows.length > 0) {

            userId = existing.rows[0].id;

            await pool.query(
                'UPDATE users SET password = $1, role = $2 WHERE id = $3',
                [hash, role, userId]
            );

            console.log(`Updated existing user #${userId} (${email}) -> role ${role}`);

        } else {

            const result = await pool.query(
                `INSERT INTO users (first_name, last_name, email, password, role)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [firstName, lastName, email.toLowerCase(), hash, role]
            );

            userId = result.rows[0].id;

            console.log(`Created ${role} #${userId} (${email})`);
        }

        if (doctorId) {

            const link = await pool.query(
                'UPDATE doctors SET user_id = $1 WHERE id = $2 RETURNING id, name',
                [userId, doctorId]
            );

            if (link.rows.length === 0) {
                console.error(`No doctor with id ${doctorId} in the doctors table - login created but not linked.`);
                process.exitCode = 1;
            } else {
                console.log(`Linked to doctor #${link.rows[0].id} (${link.rows[0].name})`);
            }
        }

    } catch (error) {

        console.error('Could not create user:', error.message);
        process.exitCode = 1;

    } finally {

        await pool.end();
    }
})();
