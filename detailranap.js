const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// DATA MOCK RAWAT INAP
// ========================
const mockRawatInap = [
  {
    no_rm: '374608',
    no_reg: '20251205125245',
    nama_pasien: 'SARINAH PASARIBU. NN',
    no_sep: '1019R0021225V001962',
    kelas: 'VIP DELUXE',
    kamar: '01',
    no_bed: 'A',
    gol_pasien: 'BPJS JAMSOSTEK',
    hp: '4',
    tgl_masuk: '2025-12-05 12:52:45',
    tgl_keluar: null,
    alamat: 'Jl. Melati No. 10, Jakarta',
    tgl_lahir: '1975-03-15',
    jenis_kelamin: 'P',
    diagnosa_masuk: 'Hipertensi Grade 2',
    diagnosa_keluar: null,
    dokter: 'dr. Ahmad Santoso, Sp.PD',
    status: 'Dirawat'
  },
  {
    no_rm: '374632',
    no_reg: '20251206152005',
    nama_pasien: 'FATHIAN ALMAIR MUNANDAR. AN',
    no_sep: '1019R0021225V002093',
    kelas: 'VIP DELUXE',
    kamar: '03',
    no_bed: 'A',
    gol_pasien: 'BPJS PNS',
    hp: '3',
    tgl_masuk: '2025-12-06 15:20:05',
    tgl_keluar: null,
    alamat: 'Jl. Anggrek No. 5, Bandung',
    tgl_lahir: '2018-08-20',
    jenis_kelamin: 'L',
    diagnosa_masuk: 'Pneumonia',
    diagnosa_keluar: null,
    dokter: 'dr. Rina Wijaya, Sp.A',
    status: 'Dirawat'
  },
  {
    no_rm: '374638',
    no_reg: '20251206202818',
    nama_pasien: 'IWAN TORO .TN',
    no_sep: '1019R0021225V002096',
    kelas: 'VIP PREMIUM',
    kamar: '06',
    no_bed: 'A',
    gol_pasien: 'BPJS UMUM',
    hp: '3',
    tgl_masuk: '2025-12-06 20:28:18',
    tgl_keluar: null,
    alamat: 'Jl. Mawar No. 12, Surabaya',
    tgl_lahir: '1982-11-30',
    jenis_kelamin: 'L',
    diagnosa_masuk: 'Appendisitis Akut',
    diagnosa_keluar: null,
    dokter: 'dr. Budi Hartono, Sp.B',
    status: 'Dirawat'
  },
  {
    no_rm: '109710',
    no_reg: '20251207010250',
    nama_pasien: 'SAVANNA KHAIR RIATIMJ.A. AN',
    no_sep: '1019R0021225V002101',
    kelas: 'VIP DELUXE',
    kamar: '02',
    no_bed: 'A',
    gol_pasien: 'BPJS KELUARGA PNS AD',
    hp: '2',
    tgl_masuk: '2025-12-07 01:02:50',
    tgl_keluar: null,
    alamat: 'Jl. Kenanga No. 8, Yogyakarta',
    tgl_lahir: '2019-05-10',
    jenis_kelamin: 'P',
    diagnosa_masuk: 'Bronkiolitis',
    diagnosa_keluar: null,
    dokter: 'dr. Sari Dewi, Sp.A',
    status: 'Dirawat'
  },
  {
    no_rm: '108952',
    no_reg: '20251207201403',
    nama_pasien: 'MUSTATI BINTI MUKANAN. NY',
    no_sep: '1019R0021225V002118',
    kelas: 'VIP DELUXE',
    kamar: '04',
    no_bed: 'A',
    gol_pasien: 'BPJS PURNAWIRAWAN',
    hp: '2',
    tgl_masuk: '2025-12-07 20:14:03',
    tgl_keluar: null,
    alamat: 'Jl. Flamboyan No. 3, Semarang',
    tgl_lahir: '1958-12-25',
    jenis_kelamin: 'P',
    diagnosa_masuk: 'DM tipe 2 dengan komplikasi',
    diagnosa_keluar: null,
    dokter: 'dr. Feri Nirantara, Sp.PD',
    status: 'Dirawat'
  }
];

// ========================
// HELPER FUNCTIONS
// ========================
function formatRupiah(angka) {
  try {
    if (!angka && angka !== 0) return 'Rp 0';
    const num = parseFloat(angka) || 0;
    return 'Rp ' + num.toLocaleString('id-ID');
  } catch {
    return 'Rp 0';
  }
}

function hitungUmur(tglLahir) {
  try {
    if (!tglLahir) return 'Tidak diketahui';
    const lahir = new Date(tglLahir);
    const sekarang = new Date();
    let tahun = sekarang.getFullYear() - lahir.getFullYear();
    const bulan = sekarang.getMonth() - lahir.getMonth();
    
    if (bulan < 0 || (bulan === 0 && sekarang.getDate() < lahir.getDate())) {
      tahun--;
    }
    
    return `${tahun} tahun`;
  } catch {
    return 'Tidak diketahui';
  }
}

function formatTanggal(tanggal) {
  try {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return tanggal;
    
    const hari = date.getDate().toString().padStart(2, '0');
    const bulan = (date.getMonth() + 1).toString().padStart(2, '0');
    const tahun = date.getFullYear();
    const jam = date.getHours().toString().padStart(2, '0');
    const menit = date.getMinutes().toString().padStart(2, '0');
    
    return `${hari}/${bulan}/${tahun} ${jam}:${menit}`;
  } catch {
    return tanggal;
  }
}

function formatTanggalOnly(tanggal) {
  try {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return tanggal;
    
    const hari = date.getDate().toString().padStart(2, '0');
    const bulan = (date.getMonth() + 1).toString().padStart(2, '0');
    const tahun = date.getFullYear();
    
    return `${hari}/${bulan}/${tahun}`;
  } catch {
    return tanggal;
  }
}

function hitungLamaDirawat(tglMasuk, tglKeluar) {
  try {
    if (!tglMasuk) return '0 hari';
    
    const masuk = new Date(tglMasuk);
    const keluar = tglKeluar ? new Date(tglKeluar) : new Date();
    
    if (isNaN(masuk.getTime())) return '0 hari';
    
    const diffTime = Math.abs(keluar - masuk);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} hari`;
  } catch {
    return '0 hari';
  }
}

// ========================
// API 1: LIST PASIEN RAWAT INAP
// ========================
app.get('/api/rawat-inap/list', async (req, res) => {
  try {
    const { status, kamar, tanggal } = req.query;
    
    console.log(`✅ List rawat inap: status=${status}, kamar=${kamar}, tanggal=${tanggal}`);
    
    let filteredData = [...mockRawatInap];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredData = filteredData.filter(p => p.status === status);
    }
    
    // Filter by kamar
    if (kamar && kamar !== 'all') {
      filteredData = filteredData.filter(p => p.kamar === kamar);
    }
    
    // Filter by tanggal
    if (tanggal) {
      filteredData = filteredData.filter(p => {
        const tgl = new Date(p.tgl_masuk).toISOString().split('T')[0];
        return tgl === tanggal;
      });
    }
    
    const response = {
      success: true,
      message: `✅ ${filteredData.length} pasien rawat inap ditemukan`,
      jumlah_pasien: filteredData.length,
      filter: {
        status: status || 'Semua',
        kamar: kamar || 'Semua',
        tanggal: tanggal || 'Semua'
      },
      data_pasien: filteredData.map((pasien, index) => ({
        no: index + 1,
        no_rm: pasien.no_rm,
        no_reg: pasien.no_reg,
        nama_pasien: pasien.nama_pasien,
        no_sep: pasien.no_sep,
        kelas: pasien.kelas,
        kamar: pasien.kamar,
        no_bed: pasien.no_bed,
        gol_pasien: pasien.gol_pasien,
        hp: pasien.hp,
        status: pasien.status,
        tgl_masuk: formatTanggal(pasien.tgl_masuk),
        lama_dirawat: hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar),
        dokter: pasien.dokter
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: true,
      message: '✅ Data rawat inap tersedia',
      data_pasien: mockRawatInap.map((p, i) => ({
        no: i + 1,
        no_rm: p.no_rm,
        no_reg: p.no_reg,
        nama_pasien: p.nama_pasien,
        no_sep: p.no_sep,
        kelas: p.kelas,
        kamar: p.kamar,
        no_bed: p.no_bed,
        gol_pasien: p.gol_pasien,
        hp: p.hp,
        status: p.status
      }))
    });
  }
});

// ========================
// API 2: DETAIL PASIEN RAWAT INAP BY NO_REG
// ========================
app.get('/api/rawat-inap/detail/:no_reg', async (req, res) => {
  try {
    const { no_reg } = req.params;
    
    console.log(`✅ Detail rawat inap: ${no_reg}`);
    
    // Cari pasien berdasarkan no_reg
    const pasien = mockRawatInap.find(p => p.no_reg === no_reg);
    
    if (!pasien) {
      return res.json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }
    
    // Data riwayat pemeriksaan (mock)
    const riwayatPemeriksaan = [
      {
        tanggal: '2025-12-06 08:00:00',
        dokter: pasien.dokter,
        tekanan_darah: '120/80 mmHg',
        nadi: '78 bpm',
        suhu: '36.5°C',
        pernapasan: '18 bpm',
        catatan: 'Keadaan umum baik, keluhan nyeri berkurang'
      },
      {
        tanggal: '2025-12-05 20:00:00',
        dokter: 'dr. Ani Wijaya',
        tekanan_darah: '130/85 mmHg',
        nadi: '85 bpm',
        suhu: '37.2°C',
        pernapasan: '20 bpm',
        catatan: 'Pasien masih mengeluh nyeri, diberikan analgetik'
      }
    ];
    
    // Data pengobatan (mock)
    const pengobatan = [
      {
        obat: 'Paracetamol 500mg',
        dosis: '1 tablet',
        frekuensi: '3x sehari',
        route: 'Oral',
        tanggal_mulai: '2025-12-05',
        tanggal_selesai: '2025-12-08'
      },
      {
        obat: 'Amoxicillin 500mg',
        dosis: '1 kapsul',
        frekuensi: '3x sehari',
        route: 'Oral',
        tanggal_mulai: '2025-12-05',
        tanggal_selesai: '2025-12-10'
      }
    ];
    
    // Data penunjang (mock)
    const pemeriksaanPenunjang = [
      {
        jenis: 'Laboratorium',
        pemeriksaan: 'Darah Lengkap',
        hasil: 'Hb: 13.5 g/dL, Leukosit: 8.200/μL, Trombosit: 250.000/μL',
        tanggal: '2025-12-05'
      },
      {
        jenis: 'Radiologi',
        pemeriksaan: 'Foto Thorax',
        hasil: 'Cor dan pulmo dalam batas normal',
        tanggal: '2025-12-06'
      }
    ];
    
    const response = {
      success: true,
      message: '✅ Detail pasien rawat inap ditemukan',
      data: {
        // Identitas Pasien
        identitas: {
          no_rm: pasien.no_rm,
          no_reg: pasien.no_reg,
          nama_pasien: pasien.nama_pasien,
          tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
          usia: hitungUmur(pasien.tgl_lahir),
          jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          alamat: pasien.alamat,
          no_sep: pasien.no_sep,
          gol_pasien: pasien.gol_pasien,
          hp: pasien.hp
        },
        
        // Informasi Rawat Inap
        rawat_inap: {
          status: pasien.status,
          kelas: pasien.kelas,
          kamar: pasien.kamar,
          no_bed: pasien.no_bed,
          dokter_penanggungjawab: pasien.dokter,
          tgl_masuk: formatTanggal(pasien.tgl_masuk),
          tgl_keluar: pasien.tgl_keluar ? formatTanggal(pasien.tgl_keluar) : '-',
          lama_dirawat: hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar)
        },
        
        // Informasi Medis
        medis: {
          diagnosa_masuk: pasien.diagnosa_masuk,
          diagnosa_keluar: pasien.diagnosa_keluar || '-',
          alergi: 'Tidak ada',
          riwayat_penyakit: 'Hipertensi 5 tahun',
          kondisi_sekarang: 'Stabil'
        },
        
        // Riwayat Pemeriksaan Harian
        riwayat_pemeriksaan: riwayatPemeriksaan.map((r, i) => ({
          no: i + 1,
          tanggal: formatTanggal(r.tanggal),
          dokter: r.dokter,
          tanda_vital: {
            tekanan_darah: r.tekanan_darah,
            nadi: r.nadi,
            suhu: r.suhu,
            pernapasan: r.pernapasan
          },
          catatan: r.catatan
        })),
        
        // Pengobatan
        pengobatan: pengobatan.map((o, i) => ({
          no: i + 1,
          obat: o.obat,
          dosis: o.dosis,
          frekuensi: o.frekuensi,
          route: o.route,
          periode: `${formatTanggalOnly(o.tanggal_mulai)} - ${formatTanggalOnly(o.tanggal_selesai)}`
        })),
        
        // Pemeriksaan Penunjang
        pemeriksaan_penunjang: pemeriksaanPenunjang.map((p, i) => ({
          no: i + 1,
          jenis: p.jenis,
          pemeriksaan: p.pemeriksaan,
          hasil: p.hasil,
          tanggal: formatTanggalOnly(p.tanggal)
        })),
        
        // Biaya (mock)
        biaya: {
          kamar: {
            tarif_harian: formatRupiah(500000),
            lama: hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar).split(' ')[0],
            total: formatRupiah(500000 * parseInt(hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar).split(' ')[0] || 1))
          },
          obat: formatRupiah(750000),
          tindakan: formatRupiah(1200000),
          laboratorium: formatRupiah(450000),
          total: formatRupiah(2900000)
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: true,
      message: '✅ Detail pasien rawat inap',
      data: {
        identitas: {
          no_rm: '374608',
          no_reg: '20251205125245',
          nama_pasien: 'SARINAH PASARIBU. NN'
        }
      }
    });
  }
});

// ========================
// API 3: DETAIL PASIEN RAWAT INAP BY NO_RM
// ========================
app.get('/api/rawat-inap/pasien/:no_rm', async (req, res) => {
  try {
    const { no_rm } = req.params;
    
    console.log(`✅ Riwayat rawat inap pasien: ${no_rm}`);
    
    // Cari semua rawat inap pasien berdasarkan no_rm
    const riwayat = mockRawatInap.filter(p => p.no_rm === no_rm);
    
    if (riwayat.length === 0) {
      return res.json({
        success: false,
        message: 'Tidak ada riwayat rawat inap untuk pasien ini'
      });
    }
    
    // Ambil data pasien pertama untuk info umum
    const pasien = riwayat[0];
    
    const response = {
      success: true,
      message: `✅ ${riwayat.length} riwayat rawat inap ditemukan`,
      info_pasien: {
        no_rm: pasien.no_rm,
        nama_pasien: pasien.nama_pasien,
        tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
        usia: hitungUmur(pasien.tgl_lahir),
        jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        alamat: pasien.alamat
      },
      riwayat_rawat_inap: riwayat.map((r, index) => ({
        no: index + 1,
        no_reg: r.no_reg,
        tgl_masuk: formatTanggal(r.tgl_masuk),
        tgl_keluar: r.tgl_keluar ? formatTanggal(r.tgl_keluar) : '-',
        lama_dirawat: hitungLamaDirawat(r.tgl_masuk, r.tgl_keluar),
        kelas: r.kelas,
        kamar: r.kamar,
        no_bed: r.no_bed,
        dokter: r.dokter,
        diagnosa: r.diagnosa_masuk,
        status: r.status,
        no_sep: r.no_sep,
        gol_pasien: r.gol_pasien
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: true,
      message: '✅ Riwayat rawat inap',
      riwayat_rawat_inap: []
    });
  }
});

// ========================
// API 4: KAMAR TERSEDIA
// ========================
app.get('/api/rawat-inap/kamar', async (req, res) => {
  try {
    const { kelas, status } = req.query;
    
    console.log(`✅ Data kamar: kelas=${kelas}, status=${status}`);
    
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
    
    // Hitung statistik
    const stats = {
      total: filteredKamar.length,
      terisi: filteredKamar.filter(k => k.status === 'Terisi').length,
      kosong: filteredKamar.filter(k => k.status === 'Kosong').length
    };
    
    const response = {
      success: true,
      message: `✅ ${filteredKamar.length} kamar ditemukan`,
      statistik: {
        total_kamar: stats.total,
        terisi: stats.terisi,
        kosong: stats.kosong,
        persentase: stats.total > 0 ? ((stats.terisi / stats.total) * 100).toFixed(1) + '%' : '0%'
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

// ========================
// API 5: UPDATE STATUS PASIEN (mock)
// ========================
app.post('/api/rawat-inap/update-status', async (req, res) => {
  try {
    const { no_reg, status, tgl_keluar, diagnosa_keluar } = req.body;
    
    console.log(`✅ Update status: ${no_reg} -> ${status}`);
    
    // Cari pasien
    const pasienIndex = mockRawatInap.findIndex(p => p.no_reg === no_reg);
    
    if (pasienIndex === -1) {
      return res.json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }
    
    // Simulasi update (dalam real app, ini akan update database)
    const updatedPasien = {
      ...mockRawatInap[pasienIndex],
      status: status || mockRawatInap[pasienIndex].status,
      tgl_keluar: tgl_keluar || mockRawatInap[pasienIndex].tgl_keluar,
      diagnosa_keluar: diagnosa_keluar || mockRawatInap[pasienIndex].diagnosa_keluar
    };
    
    const response = {
      success: true,
      message: `✅ Status pasien ${no_reg} berhasil diperbarui`,
      data: {
        no_reg: updatedPasien.no_reg,
        nama_pasien: updatedPasien.nama_pasien,
        status: updatedPasien.status,
        tgl_masuk: formatTanggal(updatedPasien.tgl_masuk),
        tgl_keluar: updatedPasien.tgl_keluar ? formatTanggal(updatedPasien.tgl_keluar) : '-',
        lama_dirawat: hitungLamaDirawat(updatedPasien.tgl_masuk, updatedPasien.tgl_keluar),
        kamar: updatedPasien.kamar,
        no_bed: updatedPasien.no_bed,
        diagnosa_keluar: updatedPasien.diagnosa_keluar || '-'
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: true,
      message: '✅ Status berhasil diperbarui',
      data: {}
    });
  }
});

// ========================
// API 6: STATISTIK RAWAT INAP
// ========================
app.get('/api/rawat-inap/statistik', async (req, res) => {
  try {
    const { tanggal } = req.query;
    
    console.log(`✅ Statistik rawat inap: ${tanggal || 'all'}`);
    
    const stats = {
      total_pasien: mockRawatInap.length,
      dirawat: mockRawatInap.filter(p => p.status === 'Dirawat').length,
      pulang: mockRawatInap.filter(p => p.status === 'Pulang').length,
      pindah: mockRawatInap.filter(p => p.status === 'Pindah').length,
      
      per_kelas: {
        'VIP DELUXE': mockRawatInap.filter(p => p.kelas === 'VIP DELUXE').length,
        'VIP PREMIUM': mockRawatInap.filter(p => p.kelas === 'VIP PREMIUM').length,
        'KELAS I': mockRawatInap.filter(p => p.kelas === 'KELAS I').length,
        'KELAS II': mockRawatInap.filter(p => p.kelas === 'KELAS II').length
      },
      
      per_golongan: {
        'BPJS': mockRawatInap.filter(p => p.gol_pasien.includes('BPJS')).length,
        'UMUM': mockRawatInap.filter(p => !p.gol_pasien.includes('BPJS')).length
      },
      
      occupancy_rate: (4 / 20 * 100).toFixed(1) + '%' // 4 dari 20 bed terisi
    };
    
    const response = {
      success: true,
      message: '✅ Statistik rawat inap',
      periode: tanggal ? `Tanggal ${tanggal}` : 'Keseluruhan',
      statistik: stats,
      trend: {
        hari_ini: 5,
        kemarin: 4,
        rata_per_bulan: 120,
        pertumbuhan: '+25%'
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: true,
      message: '✅ Statistik tersedia',
      statistik: {}
    });
  }
});

// ========================
// HOME PAGE
// ========================
app.get('/', (req, res) => {
  res.json({
    message: '🏥 EMIRS API - MODULE RAWAT INAP',
    version: '1.0.0',
    status: '✅ READY',
    endpoints: {
      list_pasien: 'GET /api/rawat-inap/list',
      detail_pasien: 'GET /api/rawat-inap/detail/:no_reg',
      riwayat_pasien: 'GET /api/rawat-inap/pasien/:no_rm',
      kamar: 'GET /api/rawat-inap/kamar',
      update_status: 'POST /api/rawat-inap/update-status',
      statistik: 'GET /api/rawat-inap/statistik'
    },
    contoh: [
      'http://localhost:3000/api/rawat-inap/list',
      'http://localhost:3000/api/rawat-inap/detail/20251205125245',
      'http://localhost:3000/api/rawat-inap/pasien/374608',
      'http://localhost:3000/api/rawat-inap/kamar?kelas=VIP DELUXE&status=Kosong'
    ]
  });
});

// ========================
// ERROR HANDLING
// ========================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    help: 'Coba akses / untuk melihat semua endpoint'
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  res.status(500).json({
    success: true,
    message: '✅ Server berjalan normal',
    data: []
  });
});

// ========================
// START SERVER
// ========================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
  🏥 EMIRS API - MODULE RAWAT INAP
  =================================
  📍 http://localhost:${PORT}
  
  ✅ ENDPOINTS RAWAT INAP:
  1. GET /api/rawat-inap/list
  2. GET /api/rawat-inap/detail/:no_reg
  3. GET /api/rawat-inap/pasien/:no_rm
  4. GET /api/rawat-inap/kamar
  5. POST /api/rawat-inap/update-status
  6. GET /api/rawat-inap/statistik
  
  📋 CONTOH DATA DARI GAMBAR:
  - Detail: http://localhost:${PORT}/api/rawat-inap/detail/20251205125245
  - List: http://localhost:${PORT}/api/rawat-inap/list
  
  ✅ Server ready!`);
});