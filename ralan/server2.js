const express = require('express');
const cors = require('cors');
const raianRoutes = require('./routes/ralan');
const apotekRoutes = require('./routes/apotek');
const resumeRoutes = require('./routes/resume');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', raianRoutes);           // Rawat Jalan
app.use('/api/apotek', apotekRoutes);   // Apotek
app.use('/api/resume', resumeRoutes);   // Resume Medis

// Home Page - Update endpoints LENGKAP
app.get('/', (req, res) => {
  res.json({
    message: '🏥 EMIRS API - SISTEM INFORMASI RUMAH SAKIT LENGKAP',
    version: '4.0.0',
    status: '✅ READY',
    timestamp: new Date().toISOString(),
    author: 'Tim Pengembang RS',
    
    modules: {
      rawat_jalan: {
        deskripsi: 'Modul pelayanan rawat jalan',
        endpoints: {
          get_pelayanan: 'GET /api/getpelayanan?no_pasien=374469&tanggal_pelayanan=2025-12-02',
          list_pasien: 'GET /api/list-pasien?tanggal=2025-12-02',
          detail_pasien: 'GET /api/detail-pasien/20251202120535',
          riwayat_pasien: 'GET /api/pasien/374469',
          list_poli: 'GET /api/list-poli',
          search_pasien: 'GET /api/search-pasien?keyword=LEVIA',
          rekap_bulanan: 'GET /api/rekap-bulanan?tahun=2025&bulan=12'
        }
      },
      apotek: {
        deskripsi: 'Modul pelayanan apotek dan resep',
        endpoints: {
          resep_pasien: 'GET /api/apotek/resep-pasien?no_pasien=374469&tanggal_pelayanan=2025-12-02',
          list_resep: 'GET /api/apotek/list-resep?tanggal=2025-12-02',
          detail_resep: 'GET /api/apotek/detail-resep/RES001',
          obat_by_reg: 'GET /api/apotek/obat-reg/20251202120535'
        }
      },
      resume_medis: {
        deskripsi: 'Modul resume medis dengan JOIN pasien_ralan + pasien_igd',
        endpoints: {
          resume_medis: 'GET /api/resume/resume-medis?no_pasien=374469&tanggal_pelayanan=2025-12-02&jenis_pelayanan=ralan',
          detail_soap: 'GET /api/resume/detail-soap/20251202120535',
          riwayat_soap: 'GET /api/resume/riwayat-soap/374469?tahun=2025&bulan=12&limit=10',
          search_resume: 'GET /api/resume/search-resume?keyword=sesak&tipe=igd&tanggal_awal=2025-12-01&tanggal_akhir=2025-12-31'
        },
        fitur_khusus: [
          'JOIN tabel pasien_ralan dan pasien_igd',
          'Format SOAP lengkap (Subjective, Objective, Assessment, Plan)',
          'Analisis statistik kesehatan pasien',
          'Timeline kunjungan terintegrasi',
          'Pencarian cerdas dengan berbagai filter'
        ]
      }
    },
    
    contoh_penggunaan: {
      contoh_1: 'Resume medis pasien 374469: GET /api/resume/resume-medis?no_pasien=374469',
      contoh_2: 'Detail SOAP kunjungan IGD: GET /api/resume/detail-soap/IGD20251202143000',
      contoh_3: 'Riwayat 10 kunjungan terakhir: GET /api/resume/riwayat-soap/374469?limit=10',
      contoh_4: 'Cari kunjungan dengan keyword: GET /api/resume/search-resume?keyword=vertigo'
    },
    
    catatan: 'API menggunakan modular architecture dengan struktur terpisah dan JOIN database yang optimal'
  });
});

// Error Handling LENGKAP
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    timestamp: new Date().toISOString(),
    
    modules_tersedia: {
      rawat_jalan: {
        base_path: '/api',
        contoh: '/api/getpelayanan?no_pasien=374469'
      },
      apotek: {
        base_path: '/api/apotek',
        contoh: '/api/apotek/resep-pasien?no_pasien=374469'
      },
      resume_medis: {
        base_path: '/api/resume',
        contoh: '/api/resume/resume-medis?no_pasien=374469'
      }
    },
    
    tips: {
      tip_1: 'Gunakan parameter no_pasien untuk mengakses data spesifik pasien',
      tip_2: 'Gunakan tanggal_pelayanan untuk filter berdasarkan tanggal',
      tip_3: 'Gunakan limit untuk membatasi jumlah data yang ditampilkan',
      tip_4: 'Periksa dokumentasi lengkap di endpoint root (/)'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Global error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({
    success: false, 
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    request_id: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });
});

// Start Server dengan informasi LENGKAP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🏥 EMIRS API - SISTEM INFORMASI RUMAH SAKIT LENGKAP
  ========================================================
  📍 Server berjalan di: http://localhost:${PORT}
  ⏰ Waktu mulai: ${new Date().toLocaleString()}
  🚀 Mode: ${process.env.NODE_ENV || 'development'}
  
  ✅ MODULAR ARCHITECTURE READY
  
  📁 STRUKTUR APLIKASI:
  ├── controllers/
  │   ├── raian.js              # Controller Rawat Jalan
  │   ├── apotek.js   # Controller Apotek
  │   └── resume.js   # Controller Resume Medis (NEW)
  ├── data/
  │   ├── mockdata.js           # Data Rawat Jalan
  │   ├── apotek.js         # Data Apotek
  │   └── resume.js         # Data Resume Medis (NEW)
  ├── helpers/
  │   └── helper.js             # Helper functions
  ├── routes/
  │   ├── raian.js              # Routes Rawat Jalan
  │   ├── apotek.js       # Routes Apotek
  │   └── resume.js       # Routes Resume Medis (NEW)
  └── server.js                 # Server utama
  
  🚀 MODUL RAWAT JALAN:
  1.  GET /api/getpelayanan?no_pasien=374469
  2.  GET /api/list-pasien?tanggal=2025-12-02
  3.  GET /api/detail-pasien/20251202120535
  4.  GET /api/pasien/374469
  5.  GET /api/list-poli
  6.  GET /api/search-pasien?keyword=LEVIA
  7.  GET /api/rekap-bulanan?tahun=2025&bulan=12
  
  🚀 MODUL APOTEK:
  1.  GET /api/apotek/resep-pasien?no_pasien=374469
  2.  GET /api/apotek/list-resep?tanggal=2025-12-02
  3.  GET /api/apotek/detail-resep/RES001
  4.  GET /api/apotek/obat-reg/20251202120535
  
  🚀 MODUL RESUME MEDIS (BARU - LENGKAP):
  1.  GET /api/resume/resume-medis?no_pasien=374469
      ↳ JOIN pasien_ralan + pasien_igd dengan parameter no_pasien/no_rm
      ↳ Filter by tanggal_pelayanan dan jenis_pelayanan
      ↳ Format SOAP lengkap (keluhan_utama, S, O, A, P)
      
  2.  GET /api/resume/detail-soap/20251202120535
      ↳ Detail lengkap SOAP by no_reg
      ↳ Support both Ralan dan IGD
      ↲ Informasi lengkap tim medis, lokasi, tindakan
      
  3.  GET /api/resume/riwayat-soap/374469?tahun=2025&limit=10
      ↳ Riwayat kunjungan all time
      ↳ Filter by tahun, bulan, limit
      ↳ Analisis statistik dan tren kesehatan
      
  4.  GET /api/resume/search-resume?keyword=sesak&tipe=igd
      ↳ Pencarian cerdas dengan berbagai filter
      ↳ Support keyword, tipe, rentang tanggal
      ↲ Highlight match type
  
  📊 FITUR UTAMA RESUME MEDIS:
  ✓ JOIN tabel pasien_ralan (PK: no_pasien, no_reg) + pasien_igd (PK: no_rm, no_reg)
  ✓ Format SOAP lengkap dengan keluhan_utama, S, O, A, P
  ✓ Analisis statistik kesehatan pasien
  ✓ Timeline kunjungan terintegrasi Ralan & IGD
  ✓ Rekomendasi tindak lanjut medis
  ✓ Pencarian cerdas dengan berbagai parameter
  
  🔗 CONTOH TEST RESUME MEDIS:
  ↪ http://localhost:${PORT}/api/resume/resume-medis?no_pasien=374469
  ↪ http://localhost:${PORT}/api/resume/detail-soap/IGD20251202143000
  ↪ http://localhost:${PORT}/api/resume/riwayat-soap/374469?limit=5
  ↪ http://localhost:${PORT}/api/resume/search-resume?keyword=darah&tipe=igd
  
  ⚡ READY FOR PRODUCTION!
  `);
});