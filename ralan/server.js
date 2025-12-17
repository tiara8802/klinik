require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import database connection
const pool = require('./db');

// Import routes
const ralanRoutes = require('./routes/ralan');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log(`  Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`  Body:`, JSON.stringify(req.body));
  }
  next();
});

// Health check endpoint (sederhana)
app.get('/health', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      server: 'API EMIRS',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database test endpoint
app.get('/db-test', async (req, res) => {
  try {
    // Test multiple queries
    const [test1] = await pool.query('SELECT 1 as test_value');
    const [test2] = await pool.query('SELECT NOW() as server_time');
    const [test3] = await pool.query('SELECT DATABASE() as db_name');
    
    // Try to get EMIRS tables
    const emirsTables = [
      'poliklinik', 'pasien', 'reg_periksa', 'dokter', 
      'pegawai', 'penjab', 'resep_obat', 'resep_dokter'
    ];
    
    const tableStatus = [];
    for (const table of emirsTables) {
      try {
        const [check] = await pool.query(`SHOW TABLES LIKE '${table}'`);
        tableStatus.push({
          table: table,
          exists: check.length > 0
        });
      } catch (err) {
        tableStatus.push({
          table: table,
          exists: false,
          error: err.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Database connection successful',
      connection: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        port: process.env.DB_PORT || 3306
      },
      test_results: {
        basic_query: test1[0].test_value,
        server_time: test2[0].server_time,
        database_name: test3[0].db_name
      },
      tables_status: tableStatus
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: {
        code: error.code,
        message: error.message,
        sqlState: error.sqlState
      },
      connection_info: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      }
    });
  }
});

// API Routes
app.use('/api', ralanRoutes);

// Default route dengan semua endpoint yang tersedia
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    message: 'API Rumah Sakit E-MIRS',
    version: '2.0.0',
    status: 'online',
    server_time: new Date().toISOString(),
    database: {
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
      status: 'connected'
    },
    endpoints: {
      // System
      health_check: 'GET /health',
      database_test: 'GET /db-test',
      
      // Poliklinik
      get_all_poliklinik: 'GET /api/poliklinik',
      
      // Pasien
      detail_pasien: 'GET /api/detail-pasien/:no_reg',
      pasien_by_no: 'GET /api/pasien/:no_pasien',
      
      // Pelayanan
      pelayanan_by_pasien: 'GET /api/pelayanan-pasien/:no_pasien',
      pelayanan_by_date: 'GET /api/pelayanan-tanggal?tanggal=YYYY-MM-DD',
      pelayanan_detail: 'GET /api/pelayanan-detail/:no_reg',
      
      // Rekap
      rekap_bulanan: 'GET /api/rekap-bulanan',
      rekap_by_date: 'GET /api/rekap-bulanan?tanggal=YYYY-MM-DD', 
    },
    documentation: 'API untuk sistem E-MIRS Rumah Sakit'
  });
});

// Endpoint untuk melihat semua routes yang terdaftar
app.get('/routes', (req, res) => {
  const routes = [];
  
  function printRoutes(stack, parentPath = '') {
    stack.forEach((middleware) => {
      if (middleware.route) {
        const path = parentPath + middleware.route.path;
        routes.push({
          path: path,
          methods: Object.keys(middleware.route.methods)
        });
      } else if (middleware.name === 'router' && middleware.handle.stack) {
        const routerPath = parentPath + (middleware.regexp.toString().split('\\')[1] || '');
        printRoutes(middleware.handle.stack, routerPath);
      }
    });
  }
  
  printRoutes(app._router.stack);
  
  res.json({
    total_routes: routes.length,
    routes: routes
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    requested_url: req.originalUrl,
    method: req.method,
    suggestion: 'Cek endpoint yang tersedia di GET /'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Handle database errors
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error_code: err.code,
      error_message: err.message,
      suggestion: 'Periksa query SQL dan struktur database'
    });
  }
  
  // Handle connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Database connection refused',
      error: 'Tidak dapat terhubung ke database server',
      host: process.env.DB_HOST,
      suggestion: 'Periksa koneksi jaringan dan status database server'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Server startup
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, async () => {
  console.log(`
============================================
🚀 API EMIRS Server Started!
============================================
📡 Server  : http://${HOST}:${PORT}
📊 Database: ${process.env.DB_HOST}/${process.env.DB_NAME}
👤 User    : ${process.env.DB_USER}
⏰ Time    : ${new Date().toISOString()}
============================================
  `);
  
  // Test database connection on startup
  try {
    const [result] = await pool.query('SELECT 1 as status');
    console.log('✅ Database connection: SUCCESS');
    
    // Get database version
    const [version] = await pool.query('SELECT VERSION() as version');
    console.log(`📊 MySQL Version: ${version[0].version}`);
    
    // Count tables
    const [tables] = await pool.query("SHOW TABLES");
    console.log(`📁 Total tables: ${tables.length}`);
    
  } catch (error) {
    console.error('❌ Database connection: FAILED');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error('   Suggestion: Periksa koneksi database di file .env');
  }
  
  console.log('============================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  pool.end();
  process.exit(0);
});