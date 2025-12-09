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

// API 2: DATA KAMAR DENGAN STATUS
router.get('/status', async (req, res) => {
  try {
    const { status_kamar, kode_ruangan } = req.query;
    
    console.log(`✅ Data kamar dengan status: status_kamar=${status_kamar}, kode_ruangan=${kode_ruangan}`);
    
    // Generate data kamar dari data okupansi
    let kamarList = [];
    
    dataOkupansi.forEach((ruangan, idx) => {
      const kodeRuang = `RG${(idx + 1).toString().padStart(2, '0')}`;
      const jumlahTerisi = ruangan.jamish;
      const jumlahKosong = ruangan.tt - ruangan.jamish;
      
      // Kamar terisi
      for (let i = 1; i <= jumlahTerisi; i++) {
        kamarList.push({
          kode_kamar: `${kodeRuang}-${i.toString().padStart(2, '0')}`,
          kode_ruangan: kodeRuang,
          nama_ruangan: ruangan.ruangan,
          kode_kelas: getKelasFromRuangan(ruangan.ruangan),
          nama_kelas: getNamaKelasFromRuangan(ruangan.ruangan),
          status_kamar: 0, // 0 = terisi
          status_text: 'terisi'
        });
      }
      
      // Kamar kosong
      for (let i = 1; i <= jumlahKosong; i++) {
        kamarList.push({
          kode_kamar: `${kodeRuang}-K${i.toString().padStart(2, '0')}`,
          kode_ruangan: kodeRuang,
          nama_ruangan: ruangan.ruangan,
          kode_kelas: getKelasFromRuangan(ruangan.ruangan),
          nama_kelas: getNamaKelasFromRuangan(ruangan.ruangan),
          status_kamar: 1, // 1 = kosong
          status_text: 'kosong'
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
    
    const response = {
      success: true,
      message: `✅ ${kamarList.length} kamar ditemukan`,
      data: kamarList
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

// API 3: KAMAR TERSEDIA UNTUK RAWAT INAP
router.get('/tersedia', async (req, res) => {
  try {
    const { kelas, status } = req.query;
    
    console.log(`✅ Data kamar tersedia: kelas=${kelas}, status=${status}`);
    
    // Data mock kamar
    const kamarList = [
      { no_kamar: '01', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
      { no_kamar: '01', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '02', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
      { no_kamar: '02', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '03', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
      { no_kamar: '03', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '04', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Terisi' },
      { no_kamar: '04', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '05', kelas: 'VIP DELUXE', no_bed: 'A', status: 'Kosong' },
      { no_kamar: '05', kelas: 'VIP DELUXE', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '06', kelas: 'VIP PREMIUM', no_bed: 'A', status: 'Terisi' },
      { no_kamar: '06', kelas: 'VIP PREMIUM', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '07', kelas: 'VIP PREMIUM', no_bed: 'A', status: 'Kosong' },
      { no_kamar: '07', kelas: 'VIP PREMIUM', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '08', kelas: 'KELAS I', no_bed: 'A', status: 'Kosong' },
      { no_kamar: '08', kelas: 'KELAS I', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '09', kelas: 'KELAS I', no_bed: 'A', status: 'Kosong' },
      { no_kamar: '09', kelas: 'KELAS I', no_bed: 'B', status: 'Kosong' },
      { no_kamar: '10', kelas: 'KELAS II', no_bed: 'A', status: 'Kosong' },
      { no_kamar: '10', kelas: 'KELAS II', no_bed: 'B', status: 'Kosong' }
    ];
    
    let filteredKamar = [...kamarList];
    
    // Filter by kelas
    if (kelas && kelas !== 'all') {
      filteredKamar = filteredKamar.filter(k => k.kelas === kelas);
    }
    
    // Filter by status
    if (status && status !== 'all') {
      filteredKamar = filteredKamar.filter(k => k.status === status);
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
      statistik: {
        total_kamar: filteredKamar.length,
        terisi: filteredKamar.filter(k => k.status === 'Terisi').length,
        kosong: filteredKamar.filter(k => k.status === 'Kosong').length,
        persentase: filteredKamar.length > 0 
          ? ((filteredKamar.filter(k => k.status === 'Terisi').length / filteredKamar.length) * 100).toFixed(1) + '%' 
          : '0%'
      },
      data_kamar: filteredKamar.map((k, i) => ({
        no: i + 1,
        no_kamar: k.no_kamar,
        kelas: k.kelas,
        no_bed: k.no_bed,
        status: k.status,
        pasien: k.status === 'Terisi' ? 
          mockRawatInap.find(p => p.kamar === k.no_kamar && p.no_bed === k.no_bed)?.nama_pasien || '-' 
          : '-'
      }))
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

// API 4: DATA KAMAR DARI DATABASE
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
        k.status_kamar,
        k.keterangan
      FROM kamar k
      LEFT JOIN ruangan r ON k.kode_ruangan = r.kode_ruangan
      WHERE r.status = '1'
      ORDER BY r.nama_ruangan, k.kode_kamar
    `;
    
    const [rows] = await pool.query(query);
    
    res.json({
      success: true,
      message: `✅ ${rows.length} kamar ditemukan`,
      data: rows
    });
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data kamar dari database'
    });
  }
});

module.exports = router;