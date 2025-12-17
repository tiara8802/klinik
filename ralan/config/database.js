const mysql = require('mysql2');
require('dotenv').config();

// Buat connection pool untuk lebih baik
const pool = mysql.createPool({
    host: process.env.DB_HOST || '103.175.220.185',
    user: process.env.DB_USER || 'smkn1',
    password: process.env.DB_PASSWORD || '5mkn1@2025',
    database: process.env.DB_NAME || 'emirs',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
        console.log('📌 Pastikan:');
        console.log('1. MySQL berjalan');
        console.log('2. Database "' + (process.env.DB_NAME || 'db_apotek') + '" ada');
        console.log('3. Username/password benar di file .env');
        process.exit(1);
    } else {
        console.log('✅ Connected to MySQL database');
        connection.release();
    }
});

module.exports = pool.promise(); // Pakai promise untuk async/await