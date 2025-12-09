const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// DATA MASTER RUANGAN
// ========================
const dataRuangan = [
  { kode_ruangan: 'RG01', ruangan: 'KIRANA', kode_kelas: 'VIP_DELUXE', kelas: 'VIP DELUXE', total_bed: 7, terisi: 5, kosong: 2 },
  { kode_ruangan: 'RG02', ruangan: 'KARTIKA', kode_kelas: 'VIP_DELUXE', kelas: 'VIP DELUXE', total_bed: 17, terisi: 10, kosong: 7 },
  { kode_ruangan: 'RG03', ruangan: 'WIDYA', kode_kelas: 'KELAS_1', kelas: 'Kelas 1', total_bed: 19, terisi: 12, kosong: 7 },
  { kode_ruangan: 'RG04', ruangan: 'ICU', kode_kelas: 'ICU', kelas: 'Intensive Care Unit', total_bed: 18, terisi: 10, kosong: 8 },
  { kode_ruangan: 'RG05', ruangan: 'YUDHA', kode_kelas: 'KELAS_2', kelas: 'Kelas 2', total_bed: 30, terisi: 25, kosong: 5 },
  { kode_ruangan: 'RG06', ruangan: 'HESTI', kode_kelas: 'KELAS_2', kelas: 'Kelas 2', total_bed: 10, terisi: 5, kosong: 5 },
  { kode_ruangan: 'RG07', ruangan: 'KEKICANA', kode_kelas: 'KELAS_3', kelas: 'Kelas 3', total_bed: 30, terisi: 16, kosong: 14 },
  { kode_ruangan: 'RG08', ruangan: 'PLISRA', kode_kelas: 'KELAS_2', kelas: 'Kelas 2', total_bed: 28, terisi: 19, kosong: 9 },
  { kode_ruangan: 'RG09', ruangan: 'PRATAMA', kode_kelas: 'VIP_DELUXE', kelas: 'VIP DELUXE', total_bed: 27, terisi: 25, kosong: 2 },
  { kode_ruangan: 'RG10', ruangan: 'NICU', kode_kelas: 'ICU', kelas: 'Neonatal ICU', total_bed: 4, terisi: 0, kosong: 4 },
  { kode_ruangan: 'RG11', ruangan: 'CHANDRA', kode_kelas: 'KELAS_3', kelas: 'Kelas 3', total_bed: 14, terisi: 4, kosong: 10 }
];

// ========================
// DATA MOCK RAWAT INAP (DIPERBAIKI DENGAN KODE)
// ========================
const mockRawatInap = [
  {
    no_rm: '374608',
    no_reg: '20251205125245',
    nama_pasien: 'SARINAH PASARIBU. NN',
    no_sep: '1019R0021225V001962',
    kode_kelas: 'VIP_DELUXE',
    kelas: 'VIP DELUXE',
    kode_kamar: 'RG01-01',
    kamar: '01',
    no_bed: 'A',
    kode_ruangan: 'RG01',
    ruangan: 'KIRANA',
    gol_pasien: 'BPJS JAMSOSTEK',
    hp: '4',
    tgl_masuk: '2025-12-05 12:52:45',
    tgl_keluar: null,
    jam_keluar: null,
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
    kode_kelas: 'VIP_DELUXE',
    kelas: 'VIP DELUXE',
    kode_kamar: 'RG02-03',
    kamar: '03',
    no_bed: 'A',
    kode_ruangan: 'RG02',
    ruangan: 'KARTIKA',
    gol_pasien: 'BPJS PNS',
    hp: '3',
    tgl_masuk: '2025-12-06 15:20:05',
    tgl_keluar: null,
    jam_keluar: null,
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
    kode_kelas: 'VIP_PREMIUM',
    kelas: 'VIP PREMIUM',
    kode_kamar: 'RG04-06',
    kamar: '06',
    no_bed: 'A',
    kode_ruangan: 'RG04',
    ruangan: 'ICU',
    gol_pasien: 'BPJS UMUM',
    hp: '3',
    tgl_masuk: '2025-12-06 20:28:18',
    tgl_keluar: null,
    jam_keluar: null,
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
    kode_kelas: 'VIP_DELUXE',
    kelas: 'VIP DELUXE',
    kode_kamar: 'RG01-02',
    kamar: '02',
    no_bed: 'A',
    kode_ruangan: 'RG01',
    ruangan: 'KIRANA',
    gol_pasien: 'BPJS KELUARGA PNS AD',
    hp: '2',
    tgl_masuk: '2025-12-07 01:02:50',
    tgl_keluar: null,
    jam_keluar: null,
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
    kode_kelas: 'VIP_DELUXE',
    kelas: 'VIP DELUXE',
    kode_kamar: 'RG01-04',
    kamar: '04',
    no_bed: 'A',
    kode_ruangan: 'RG01',
    ruangan: 'KIRANA',
    gol_pasien: 'BPJS PURNAWIRAWAN',
    hp: '2',
    tgl_masuk: '2025-12-07 20:14:03',
    tgl_keluar: null,
    jam_keluar: null,
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

function formatJam(tanggal) {
  try {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return '-';
    
    const jam = date.getHours().toString().padStart(2, '0');
    const menit = date.getMinutes().toString().padStart(2, '0');
    
    return `${jam}:${menit}`;
  } catch {
    return '-';
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
// API 1: LIST PASIEN RAWAT INAP (DIPERBAIKI)
// ========================
app.get('/api/rawat-inap/list', async (req, res) => {
  try {
    const { status, kamar, tanggal, kode_ruangan } = req.query;
    
    console.log(`✅ List rawat inap: status=${status}, kamar=${kamar}, tanggal=${tanggal}, kode_ruangan=${kode_ruangan}`);
    
    let filteredData = [...mockRawatInap];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredData = filteredData.filter(p => p.status === status);
    }
    
    // Filter by kamar
    if (kamar && kamar !== 'all') {
      filteredData = filteredData.filter(p => p.kamar === kamar);
    }
    
    // Filter by kode_ruangan
    if (kode_ruangan && kode_ruangan !== 'all') {
      filteredData = filteredData.filter(p => p.kode_ruangan === kode_ruangan);
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
        kode_ruangan: kode_ruangan || 'Semua',
        tanggal: tanggal || 'Semua'
      },
      data_pasien: filteredData.map((pasien, index) => ({
        no: index + 1,
        no_rm: pasien.no_rm,
        no_reg: pasien.no_reg,
        nama_pasien: pasien.nama_pasien,
        no_sep: pasien.no_sep,
        kode_kelas: pasien.kode_kelas,
        kelas: pasien.kelas,
        kode_kamar: pasien.kode_kamar,
        kamar: pasien.kamar,
        no_bed: pasien.no_bed,
        kode_ruangan: pasien.kode_ruangan,
        ruangan: pasien.ruangan,
        gol_pasien: pasien.gol_pasien,
        hp: pasien.hp,
        status: pasien.status,
        tgl_masuk: formatTanggal(pasien.tgl_masuk),
        tgl_keluar: pasien.tgl_keluar ? formatTanggalOnly(pasien.tgl_keluar) : null,
        jam_keluar: pasien.jam_keluar ? formatJam(pasien.jam_keluar) : null,
        lama_dirawat: hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar),
        dokter: pasien.dokter
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data pasien',
      data_pasien: []
    });
  }
});

// ========================
// API 2: DETAIL PASIEN RAWAT INAP BY NO_REG (DIPERBAIKI)
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
          kode_kelas: pasien.kode_kelas,
          kelas: pasien.kelas,
          kode_kamar: pasien.kode_kamar,
          kamar: pasien.kamar,
          no_bed: pasien.no_bed,
          kode_ruangan: pasien.kode_ruangan,
          ruangan: pasien.ruangan,
          dokter_penanggungjawab: pasien.dokter,
          tgl_masuk: formatTanggal(pasien.tgl_masuk),
          tgl_keluar: pasien.tgl_keluar ? formatTanggalOnly(pasien.tgl_keluar) : null,
          jam_keluar: pasien.jam_keluar ? formatJam(pasien.jam_keluar) : null,
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
      success: false,
      message: 'Gagal mengambil detail pasien'
    });
  }
});

// ========================
// API 3: DETAIL PASIEN RAWAT INAP BY NO_RM (DIPERBAIKI)
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
        tgl_keluar: r.tgl_keluar ? formatTanggalOnly(r.tgl_keluar) : null,
        jam_keluar: r.jam_keluar ? formatJam(r.jam_keluar) : null,
        lama_dirawat: hitungLamaDirawat(r.tgl_masuk, r.tgl_keluar),
        kode_kelas: r.kode_kelas,
        kelas: r.kelas,
        kode_kamar: r.kode_kamar,
        kamar: r.kamar,
        no_bed: r.no_bed,
        kode_ruangan: r.kode_ruangan,
        ruangan: r.ruangan,
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
      success: false,
      message: 'Gagal mengambil riwayat pasien',
      riwayat_rawat_inap: []
    });
  }
});

// ========================
// API 4: KAMAR TERSEDIA (DIPERBAIKI)
// ========================
app.get('/api/rawat-inap/kamar', async (req, res) => {
  try {
    const { kelas, status, kode_ruangan } = req.query;
    
    console.log(`✅ Data kamar: kelas=${kelas}, status=${status}, kode_ruangan=${kode_ruangan}`);
    
    // Data mock kamar berdasarkan data ruangan
    let kamarList = [];
    
    // Generate semua kamar dari data ruangan
    dataRuangan.forEach(ruangan => {
      const totalBed = ruangan.total_bed;
      const terisi = ruangan.terisi;
      
      // Generate kamar terisi
      for (let i = 1; i <= terisi; i++) {
        kamarList.push({
          kode_kamar: `${ruangan.kode_ruangan}-${i.toString().padStart(2, '0')}`,
          kamar: `${ruangan.kode_ruangan}-${i.toString().padStart(2, '0')}`,
          no_kamar: ruangan.kode_ruangan,
          no_bed: `Bed ${String.fromCharCode(64 + i)}`,
          kode_kelas: ruangan.kode_kelas,
          kelas: ruangan.kelas,
          kode_ruangan: ruangan.kode_ruangan,
          ruangan: ruangan.ruangan,
          status: 'Terisi',
          status_kamar: 'terisi',
          status_text: 1
        });
      }
      
      // Generate kamar kosong
      for (let i = terisi + 1; i <= totalBed; i++) {
        kamarList.push({
          kode_kamar: `${ruangan.kode_ruangan}-${i.toString().padStart(2, '0')}`,
          kamar: `${ruangan.kode_ruangan}-${i.toString().padStart(2, '0')}`,
          no_kamar: ruangan.kode_ruangan,
          no_bed: `Bed ${String.fromCharCode(64 + i)}`,
          kode_kelas: ruangan.kode_kelas,
          kelas: ruangan.kelas,
          kode_ruangan: ruangan.kode_ruangan,
          ruangan: ruangan.ruangan,
          status: 'Kosong',
          status_kamar: 'kosong',
          status_text: 0
        });
      }
    });
    
    let filteredKamar = [...kamarList];
    
    // Filter by kelas (kode_kelas)
    if (kelas && kelas !== 'all') {
      filteredKamar = filteredKamar.filter(k => k.kode_kelas === kelas);
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === '0' || status === 'kosong') {
        filteredKamar = filteredKamar.filter(k => k.status_text === 0);
      } else if (status === '1' || status === 'terisi') {
        filteredKamar = filteredKamar.filter(k => k.status_text === 1);
      } else {
        filteredKamar = filteredKamar.filter(k => k.status === status);
      }
    }
    
    // Filter by kode_ruangan
    if (kode_ruangan && kode_ruangan !== 'all') {
      filteredKamar = filteredKamar.filter(k => k.kode_ruangan === kode_ruangan);
    }
    
    // Hitung statistik
    const stats = {
      total: filteredKamar.length,
      terisi: filteredKamar.filter(k => k.status_text === 1).length,
      kosong: filteredKamar.filter(k => k.status_text === 0).length
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
        kode_kamar: k.kode_kamar,
        kamar: k.kamar,
        no_kamar: k.no_kamar,
        no_bed: k.no_bed,
        kode_kelas: k.kode_kelas,
        kelas: k.kelas,
        kode_ruangan: k.kode_ruangan,
        ruangan: k.ruangan,
        status: k.status,
        status_kamar: k.status_kamar,
        status_text: k.status_text,
        pasien: k.status_text === 1 ? 
          mockRawatInap.find(p => p.kode_kamar === k.kode_kamar)?.nama_pasien || '-' 
          : '-'
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data kamar',
      data_kamar: []
    });
  }
});

// ========================
// API 5: UPDATE STATUS PASIEN (DIPERBAIKI DENGAN JAM_KELUAR)
// ========================
app.post('/api/rawat-inap/update-status', async (req, res) => {
  try {
    const { no_reg, status, tgl_keluar, jam_keluar, diagnosa_keluar } = req.body;
    
    console.log(`✅ Update status: ${no_reg} -> ${status}, tgl_keluar=${tgl_keluar}, jam_keluar=${jam_keluar}`);
    
    // Cari pasien
    const pasienIndex = mockRawatInap.findIndex(p => p.no_reg === no_reg);
    
    if (pasienIndex === -1) {
      return res.json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }
    
    // Jika status pulang dan ada tgl_keluar, tambahkan jam_keluar jika tidak ada
    let updatedJamKeluar = jam_keluar;
    if (status === 'Pulang' && tgl_keluar && !jam_keluar) {
      updatedJamKeluar = tgl_keluar.split('T')[1] || '12:00:00';
    }
    
    // Simulasi update
    const updatedPasien = {
      ...mockRawatInap[pasienIndex],
      status: status || mockRawatInap[pasienIndex].status,
      tgl_keluar: tgl_keluar || mockRawatInap[pasienIndex].tgl_keluar,
      jam_keluar: updatedJamKeluar || mockRawatInap[pasienIndex].jam_keluar,
      diagnosa_keluar: diagnosa_keluar || mockRawatInap[pasienIndex].diagnosa_keluar
    };
    
    // Update data mock (dalam real app, ini akan update database)
    mockRawatInap[pasienIndex] = updatedPasien;
    
    const response = {
      success: true,
      message: `✅ Status pasien ${no_reg} berhasil diperbarui`,
      data: {
        no_reg: updatedPasien.no_reg,
        nama_pasien: updatedPasien.nama_pasien,
        status: updatedPasien.status,
        tgl_masuk: formatTanggal(updatedPasien.tgl_masuk),
        tgl_keluar: updatedPasien.tgl_keluar ? formatTanggalOnly(updatedPasien.tgl_keluar) : null,
        jam_keluar: updatedPasien.jam_keluar ? formatJam(updatedPasien.jam_keluar) : null,
        lama_dirawat: hitungLamaDirawat(updatedPasien.tgl_masuk, updatedPasien.tgl_keluar),
        kamar: updatedPasien.kamar,
        no_bed: updatedPasien.no_bed,
        kode_ruangan: updatedPasien.kode_ruangan,
        ruangan: updatedPasien.ruangan,
        diagnosa_keluar: updatedPasien.diagnosa_keluar || '-'
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal memperbarui status pasien'
    });
  }
});

// ========================
// API 6: STATISTIK RAWAT INAP (DIPERBAIKI)
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
        'VIP_DELUXE': mockRawatInap.filter(p => p.kode_kelas === 'VIP_DELUXE').length,
        'VIP_PREMIUM': mockRawatInap.filter(p => p.kode_kelas === 'VIP_PREMIUM').length,
        'KELAS_1': mockRawatInap.filter(p => p.kode_kelas === 'KELAS_1').length,
        'KELAS_2': mockRawatInap.filter(p => p.kode_kelas === 'KELAS_2').length,
        'KELAS_3': mockRawatInap.filter(p => p.kode_kelas === 'KELAS_3').length,
        'ICU': mockRawatInap.filter(p => p.kode_kelas === 'ICU').length
      },
      
      per_ruangan: dataRuangan.map(ruangan => ({
        kode_ruangan: ruangan.kode_ruangan,
        ruangan: ruangan.ruangan,
        total_pasien: mockRawatInap.filter(p => p.kode_ruangan === ruangan.kode_ruangan).length,
        okupansi: ((ruangan.terisi / ruangan.total_bed) * 100).toFixed(1) + '%'
      })),
      
      per_golongan: {
        'BPJS': mockRawatInap.filter(p => p.gol_pasien.includes('BPJS')).length,
        'UMUM': mockRawatInap.filter(p => !p.gol_pasien.includes('BPJS')).length
      },
      
      total_bed: dataRuangan.reduce((sum, item) => sum + item.total_bed, 0),
      terisi: dataRuangan.reduce((sum, item) => sum + item.terisi, 0),
      kosong: dataRuangan.reduce((sum, item) => sum + item.kosong, 0),
      occupancy_rate: (dataRuangan.reduce((sum, item) => sum + item.terisi, 0) / 
                      dataRuangan.reduce((sum, item) => sum + item.total_bed, 0) * 100).toFixed(1) + '%'
    };
    
    const response = {
      success: true,
      message: '✅ Statistik rawat inap',
      periode: tanggal ? `Tanggal ${tanggal}` : 'Keseluruhan',
      statistik: stats,
      trend: {
        hari_ini: mockRawatInap.filter(p => 
          new Date(p.tgl_masuk).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
        ).length,
        kemarin: 4,
        rata_per_bulan: 120,
        pertumbuhan: '+25%'
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil statistik'
    });
  }
});

// ========================
// API 7: DATA KAMAR STATUS (BARU)
// ========================
app.get('/api/kamar-status', async (req, res) => {
  try {
    const { status_kamar, kode_ruangan, kode_kelas } = req.query;
    
    console.log(`✅ Data kamar status: status_kamar=${status_kamar}, kode_ruangan=${kode_ruangan}, kode_kelas=${kode_kelas}`);
    
    let kamarList = [];
    
    // Generate semua kamar dari data ruangan
    dataRuangan.forEach(ruangan => {
      const totalBed = ruangan.total_bed;
      const terisi = ruangan.terisi;
      
      // Kamar terisi
      for (let i = 1; i <= terisi; i++) {
        kamarList.push({
          kode_kamar: `${ruangan.kode_ruangan}-${i.toString().padStart(2, '0')}`,
          kode_ruangan: ruangan.kode_ruangan,
          nama_ruangan: ruangan.ruangan,
          no_bed: `Bed ${String.fromCharCode(64 + i)}`,
          kode_kelas: ruangan.kode_kelas,
          nama_kelas: ruangan.kelas,
          status_kamar: 'terisi', // STRING "terisi"
          status_text: 1 // NUMBER 1
        });
      }
      
      // Kamar kosong
      for (let i = terisi + 1; i <= totalBed; i++) {
        kamarList.push({
          kode_kamar: `${ruangan.kode_ruangan}-${i.toString().padStart(2, '0')}`,
          kode_ruangan: ruangan.kode_ruangan,
          nama_ruangan: ruangan.ruangan,
          no_bed: `Bed ${String.fromCharCode(64 + i)}`,
          kode_kelas: ruangan.kode_kelas,
          nama_kelas: ruangan.kelas,
          status_kamar: 'kosong', // STRING "kosong"
          status_text: 0 // NUMBER 0
        });
      }
    });
    
    // Filter by status_kamar
    if (status_kamar && status_kamar !== 'all') {
      if (status_kamar === '0' || status_kamar === 'kosong') {
        kamarList = kamarList.filter(k => k.status_text === 0);
      } else if (status_kamar === '1' || status_kamar === 'terisi') {
        kamarList = kamarList.filter(k => k.status_text === 1);
      }
    }
    
    // Filter by kode_ruangan
    if (kode_ruangan && kode_ruangan !== 'all') {
      kamarList = kamarList.filter(k => k.kode_ruangan === kode_ruangan);
    }
    
    // Filter by kode_kelas
    if (kode_kelas && kode_kelas !== 'all') {
      kamarList = kamarList.filter(k => k.kode_kelas === kode_kelas);
    }
    
    const response = {
      success: true,
      message: `✅ ${kamarList.length} kamar ditemukan`,
      summary: {
        total: kamarList.length,
        terisi: kamarList.filter(k => k.status_text === 1).length,
        kosong: kamarList.filter(k => k.status_text === 0).length
      },
      data: kamarList.map((k, index) => ({
        no: index + 1,
        kode_kamar: k.kode_kamar,
        kode_ruangan: k.kode_ruangan,
        nama_ruangan: k.nama_ruangan,
        no_bed: k.no_bed,
        kode_kelas: k.kode_kelas,
        nama_kelas: k.nama_kelas,
        status_kamar: k.status_kamar,
        status_text: k.status_text
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data kamar',
      data: []
    });
  }
});

// ========================
// HOME PAGE DIPERBAIKI
// ========================
app.get('/', (req, res) => {
  res.json({
    message: '🏥 EMIRS API - MODULE RAWAT INAP',
    version: '2.0.0',
    status: '✅ READY',
    endpoints: {
      // Rawat Inap
      list_pasien: 'GET /api/rawat-inap/list?status=Dirawat&kode_ruangan=RG01',
      detail_pasien: 'GET /api/rawat-inap/detail/20251205125245',
      riwayat_pasien: 'GET /api/rawat-inap/pasien/374608',
      kamar: 'GET /api/rawat-inap/kamar?status=0&kode_kelas=VIP_DELUXE',
      update_status: 'POST /api/rawat-inap/update-status',
      statistik: 'GET /api/rawat-inap/statistik',
      
      // Kamar Status
      kamar_status: 'GET /api/kamar-status?status_kamar=0&kode_ruangan=RG01'
    },
    parameter: {
      status_kamar: '0 (kosong) atau 1 (terisi) atau "kosong" atau "terisi"',
      kode_kelas: 'VIP_DELUXE, VIP_PREMIUM, KELAS_1, KELAS_2, KELAS_3, ICU',
      status_pasien: 'Dirawat, Pulang, Pindah'
    },
    contoh: [
      'http://localhost:3000/api/rawat-inap/list',
      'http://localhost:3000/api/rawat-inap/detail/20251205125245',
      'http://localhost:3000/api/rawat-inap/kamar?status=0',
      'http://localhost:3000/api/kamar-status?status_kamar=kosong',
      'http://localhost:3000/api/kamar-status?status_kamar=1'
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
    success: false,
    message: 'Terjadi kesalahan pada server'
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
  
  ✅ ENDPOINTS KAMAR STATUS:
  7. GET /api/kamar-status
  
  📋 FITUR BARU:
  - tgl_keluar & jam_keluar (null jika belum keluar)
  - Mapping kode_ruangan <-> ruangan
  - Mapping kode_kelas <-> kelas  
  - Mapping kode_kamar <-> kamar
  - status_kamar: "kosong"/"terisi" (STRING)
  - status_text: 0/1 (NUMBER)
  
  📍 CONTOH PENGGUNAAN:
  - Kamar kosong: http://localhost:${PORT}/api/kamar-status?status_kamar=0
  - Kamar terisi: http://localhost:${PORT}/api/kamar-status?status_kamar=1
  - Filter ruangan: http://localhost:${PORT}/api/kamar-status?kode_ruangan=RG01
  
  ✅ Server ready!`);
});