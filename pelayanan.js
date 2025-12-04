// ====== TAMBAHKAN DI BARIS PALING ATAS ======
require('dotenv').config();
// ===========================================

const express = require('express');
const cors = require('cors');

// Import pool dengan error handling
let pool;
try {
  pool = require('./db');
  console.log('✅ Database module loaded successfully');
} catch (error) {
  console.error('❌ Error loading db module:', error.message);
  console.log('⚠️  Creating inline database connection...');
  
  // Fallback: create pool langsung jika db.js error
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emirs_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
  });
}

const app = express();

// Middleware dengan error handling
try {
  app.use(cors());
  app.use(express.json());
  console.log('✅ Middleware loaded successfully');
} catch (error) {
  console.error('❌ Middleware error:', error.message);
}

// ========================
// HELPER FUNCTIONS (TETAP SAMA)
// ========================
function formatRupiah(angka) {
  if (!angka && angka !== 0) return 'Rp 0';
  return 'Rp ' + parseFloat(angka).toLocaleString('id-ID');
}

function hitungUmur(tglLahir) {
  if (!tglLahir) return 'Tidak diketahui';
  try {
    const lahir = new Date(tglLahir);
    const sekarang = new Date();
    let tahun = sekarang.getFullYear() - lahir.getFullYear();
    let bulan = sekarang.getMonth() - lahir.getMonth();
    
    if (bulan < 0) {
      tahun--;
      bulan += 12;
    }
    
    return `${tahun} tahun${bulan > 0 ? ` ${bulan} bulan` : ''}`;
  } catch (e) {
    return 'Tidak diketahui';
  }
}

// MAPPING POLI
function getNamaPoli(kodePoli) {
  const mapping = {
    '0102005': 'POLI UMUM',
    '0102008': 'POLI GIGI', 
    '0102030': 'POLI ANAK',
    '0102001': 'POLI BEDAH',
    '0102002': 'POLI PENYAKIT DALAM',
    '0102003': 'POLI KANDUNGAN',
    '0102004': 'POLI THT',
    '0102006': 'POLI SARAF',
    '0102007': 'POLI KULIT',
    '0102009': 'POLI MATA',
    '0102010': 'IGD',
    '0102011': 'POLI JANTUNG',
    '0102012': 'POLI PARU'
  };
  return mapping[kodePoli] || `POLI ${kodePoli}`;
}

// MAPPING GOLONGAN
function getNamaGolongan(kode) {
  const mapping = {
    '11': 'UMUM / BAYAR',
    '12': 'BPJS',
    '13': 'ASURANSI',
    '14': 'PERUSAHAAN',
    '15': 'GRATIS'
  };
  return mapping[kode] || `GOLONGAN ${kode}`;
}

// ========================
// API 1: GET PELAYANAN - DENGAN ERROR HANDLING
// ========================
app.get('/api/getpelayanan', async (req, res) => {
  try {
    const { no_pasien, tanggal } = req.query;
    
    // Validasi
    if (!no_pasien || !tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Parameter no_pasien dan tanggal wajib diisi',
        contoh: '/api/getpelayanan?no_pasien=000011&tanggal=2025-10-02'
      });
    }
    
    console.log(`📋 Request: ${no_pasien} - ${tanggal}`);
    
    // QUERY dengan try-catch
    let rows;
    try {
      const query = `
        SELECT 
          p.no_pasien,
          p.nama_pasien,
          p.tgl_lahir,
          p.jenis_kelamin,
          p.alamat,
          p.telpon,
          p.pekerjaan,
          gp.keterangan as nama_golongan,
          pr.no_reg,
          pr.tanggal as tanggal_pelayanan,
          pr.no_antrian,
          pr.tujuan_poli,
          pr.dokter_poli,
          pr.status_pasien,
          pr.status_bayar,
          pr.diagnosa,
          pr.keterangan,
          pr.tindakan_operasi,
          pr.tarif_bpjs,
          pr.tarif_rumahsakit,
          pr.gol_pasien,
          pr.jam_masuk,
          pr.jam_keluar,
          pr.keadaan_pulang
        FROM pasien_ralan pr
        INNER JOIN pasien p ON pr.no_pasien = p.no_pasien
        LEFT JOIN gol_pasien gp ON pr.gol_pasien = gp.id_gol
        WHERE pr.no_pasien = ? 
          AND DATE(pr.tanggal) = DATE(?)
        ORDER BY pr.tanggal DESC
      `;
      
      [rows] = await pool.query(query, [no_pasien, tanggal]);
    } catch (dbError) {
      console.error('Database error:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Database query error: ' + dbError.message
      });
    }
    
    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        message: 'Tidak ada data ditemukan',
        data: []
      });
    }
    
    // Format response
    const firstRow = rows[0];
    
    const response = {
      success: true,
      message: '✅ Data berhasil diambil',
      jumlah_data: rows.length,
      info_pasien: {
        no_pasien: firstRow.no_pasien,
        nama: firstRow.nama_pasien,
        tgl_lahir: firstRow.tgl_lahir,
        usia: hitungUmur(firstRow.tgl_lahir),
        jenis_kelamin: firstRow.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        alamat: firstRow.alamat,
        telepon: firstRow.telpon
      },
      info_golongan: {
        kode: firstRow.gol_pasien,
        nama: firstRow.nama_golongan || getNamaGolongan(firstRow.gol_pasien)
      },
      data_pelayanan: rows.map((row, index) => {
        const tarifBpjs = parseFloat(row.tarif_bpjs) || 0;
        const tarifRumahSakit = parseFloat(row.tarif_rumahsakit) || 0;
        const total = tarifBpjs + tarifRumahSakit;
        
        return {
          no: index + 1,
          registrasi: {
            no_reg: row.no_reg,
            no_antrian: row.no_antrian,
            tanggal: row.tanggal_pelayanan,
            jam: {
              masuk: row.jam_masuk,
              keluar: row.jam_keluar
            }
          },
          klinik: {
            poli: {
              kode: row.tujuan_poli,
              nama: getNamaPoli(row.tujuan_poli)
            },
            dokter: row.dokter_poli,
            status: row.status_pasien
          },
          tarif: {
            bpjs: {
              nilai: tarifBpjs,
              rupiah: formatRupiah(tarifBpjs)
            },
            rumah_sakit: {
              nilai: tarifRumahSakit,
              rupiah: formatRupiah(tarifRumahSakit)
            },
            total: {
              nilai: total,
              rupiah: formatRupiah(total)
            }
          },
          pembayaran: row.status_bayar,
          medis: {
            diagnosa: row.diagnosa || '-',
            tindakan: row.tindakan_operasi || '-',
            catatan: row.keterangan || '-'
          },
          pulang: row.keadaan_pulang || '-'
        };
      })
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// ========================
// API 2: CEK DATA TARIF (SIMPLE VERSION)
// ========================
app.get('/api/cek-tarif/:no_pasien', async (req, res) => {
  try {
    const { no_pasien } = req.params;
    
    const [rows] = await pool.query(`
      SELECT tanggal, tujuan_poli, tarif_bpjs, tarif_rumahsakit, gol_pasien, status_bayar
      FROM pasien_ralan 
      WHERE no_pasien = ?
      ORDER BY tanggal DESC
      LIMIT 10
    `, [no_pasien]);
    
    res.json({
      success: true,
      no_pasien: no_pasien,
      jumlah_transaksi: rows.length,
      detail: rows
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ========================
// HOME PAGE
// ========================
app.get('/', (req, res) => {
  res.json({
    message: '🏥 EMIRS API - READY',
    endpoint: 'GET /api/getpelayanan?no_pasien=...&tanggal=...',
    contoh: 'http://localhost:3000/api/getpelayanan?no_pasien=000011&tanggal=2025-10-02'
  });
});

// ========================
// HEALTH CHECK
// ========================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'emirs-api'
  });
});

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🏥 EMIRS API SERVER
  ===================
  📍 http://localhost:${PORT}
  📊 Health: http://localhost:${PORT}/health
  ✅ Endpoint: GET /api/getpelayanan?no_pasien=...&tanggal=...
  
  ✅ Server ready!`);
});