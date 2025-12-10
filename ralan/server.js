const express = require('express');
const cors = require('cors');
const raianRoutes = require('./routes/ralan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', raianRoutes);

// Home Page
app.get('/', (req, res) => {
  res.json({
    message: '🏥 EMIRS API - RAWAT JALAN',
    version: '2.0.0',
    status: '✅ READY',
    endpoints: {
      get_pelayanan: 'GET /api/getpelayanan?no_pasien=374469&tanggal_pelayanan=2025-12-02',
      list_pasien: 'GET /api/list-pasien?tanggal=2025-12-02',
      detail_pasien: 'GET /api/detail-pasien/20251202120535',
      riwayat_pasien: 'GET /api/pasien/374469',
      list_poli: 'GET /api/list-poli',
      search_pasien: 'GET /api/search-pasien?keyword=LEVIA',
      rekap_bulanan: 'GET /api/rekap-bulanan?tahun=2025&bulan=12'
    },
    note: 'API menggunakan modular architecture dengan struktur terpisah'
  });
});

// Error Handling
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    available_endpoints: [
      '/api/getpelayanan',
      '/api/list-pasien',
      '/api/detail-pasien/:no_reg',
      '/api/pasien/:no_pasien',
      '/api/list-poli',
      '/api/search-pasien',
      '/api/rekap-bulanan'
    ]
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err.message);
  res.status(500).json({
    success: false, 
    message: 'Terjadi kesalahan pada server'
  });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
  🏥 EMIRS API - RAWAT JALAN
  ==============================
  📍 http://localhost:${PORT}
  
  ✅ MODULAR ARCHITECTURE READY
  
  📁 STRUCTURE:
  ├── controllers/raian.js
  ├── data/mockdata.js
  ├── helpers/helper.js
  ├── routes/raian.js
  └── server.js
  
  🚀 ENDPOINTS:
  1. GET /api/getpelayanan?no_pasien=374469
  2. GET /api/list-pasien?tanggal=2025-12-02
  3. GET /api/detail-pasien/20251202120535
  4. GET /api/pasien/374469
  5. GET /api/list-poli
  6. GET /api/search-pasien?keyword=LEVIA
  7. GET /api/rekap-bulanan?tahun=2025&bulan=12
  
  ✅ Server ready!`);
});