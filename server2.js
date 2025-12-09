const express = require('express');
const cors = require('cors');
const app = express();

// Import routers
const ruanganRoutes = require('./routes/ruangan');
const rawatInapRoutes = require('./routes/ranap');
const kamarRoutes = require('./routes/kamar');

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Mount routers
app.use('/api/ruangan', ruanganRoutes);
app.use('/api/ranap', rawatInapRoutes);
app.use('/api/kamar', kamarRoutes);

// API Check Database (dari file lama)
app.get('/api/check-db', async (req, res) => {
    try {
        const pool = require('./db');
        const [result] = await pool.query('SELECT NOW() as timestamp');
        res.json({
            success: true,
            message: 'Database connection OK',
            timestamp: result[0].timestamp,
            api: 'EMIRS Bed Management API v3.0'
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Home page
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏥 EMIRS BED MANAGEMENT API TERPADU',
        version: '3.0',
        timestamp: new Date().toISOString(),
        description: 'API untuk manajemen bed, rawat inap, dan kamar rumah sakit',
        endpoints: {
            ruangan: {
                base: '/api/ruangan',
                endpoints: [
                    'GET /ketersediaan-bed - Data ketersediaan bed per ruangan',
                    'GET /ketersediaan-bed/tabel - Format tabel SS3',
                    'GET / - List semua ruangan'
                ]
            },
            ranap: {
                base: '/api/ranap',
                endpoints: [
                    'GET /list - List pasien rawat inap',
                    'GET /detail/:no_reg - Detail pasien',
                    'GET /pasien/:no_rm - Riwayat pasien',
                    'POST /update-status - Update status pasien',
                    'GET /statistik - Statistik rawat inap'
                ]
            },
            kamar: {
                base: '/api/kamar',
                endpoints: [
                    'GET /okupansi - Data okupansi kamar',
                    'GET /status - Data kamar dengan status',
                    'GET /tersedia - Kamar tersedia',
                    'GET / - Data kamar dari database'
                ]
            },
            system: {
                base: '/api',
                endpoints: [
                    'GET /check-db - Cek koneksi database'
                ]
            }
        },
        server: {
            host: 'localhost',
            port: 3000,
            url: 'http://localhost:3000'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use((req, res) => {
    console.warn(`⚠️  Endpoint tidak ditemukan: ${req.method} ${req.url}`);
    
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan',
        requested_url: req.url,
        requested_method: req.method,
        help: 'Coba akses / untuk melihat semua endpoint yang tersedia',
        available_endpoints: [
            'GET /',
            'GET /health',
            'GET /api/ruangan/ketersediaan-bed',
            'GET /api/ranap/list',
            'GET /api/kamar/okupansi'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', {
        message: err.message,
        url: req.url,
        method: req.method
    });
    
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🏥 EMIRS BED MANAGEMENT API TERPADU
    =====================================
    📍 Server berjalan di: http://localhost:${PORT}
    
    ✅ MODUL 1: KETERSEDIAAN BED
    - GET /api/ruangan/ketersediaan-bed
    - GET /api/ruangan/ketersediaan-bed/tabel
    
    ✅ MODUL 2: RAWAT INAP
    - GET /api/ranap/list
    - GET /api/ranap/detail/:no_reg
    - POST /api/ranap/update-status
    
    ✅ MODUL 3: KAMAR & OKUPANSI
    - GET /api/kamar/okupansi
    - GET /api/kamar/status
    
    ✅ SYSTEM
    - GET /api/check-db
    - GET /health
    
    ✅ SERVER READY!`);
    
    console.log(`\n📋 Contoh URL untuk testing:`);
    console.log(`👉 http://localhost:${PORT}/`);
    console.log(`👉 http://localhost:${PORT}/api/ruangan/ketersediaan-bed`);
    console.log(`👉 http://localhost:${PORT}/api/ranap/list`);
});