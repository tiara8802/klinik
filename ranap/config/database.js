// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔧 Initializing database connection...');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emirs',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        
        // Release connection
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Test connection on startup
testConnection();

module.exports = pool;