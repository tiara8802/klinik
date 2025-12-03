const mysql = require('mysql2/promise');

require('dotenv').config();



const pool = mysql.createPool({

  host: process.env.DB_HOST,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,

  port: process.env.DB_PORT || 3306,

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,

  // Tambahkan options untuk koneksi remote

  connectTimeout: 10000, // 10 detik timeout

  ssl: false // biasanya false untuk koneksi standar

});



// Test koneksi

pool.getConnection()

  .then(connection => {

    console.log('✅ Connected to REMOTE database:', process.env.DB_HOST);

    connection.release();

  })

  .catch(err => {

    console.error('❌ Remote DB connection failed:');

    console.error('Error:', err.message);

    console.error('Host:', process.env.DB_HOST);

    console.error('User:', process.env.DB_USER);

    console.error('DB:', process.env.DB_NAME);

  });



module.exports = pool;

