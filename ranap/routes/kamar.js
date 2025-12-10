const express = require('express');
const router = express.Router();
const pool = require('../db');

// Data okupansi kamar
const dataOkupansi = [
  { ruangan: 'KIRANA', tt: 7, d: 2, u: 0, epj5: 3, pr3h: 0, jamish: 5, bor: 14, persentase: 71.43 },
  { ruangan: 'KARTIKA', tt: 17, d: 1, u: 0, epj5: 9, pr3h: 0, jamish: 10, bor: 36, persentase: 58.82 },
  { ruangan: 'WIDYA', tt: 19, d: 1, u: 0, epj5: 11, pr3h: 0, jamish: 12, bor: 29, persentase: 63.16 },
  { ruangan: 'ICU', tt: 18, d: 1, u: 0, epj5: 9, pr3h: 0, jamish: 10, bor: 57, persentase: 56.56 },
  { ruangan: 'YUDHA', tt: 30, d: 1, u: 0, epj5: 22, pr3h: 2, jamish: 25, bor: 83, persentase: 83.33 },
  { ruangan: 'HESTI (BAT)', tt: 10, d: 0, u: 0, epj5: 5, pr3h: 0, jamish: 5, bor: 15, persentase: 50.00 },
  { ruangan: 'KEKICANA', tt: 30, d: 3, u: 0, epj5: 12, pr3h: 1, jamish: 16, bor: 47, persentase: 53.33 },
  { ruangan: 'PLISRA', tt: 28, d: 3, u: 0, epj5: 16, pr3h: 0, jamish: 19, bor: 63, persentase: 67.86 },
  { ruangan: 'PRATAMA', tt: 27, d: 0, u: 0, epj5: 25, pr3h: 0, jamish: 25, bor: 85, persentase: 92.59 },
  { ruangan: 'NICU', tt: 4, d: 0, u: 0, epj5: 0, pr3h: 0, jamish: 0, bor: 0, persentase: 0.00 },
  { ruangan: 'CHANDRA', tt: 14, d: 0, u: 0, epj5: 4, pr3h: 0, jamish: 4, bor: 15, persentase: 28.57 }
];

// Helper functions
function getKelasFromRuangan(ruangan) {
  const kelasMap = {
    'KIRANA': 'KLS01',
    'KARTIKA': 'KLS01',
    'WIDYA': 'KLS02',
    'ICU': 'ICU',
    'YUDHA': 'KLS03',
    'HESTI (BAT)': 'KLS02',
    'KEKICANA': 'KLS03',
    'PLISRA': 'KLS02',
    'PRATAMA': 'KLS01',
    'NICU': 'NICU',
    'CHANDRA': 'KLS03'
  };
  return kelasMap[ruangan] || 'KLS01';
}

function getNamaKelasFromRuangan(ruangan) {
  const namaKelasMap = {
    'KIRANA': 'Kelas 1',
    'KARTIKA': 'Kelas 1',
    'WIDYA': 'Kelas 2',
    'ICU': 'Intensive Care Unit',
    'YUDHA': 'Kelas 3',
    'HESTI (BAT)': 'Kelas 2',
    'KEKICANA': 'Kelas 3',
    'PLISRA': 'Kelas 2',
    'PRATAMA': 'Kelas 1',
    'NICU': 'Neonatal ICU',
    'CHANDRA': 'Kelas 3'
  };
  return namaKelasMap[ruangan] || 'Kelas 1';
}

// Helper function untuk konversi status dari database
function convertStatusFromDB(statusKamar) {
  // Jika dari database: 'ISI' = terisi = 1, 'KOSONG' = kosong = 0
  if (statusKamar === 'ISI' || statusKamar === 'Terisi' || statusKamar === 'terisi') {
    return {
      status_kamar: 1,
      status_text: 'terisi'
    };
  } else {
    return {
      status_kamar: 0,
      status_text: 'kosong'
    };
  }
}

// API 1: DATA OKUPANSI KAMAR
router.get('/okupansi', async (req, res) => {
  try {
    console.log(`✅ Data okupansi kamar`);
    
    const totalJamishPaster = dataOkupansi.reduce((sum, item) => sum + item.jamish, 0);
    const totalBor = dataOkupansi.reduce((sum, item) => sum + item.bor, 0);
    const totalPersentase = dataOkupansi.length > 0 
      ? dataOkupansi.reduce((sum, item) => sum + item.persentase, 0) / dataOkupansi.length 
      : 0;

    const response = {
      success: true,
      message: `✅ Data okupansi ${dataOkupansi.length} ruangan ditemukan`,
      data: dataOkupansi.map((item, index) => ({
        no: index + 1,
        ruangan: item.ruangan,
        kode_ruangan: `RG${(index + 1).toString().padStart(2, '0')}`,
        total_tempat_tidur: item.tt,
        terisi: item.jamish,
        kosong: item.tt - item.jamish,
        persentase_okupansi: item.persentase.toFixed(2) + '%',
        detail: {
          d: item.d,
          u: item.u,
          epj5: item.epj5,
          pr3h: item.pr3h,
          jamish: item.jamish,
          bor: item.bor
        }
      })),
      summary: {
        total_tt: dataOkupansi.reduce((sum, item) => sum + item.tt, 0),
        total_kosong: dataOkupansi.reduce((sum, item) => sum + (item.tt - item.jamish), 0),
        total_terisi: dataOkupansi.reduce((sum, item) => sum + item.jamish, 0),
        total_pasien: dataOkupansi.reduce((sum, item) => sum + item.bor, 0),
        persentase_okupansi: totalPersentase.toFixed(2) + '%'
      },
      catatan: {
        status_kamar: '1 = terisi, 0 = kosong',
        status_text: 'terisi/kosong'
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data okupansi'
    });
  }
});

// API 2: DATA KAMAR DENGAN STATUS (DARI DATA MOCK OKUPANSI)
router.get('/status', async (req, res) => {
  try {
    const { status_kamar, kode_ruangan } = req.query;
    
    console.log(`✅ Data kamar dengan status: status_kamar=${status_kamar}, kode_ruangan=${kode_ruangan}`);
    
    // Generate data kamar dari data okupansi - DIPERBAIKI: 1=terisi, 0=kosong
    let kamarList = [];
    
    dataOkupansi.forEach((ruangan, idx) => {
      const kodeRuang = `RG${(idx + 1).toString().padStart(2, '0')}`;
      const jumlahTerisi = ruangan.jamish;
      const jumlahKosong = ruangan.tt - ruangan.jamish;
      
      // Kamar terisi - STATUS KAMAR = 1
      for (let i = 1; i <= jumlahTerisi; i++) {
        kamarList.push({
          kode_kamar: `${kodeRuang}-${i.toString().padStart(2, '0')}`,
          kode_ruangan: kodeRuang,
          nama_ruangan: ruangan.ruangan,
          kode_kelas: getKelasFromRuangan(ruangan.ruangan),
          nama_kelas: getNamaKelasFromRuangan(ruangan.ruangan),
          status_kamar: 'terisi', // 1 = terisi (DIPERBAIKI)
          status_text: 1,
          bed_number: i,
          is_occupied: true
        });
      }
      
      // Kamar kosong - STATUS KAMAR = 0
      for (let i = 1; i <= jumlahKosong; i++) {
        kamarList.push({
          kode_kamar: `${kodeRuang}-K${i.toString().padStart(2, '0')}`,
          kode_ruangan: kodeRuang,
          nama_ruangan: ruangan.ruangan,
          kode_kelas: getKelasFromRuangan(ruangan.ruangan),
          nama_kelas: getNamaKelasFromRuangan(ruangan.ruangan),
          status_kamar: 'kosong', // 0 = kosong (DIPERBAIKI)
          status_text: 0,
          bed_number: i,
          is_occupied: false
        });
      }
    });
    
    // Filter by status_kamar
    if (status_kamar !== undefined) {
      const statusInt = parseInt(status_kamar);
      kamarList = kamarList.filter(k => k.status_kamar === statusInt);
    }
    
    // Filter by kode_ruangan
    if (kode_ruangan) {
      kamarList = kamarList.filter(k => k.kode_ruangan === kode_ruangan);
    }
    
    // Hitung statistik
    const totalKamar = kamarList.length;
    const terisi = kamarList.filter(k => k.status_kamar === 1).length;
    const kosong = kamarList.filter(k => k.status_kamar === 0).length;
    
    const response = {
      success: true,
      message: `✅ ${kamarList.length} kamar ditemukan`,
      filter: {
        status_kamar: status_kamar || 'Semua',
        kode_ruangan: kode_ruangan || 'Semua'
      },
      statistik: {
        total_kamar: totalKamar,
        terisi: terisi,
        kosong: kosong,
        persentase_terisi: totalKamar > 0 ? ((terisi / totalKamar) * 100).toFixed(2) + '%' : '0%',
        persentase_kosong: totalKamar > 0 ? ((kosong / totalKamar) * 100).toFixed(2) + '%' : '0%'
      },
      data: kamarList,
      catatan_status: {
        '1': 'Kamar terisi',
        '0': 'Kamar kosong'
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data kamar'
    });
  }
});

// API 3: KAMAR TERSEDIA UNTUK RAWAT INAP (MOCK DATA)
router.get('/tersedia', async (req, res) => {
  try {
    const { kelas, status } = req.query;
    
    console.log(`✅ Data kamar tersedia: kelas=${kelas}, status=${status}`);
    
    // Data mock kamar dengan status yang benar: 1=terisi, 0=kosong
    const kamarList = [
      { no_kamar: '01', kelas: 'VIP DELUXE', no_bed: 'A', status_kamar: 1, status_text: 'terisi' },
      { no_kamar: '01', kelas: 'VIP DELUXE', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '02', kelas: 'VIP DELUXE', no_bed: 'A', status_kamar: 1, status_text: 'terisi' },
      { no_kamar: '02', kelas: 'VIP DELUXE', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '03', kelas: 'VIP DELUXE', no_bed: 'A', status_kamar: 1, status_text: 'terisi' },
      { no_kamar: '03', kelas: 'VIP DELUXE', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '04', kelas: 'VIP DELUXE', no_bed: 'A', status_kamar: 1, status_text: 'terisi' },
      { no_kamar: '04', kelas: 'VIP DELUXE', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '05', kelas: 'VIP DELUXE', no_bed: 'A', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '05', kelas: 'VIP DELUXE', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '06', kelas: 'VIP PREMIUM', no_bed: 'A', status_kamar: 1, status_text: 'terisi' },
      { no_kamar: '06', kelas: 'VIP PREMIUM', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '07', kelas: 'VIP PREMIUM', no_bed: 'A', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '07', kelas: 'VIP PREMIUM', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '08', kelas: 'KELAS I', no_bed: 'A', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '08', kelas: 'KELAS I', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '09', kelas: 'KELAS I', no_bed: 'A', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '09', kelas: 'KELAS I', no_bed: 'B', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '10', kelas: 'KELAS II', no_bed: 'A', status_kamar: 0, status_text: 'kosong' },
      { no_kamar: '10', kelas: 'KELAS II', no_bed: 'B', status_kamar: 0, status_text: 'kosong' }
    ];
    
    let filteredKamar = [...kamarList];
    
    // Filter by kelas
    if (kelas && kelas !== 'all') {
      filteredKamar = filteredKamar.filter(k => k.kelas === kelas);
    }
    
    // Filter by status (parameter status di query bisa '1' atau '0' atau 'terisi'/'kosong')
    if (status && status !== 'all') {
      if (status === '1' || status === 'terisi') {
        filteredKamar = filteredKamar.filter(k => k.status_kamar === 1);
      } else if (status === '0' || status === 'kosong') {
        filteredKamar = filteredKamar.filter(k => k.status_kamar === 0);
      }
    }
    
    // Mock data pasien (untuk kamar terisi)
    const mockRawatInap = [
      { kamar: '01', no_bed: 'A', nama_pasien: 'SARINAH PASARIBU. NN' },
      { kamar: '02', no_bed: 'A', nama_pasien: 'SAVANNA KHAIR RIATIMJ.A. AN' },
      { kamar: '03', no_bed: 'A', nama_pasien: 'FATHIAN ALMAIR MUNANDAR. AN' },
      { kamar: '04', no_bed: 'A', nama_pasien: 'MUSTATI BINTI MUKANAN. NY' },
      { kamar: '06', no_bed: 'A', nama_pasien: 'IWAN TORO .TN' }
    ];
    
    const response = {
      success: true,
      message: `✅ ${filteredKamar.length} kamar ditemukan`,
      filter: {
        kelas: kelas || 'Semua',
        status: status || 'Semua'
      },
      statistik: {
        total_kamar: filteredKamar.length,
        terisi: filteredKamar.filter(k => k.status_kamar === 1).length,
        kosong: filteredKamar.filter(k => k.status_kamar === 0).length,
        persentase: filteredKamar.length > 0 
          ? ((filteredKamar.filter(k => k.status_kamar === 1).length / filteredKamar.length) * 100).toFixed(1) + '%' 
          : '0%'
      },
      data_kamar: filteredKamar.map((k, i) => ({
        no: i + 1,
        no_kamar: k.no_kamar,
        kelas: k.kelas,
        no_bed: k.no_bed,
        status_kamar: k.status_kamar,
        status_text: k.status_text,
        pasien: k.status_kamar === 1 ? 
          mockRawatInap.find(p => p.kamar === k.no_kamar && p.no_bed === k.no_bed)?.nama_pasien || 'Tidak diketahui' 
          : 'Tersedia'
      })),
      catatan_status: {
        'status_kamar: 1': 'Kamar terisi',
        'status_kamar: 0': 'Kamar kosong/tersedia'
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: true,
      message: '✅ Data kamar tersedia',
      data_kamar: []
    });
  }
});

// API 4: DATA KAMAR DARI DATABASE - DIPERBAIKI STATUSNYA
router.get('/', async (req, res) => {
  try {
    console.log('✅ Data kamar dari database');
    
    const query = `
      SELECT 
        k.kode_kamar,
        k.kode_ruangan,
        r.nama_ruangan,
        k.no_bed,
        k.kode_kelas,
        k.status_kamar as status_database, -- tampilkan juga status asli dari DB
        k.keterangan,
        CASE 
          WHEN k.status_kamar = 'ISI' THEN 1
          WHEN k.status_kamar = 'Terisi' THEN 1
          WHEN k.status_kamar = 'terisi' THEN 1
          ELSE 0
        END as status_kamar, -- konversi ke 1/0
        CASE 
          WHEN k.status_kamar = 'ISI' THEN 'terisi'
          WHEN k.status_kamar = 'Terisi' THEN 'terisi'
          WHEN k.status_kamar = 'terisi' THEN 'terisi'
          ELSE 'kosong'
        END as status_text -- konversi ke teks
      FROM kamar k
      LEFT JOIN ruangan r ON k.kode_ruangan = r.kode_ruangan
      WHERE r.status = '1'
      ORDER BY r.nama_ruangan, k.kode_kamar
    `;
    
    const [rows] = await pool.query(query);
    
    // Hitung statistik
    const totalKamar = rows.length;
    const terisi = rows.filter(k => k.status_kamar === 1).length;
    const kosong = rows.filter(k => k.status_kamar === 0).length;
    
    const response = {
      success: true,
      message: `✅ ${rows.length} kamar ditemukan`,
      statistik: {
        total_kamar: totalKamar,
        terisi: terisi,
        kosong: kosong,
        persentase_terisi: totalKamar > 0 ? ((terisi / totalKamar) * 100).toFixed(2) + '%' : '0%'
      },
      data: rows.map(row => ({
        kode_kamar: row.kode_kamar,
        kode_ruangan: row.kode_ruangan,
        nama_ruangan: row.nama_ruangan,
        no_bed: row.no_bed,
        kode_kelas: row.kode_kelas,
        status_kamar: row.status_kamar, // 1 atau 0
        status_text: row.status_text, // 'terisi' atau 'kosong'
        status_database: row.status_database, // status asli dari DB
        keterangan: row.keterangan
      })),
      catatan: {
        status_kamar: '1 = terisi, 0 = kosong',
        konversi: "'ISI'/'Terisi' → 1, lainnya → 0"
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data kamar dari database',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API 5: UPDATE STATUS KAMAR
router.put('/update-status', async (req, res) => {
  try {
    const { kode_kamar, status_kamar } = req.body;
    
    console.log(`✅ Update status kamar: ${kode_kamar} -> ${status_kamar}`);
    
    // Validasi input
    if (!kode_kamar || status_kamar === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Parameter kode_kamar dan status_kamar diperlukan'
      });
    }
    
    // Konversi status: 1 -> 'ISI', 0 -> 'KOSONG'
    const statusDatabase = status_kamar === 1 ? 'ISI' : 'KOSONG';
    const statusText = status_kamar === 1 ? 'terisi' : 'kosong';
    
    // Update ke database
    const query = `
      UPDATE kamar 
      SET status_kamar = ?
      WHERE kode_kamar = ?
    `;
    
    const [result] = await pool.query(query, [statusDatabase, kode_kamar]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kamar tidak ditemukan'
      });
    }
    
    const response = {
      success: true,
      message: `✅ Status kamar ${kode_kamar} berhasil diperbarui`,
      data: {
        kode_kamar: kode_kamar,
        status_kamar: status_kamar, // 1 atau 0
        status_text: statusText, // 'terisi' atau 'kosong'
        status_database: statusDatabase // 'ISI' atau 'KOSONG'
      },
      catatan: {
        kode_status: `status_kamar=${status_kamar} (${statusText})`,
        database: `status_kamar='${statusDatabase}'`
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status kamar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API 6: GET KAMAR BY STATUS (VERSI SIMPLE)
router.get('/by-status/:status', async (req, res) => {
  try {
    const { status } = req.params; // '1' atau '0'
    
    console.log(`✅ Kamar by status: ${status}`);
    
    // Validasi status
    const statusNum = parseInt(status);
    if (statusNum !== 0 && statusNum !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Status harus 0 (kosong) atau 1 (terisi)'
      });
    }
    
    // Konversi ke status database
    const statusDatabase = statusNum === 1 ? 'ISI' : 'KOSONG';
    const statusText = statusNum === 1 ? 'terisi' : 'kosong';
    
    const query = `
      SELECT 
        k.kode_kamar,
        k.kode_ruangan,
        r.nama_ruangan,
        k.no_bed,
        k.kode_kelas,
        k.keterangan
      FROM kamar k
      LEFT JOIN ruangan r ON k.kode_ruangan = r.kode_ruangan
      WHERE r.status = '1' 
        AND k.status_kamar = ?
      ORDER BY r.nama_ruangan, k.kode_kamar
    `;
    
    const [rows] = await pool.query(query, [statusDatabase]);
    
    const response = {
      success: true,
      message: `✅ ${rows.length} kamar dengan status "${statusText}" ditemukan`,
      status: {
        kode: statusNum,
        text: statusText,
        database: statusDatabase
      },
      data: rows.map(row => ({
        ...row,
        status_kamar: statusNum,
        status_text: statusText
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data kamar'
    });
  }
});

module.exports = router;