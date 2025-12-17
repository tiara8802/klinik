const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('📡 Connecting to database...');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  ssl: false,
  charset: 'utf8mb4',
  timezone: '+07:00', // WIB
  decimalNumbers: true
});

// Test connection immediately
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    console.log(`   Thread ID: ${connection.threadId}`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:');
    console.error('   Error:', err.message);
    console.error('   Code:', err.code);
    console.error('   Host:', process.env.DB_HOST);
    console.error('   Please check:');
    console.error('   1. Is MySQL running on host?');
    console.error('   2. Are credentials correct?');
    console.error('   3. Is port 3306 open?');
    console.error('   4. Does user have remote access?');
  });

module.exports = pool;