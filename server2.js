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

// Mount routers
app.use('/api/ruangan', ruanganRoutes);
app.use('/api/rawat-inap', rawatInapRoutes);
app.use('/api/kamar', kamarRoutes);

// Home page
app.get('/', (req, res) => {
    res.json({
        message: '🏥 EMIRS BED MANAGEMENT API TERPADU',
        version: '3.0',
        endpoints: {
            ruangan: '/api/ruangan',
            rawat_inap: '/api/rawat-inap',
            kamar: '/api/kamar'
        },
        server: `http://localhost:${PORT}`
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan',
        help: 'Coba akses / untuk melihat semua endpoint'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('🔥 Error:', err.message);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    🏥 EMIRS BED MANAGEMENT API
    ============================
    📍 http://localhost:${PORT}
    
    ✅ ROUTERS TERPISAH:
    1. /api/ruangan     - Ketersediaan bed
    2. /api/rawat-inap  - Data rawat inap
    3. /api/kamar       - Data kamar
    
    ✅ SERVER READY!`);
});