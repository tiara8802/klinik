const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// DATA MASTER PASIEN
// ========================
const masterPasien = [
  {
    no_pasien: '374469',
    nama_pasien: 'LEVIA VALENTINA. NN',
    tgl_lahir: '1990-01-01',
    jenis_kelamin: 'P',
    alamat: 'Jl. Melati No. 10, Jakarta',
    telepon: '08123456789',
    gol_darah: 'O',
    alergi: 'Tidak ada',
    nama_kk: 'Budi Santoso',
    hubungan_kk: 'Suami',
    pekerjaan: 'Karyawan Swasta',
    agama: 'Islam',
    status_perkawinan: 'Menikah',
    tgl_daftar: '2020-05-15',
    status_pasien: 'AKTIF'
  },
  {
    no_pasien: '359723',
    nama_pasien: 'NURAELA MATRIMANAH.NY',
    tgl_lahir: '1985-05-15',
    jenis_kelamin: 'P',
    alamat: 'Jl. Anggrek No. 5, Bandung',
    telepon: '08129876543',
    gol_darah: 'A',
    alergi: 'Penisilin',
    nama_kk: 'Ahmad Subagyo',
    hubungan_kk: 'Suami',
    pekerjaan: 'Ibu Rumah Tangga',
    agama: 'Islam',
    status_perkawinan: 'Menikah',
    tgl_daftar: '2019-08-20',
    status_pasien: 'AKTIF'
  },
  {
    no_pasien: '374608',
    nama_pasien: 'SARINAH PASARIBU. NN',
    tgl_lahir: '1975-03-15',
    jenis_kelamin: 'P',
    alamat: 'Jl. Mawar No. 12, Surabaya',
    telepon: '081312345678',
    gol_darah: 'B',
    alergi: 'Tidak ada',
    nama_kk: 'Rudi Hartono',
    hubungan_kk: 'Suami',
    pekerjaan: 'PNS',
    agama: 'Kristen',
    status_perkawinan: 'Menikah',
    tgl_daftar: '2021-01-10',
    status_pasien: 'AKTIF'
  },
  {
    no_pasien: '374632',
    nama_pasien: 'FATHIAN ALMAIR MUNANDAR. AN',
    tgl_lahir: '2018-08-20',
    jenis_kelamin: 'L',
    alamat: 'Jl. Kenanga No. 8, Yogyakarta',
    telepon: '081322334455',
    gol_darah: 'AB',
    alergi: 'Debu',
    nama_kk: 'Munandar',
    hubungan_kk: 'Ayah',
    pekerjaan: 'Pelajar',
    agama: 'Islam',
    status_perkawinan: 'Belum Menikah',
    tgl_daftar: '2022-03-25',
    status_pasien: 'AKTIF'
  }
];

// ========================
// DATA PASIEN_RALAN (TABEL PELAYANAN)
// ========================
const pasienRalan = [
  {
    no_reg: '20251202120535',
    no_pasien: '374469',
    tgl_periksa: '2025-12-02 12:05:35',
    jam_periksa: '12:05:35',
    kode_poli: '0102005',
    kode_dokter: 'DOK001',
    status_pasien: 'BARU',
    jenis_kunjungan: 'RAWAT JALAN',
    keluhan: 'Sakit perut, mual',
    diagnosa: 'Gastritis errosive melena',
    tindakan: 'Pemeriksaan fisik, resep obat',
    kode_tarif: 'T001',
    tarif_bpjs: 0,
    tarif_rumahsakit: 150000,
    status_bayar: 'LUNAS',
    tgl_bayar: '2025-12-02 14:30:00',
    user_entry: 'ADMIN01',
    tgl_entry: '2025-12-02 12:10:00'
  },
  {
    no_reg: '20251202093930',
    no_pasien: '359723',
    tgl_periksa: '2025-12-02 09:39:30',
    jam_periksa: '09:39:30',
    kode_poli: '0102005',
    kode_dokter: 'DOK002',
    status_pasien: 'LAMA',
    jenis_kunjungan: 'RAWAT JALAN',
    keluhan: 'Nyeri pinggang bawah',
    diagnosa: 'low back pain ISK',
    tindakan: 'Pemeriksaan urine, resep obat',
    kode_tarif: 'T002',
    tarif_bpjs: 0,
    tarif_rumahsakit: 100000,
    status_bayar: 'LUNAS',
    tgl_bayar: '2025-12-02 10:15:00',
    user_entry: 'ADMIN02',
    tgl_entry: '2025-12-02 09:45:00'
  },
  {
    no_reg: '20251203103015',
    no_pasien: '374469',
    tgl_periksa: '2025-12-03 10:30:15',
    jam_periksa: '10:30:15',
    kode_poli: '0102030',
    kode_dokter: 'DOK003',
    status_pasien: 'LAMA',
    jenis_kunjungan: 'RAWAT JALAN',
    keluhan: 'Demam, batuk',
    diagnosa: 'Flu',
    tindakan: 'Pemeriksaan tenggorokan, resep obat',
    kode_tarif: 'T003',
    tarif_bpjs: 50000,
    tarif_rumahsakit: 75000,
    status_bayar: 'LUNAS',
    tgl_bayar: '2025-12-03 11:45:00',
    user_entry: 'ADMIN01',
    tgl_entry: '2025-12-03 10:35:00'
  },
  {
    no_reg: '20251204084520',
    no_pasien: '374608',
    tgl_periksa: '2025-12-04 08:45:20',
    jam_periksa: '08:45:20',
    kode_poli: '0102002',
    kode_dokter: 'DOK004',
    status_pasien: 'BARU',
    jenis_kunjungan: 'RAWAT JALAN',
    keluhan: 'Hipertensi',
    diagnosa: 'Hipertensi Grade 2',
    tindakan: 'Pemeriksaan tekanan darah, konsultasi',
    kode_tarif: 'T004',
    tarif_bpjs: 75000,
    tarif_rumahsakit: 125000,
    status_bayar: 'BELUM',
    tgl_bayar: null,
    user_entry: 'ADMIN03',
    tgl_entry: '2025-12-04 08:50:00'
  },
  {
    no_reg: '20251205111045',
    no_pasien: '374632',
    tgl_periksa: '2025-12-05 11:10:45',
    jam_periksa: '11:10:45',
    kode_poli: '0102030',
    kode_dokter: 'DOK003',
    status_pasien: 'BARU',
    jenis_kunjungan: 'RAWAT JALAN',
    keluhan: 'Sesak napas',
    diagnosa: 'Pneumonia',
    tindakan: 'Foto thorax, terapi nebulizer',
    kode_tarif: 'T005',
    tarif_bpjs: 100000,
    tarif_rumahsakit: 200000,
    status_bayar: 'LUNAS',
    tgl_bayar: '2025-12-05 13:20:00',
    user_entry: 'ADMIN02',
    tgl_entry: '2025-12-05 11:15:00'
  }
];

// ========================
// DATA DOKTER & POLI
// ========================
const masterDokter = [
  { kode_dokter: 'DOK001', nama_dokter: 'dr Feri Nirantara Swaspianadiya.Sp.PD', spesialisasi: 'Penyakit Dalam' },
  { kode_dokter: 'DOK002', nama_dokter: 'dr. Riska Hazna A.H Sp.PD', spesialisasi: 'Penyakit Dalam' },
  { kode_dokter: 'DOK003', nama_dokter: 'dr. Sari Dewi, Sp.A', spesialisasi: 'Anak' },
  { kode_dokter: 'DOK004', nama_dokter: 'dr. Ahmad Santoso, Sp.PD', spesialisasi: 'Penyakit Dalam' },
  { kode_dokter: 'DOK005', nama_dokter: 'dr. Rina Wijaya, Sp.A', spesialisasi: 'Anak' }
];

const masterPoli = [
  { kode_poli: '0102005', nama_poli: 'POLI UMUM', lokasi: 'Lt. 1' },
  { kode_poli: '0102002', nama_poli: 'POLI PENYAKIT DALAM', lokasi: 'Lt. 2' },
  { kode_poli: '0102030', nama_poli: 'POLI ANAK', lokasi: 'Lt. 2' },
  { kode_poli: '0102001', nama_poli: 'POLI BEDAH', lokasi: 'Lt. 3' },
  { kode_poli: '0102003', nama_poli: 'POLI KANDUNGAN', lokasi: 'Lt. 3' },
  { kode_poli: '0102004', nama_poli: 'POLI THT', lokasi: 'Lt. 1' }
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
    if (typeof tanggal === 'string' && tanggal.includes(':')) return tanggal.split(' ')[1] || tanggal;
    
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return '-';
    
    const jam = date.getHours().toString().padStart(2, '0');
    const menit = date.getMinutes().toString().padStart(2, '0');
    const detik = date.getSeconds().toString().padStart(2, '0');
    
    return `${jam}:${menit}:${detik}`;
  } catch {
    return '-';
  }
}

function getNamaDokter(kodeDokter) {
  const dokter = masterDokter.find(d => d.kode_dokter === kodeDokter);
  return dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan';
}

function getNamaPoli(kodePoli) {
  const poli = masterPoli.find(p => p.kode_poli === kodePoli);
  return poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI';
}

function getLokasiPoli(kodePoli) {
  const poli = masterPoli.find(p => p.kode_poli === kodePoli);
  return poli ? poli.lokasi : '-';
}

function getSpesialisasiDokter(kodeDokter) {
  const dokter = masterDokter.find(d => d.kode_dokter === kodeDokter);
  return dokter ? dokter.spesialisasi : '-';
}

function getNamaGolongan(golongan) {
  if (!golongan) return 'UMUM';
  const gol = golongan.toString().toUpperCase();
  
  if (gol.includes('BPJS')) return 'BPJS';
  if (gol.includes('PERUSAHAAN')) return 'PERUSAHAAN';
  if (gol.includes('ASURANSI')) return 'ASURANSI';
  if (gol.includes('GRATIS')) return 'GRATIS';
  if (gol.includes('UMUM')) return 'UMUM';
  
  return 'UMUM';
}

// ========================
// API 1: GET PELAYANAN PASIEN (JOIN masterPasien + pasienRalan)
// ========================
app.get('/api/getpelayanan', async (req, res) => {
  try {
    const { no_pasien, tanggal_pelayanan } = req.query;
    
    console.log(`✅ Get pelayanan: no_pasien=${no_pasien}, tanggal_pelayanan=${tanggal_pelayanan}`);

    if (!no_pasien) {
      return res.json({
        success: false,
        message: 'Parameter no_pasien diperlukan'
      });
    }

    // Cari data master pasien
    const pasien = masterPasien.find(p => p.no_pasien === no_pasien);
    
    if (!pasien) {
      return res.json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }

    // Filter data pelayanan berdasarkan no_pasien dan tanggal
    let filteredPelayanan = pasienRalan.filter(p => p.no_pasien === no_pasien);
    
    if (tanggal_pelayanan) {
      filteredPelayanan = filteredPelayanan.filter(p => {
        const tgl = new Date(p.tgl_periksa).toISOString().split('T')[0];
        return tgl === tanggal_pelayanan.split('T')[0];
      });
    }

    // Urutkan berdasarkan tanggal terbaru
    filteredPelayanan.sort((a, b) => new Date(b.tgl_periksa) - new Date(a.tgl_periksa));

    // Join dengan data dokter dan poli untuk detail lengkap
    const pelayananDetail = filteredPelayanan.map(pelayanan => {
      const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter);
      const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
      
      return {
        ...pelayanan,
        nama_dokter_lengkap: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
        spesialisasi_dokter: dokter ? dokter.spesialisasi : '-',
        nama_poli_lengkap: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI',
        lokasi_poli: poli ? poli.lokasi : '-'
      };
    });

    const response = {
      success: true,
      message: `✅ ${pelayananDetail.length} pelayanan ditemukan untuk pasien ${no_pasien}`,
      data: {
        // Info pasien dari masterPasien
        info_pasien: {
          no_pasien: pasien.no_pasien,
          nama_pasien: pasien.nama_pasien,
          tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
          usia: hitungUmur(pasien.tgl_lahir),
          jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          alamat: pasien.alamat,
          telepon: pasien.telepon,
          gol_darah: pasien.gol_darah,
          alergi: pasien.alergi,
          pekerjaan: pasien.pekerjaan,
          status_perkawinan: pasien.status_perkawinan,
          tgl_daftar: formatTanggalOnly(pasien.tgl_daftar),
          status_pasien: pasien.status_pasien
        },
        
        // Ringkasan pelayanan
        ringkasan: {
          total_kunjungan: filteredPelayanan.length,
          total_tarif: filteredPelayanan.reduce((sum, p) => sum + p.tarif_bpjs + p.tarif_rumahsakit, 0),
          terakhir_periksa: filteredPelayanan.length > 0 ? 
            formatTanggal(filteredPelayanan[0].tgl_periksa) : 'Belum ada kunjungan'
        },
        
        // Detail pelayanan dari pasienRalan
        pelayanan: pelayananDetail.map((p, index) => ({
          no: index + 1,
          no_reg: p.no_reg,
          tgl_periksa: formatTanggal(p.tgl_periksa),
          jam_periksa: formatJam(p.jam_periksa),
          
          info_poli: {
            kode_poli: p.kode_poli,
            nama_poli: p.nama_poli_lengkap,
            lokasi: p.lokasi_poli
          },
          
          info_dokter: {
            kode_dokter: p.kode_dokter,
            nama_dokter: p.nama_dokter_lengkap,
            spesialisasi: p.spesialisasi_dokter
          },
          
          info_medis: {
            status_pasien: p.status_pasien,
            jenis_kunjungan: p.jenis_kunjungan,
            keluhan: p.keluhan,
            diagnosa: p.diagnosa,
            tindakan: p.tindakan
          },
          
          info_administrasi: {
            kode_tarif: p.kode_tarif,
            tarif_bpjs: formatRupiah(p.tarif_bpjs),
            tarif_rumahsakit: formatRupiah(p.tarif_rumahsakit),
            total_tarif: formatRupiah(p.tarif_bpjs + p.tarif_rumahsakit),
            status_bayar: p.status_bayar,
            tgl_bayar: p.tgl_bayar ? formatTanggal(p.tgl_bayar) : '-'
          },
          
          info_system: {
            user_entry: p.user_entry,
            tgl_entry: formatTanggal(p.tgl_entry)
          }
        }))
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data pelayanan'
    });
  }
});

// ========================
// API 2: LIST PASIEN (EXISTING - DIPERTAHANKAN)
// ========================
app.get('/api/list-pasien', async (req, res) => {
  try {
    const { tanggal, poli } = req.query;
    
    console.log(`✅ API dipanggil: /api/list-pasien?tanggal=${tanggal}&poli=${poli}`);

    if (!tanggal) {
      return res.json({
        success: true,
        message: 'Silakan pilih tanggal',
        data_pasien: []
      });
    }

    // Gabungkan data dari pasienRalan dengan masterPasien
    let filteredData = pasienRalan.filter(p => {
      const tgl = new Date(p.tgl_periksa).toISOString().split('T')[0];
      return tgl === tanggal.split('T')[0];
    });

    if (poli && poli !== 'all') {
      filteredData = filteredData.filter(p => p.kode_poli === poli);
    }

    // Join dengan masterPasien untuk data lengkap
    const dataLengkap = filteredData.map(pelayanan => {
      const pasien = masterPasien.find(p => p.no_pasien === pelayanan.no_pasien) || {};
      const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter) || {};
      const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli) || {};
      
      return {
        ...pelayanan,
        nama_pasien: pasien.nama_pasien || pelayanan.no_pasien,
        tgl_lahir: pasien.tgl_lahir,
        jenis_kelamin: pasien.jenis_kelamin,
        alamat: pasien.alamat,
        dokter_poli: dokter.nama_dokter || 'Dokter tidak ditemukan',
        tujuan_poli: pelayanan.kode_poli,
        nama_poli: poli.nama_poli || 'POLI TIDAK DIKETAHUI',
        status_pasien: pelayanan.status_pasien,
        diagnosa: pelayanan.diagnosa,
        no_antrian: pelayanan.no_reg.substring(8, 11) || '-',
        tarif_bpjs: pelayanan.tarif_bpjs,
        tarif_rumahsakit: pelayanan.tarif_rumahsakit
      };
    });

    const response = {
      success: true,
      message: `✅ ${dataLengkap.length} pasien ditemukan`,
      jumlah_pasien: dataLengkap.length,
      filter: {
        tanggal: tanggal,
        poli: poli ? getNamaPoli(poli) : 'Semua Poli'
      },
      data_pasien: dataLengkap.map((row, index) => ({
        no: index + 1,
        registrasi: row.no_reg,
        no_pasien: row.no_pasien,
        nama_pasien: row.nama_pasien,
        tgl_periksa: formatTanggal(row.tgl_periksa),
        gol_pasien: getNamaGolongan(row.tarif_bpjs > 0 ? 'BPJS' : 'UMUM'),
        nama_dokter: row.dokter_poli,
        
        detail: {
          poli: {
            kode: row.tujuan_poli,
            nama: row.nama_poli
          },
          no_antrian: row.no_antrian,
          status_pasien: row.status_pasien || '-',
          usia: hitungUmur(row.tgl_lahir),
          jenis_kelamin: row.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          diagnosa: row.diagnosa || '-'
        }
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    console.log('⚠️  Error ditangani:', error.message);
    res.json({
      success: false,
      message: 'Gagal mengambil data pasien'
    });
  }
});

// ========================
// API 3: DETAIL PASIEN BY NO_REG (EXISTING)
// ========================
app.get('/api/detail-pasien/:no_reg', async (req, res) => {
  try {
    const { no_reg } = req.params;
    
    console.log(`✅ Detail pasien: ${no_reg}`);

    // Cari data pelayanan
    const pelayanan = pasienRalan.find(p => p.no_reg === no_reg);
    
    if (!pelayanan) {
      return res.json({
        success: false,
        message: 'Data pelayanan tidak ditemukan'
      });
    }

    // Cari data master pasien
    const pasien = masterPasien.find(p => p.no_pasien === pelayanan.no_pasien);
    
    if (!pasien) {
      return res.json({
        success: false,
        message: 'Data pasien tidak ditemukan'
      });
    }

    // Cari data dokter dan poli
    const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter);
    const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
    
    const response = {
      success: true,
      message: '✅ Detail pasien ditemukan',
      data: {
        registrasi: pelayanan.no_reg,
        no_pasien: pasien.no_pasien,
        nama_pasien: pasien.nama_pasien,
        tgl_periksa: formatTanggal(pelayanan.tgl_periksa),
        gol_pasien: getNamaGolongan(pelayanan.tarif_bpjs > 0 ? 'BPJS' : 'UMUM'),
        nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
        
        info_pasien: {
          tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
          usia: hitungUmur(pasien.tgl_lahir),
          jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          alamat: pasien.alamat,
          telepon: pasien.telepon,
          pekerjaan: pasien.pekerjaan,
          gol_darah: pasien.gol_darah,
          alergi: pasien.alergi
        },
        
        info_pelayanan: {
          no_antrian: pelayanan.no_reg.substring(8, 11),
          tujuan_poli: {
            kode: pelayanan.kode_poli,
            nama: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI',
            lokasi: poli ? poli.lokasi : '-'
          },
          jam: {
            masuk: formatJam(pelayanan.jam_periksa),
            keluar: pelayanan.tgl_bayar ? formatJam(pelayanan.tgl_bayar) : '-'
          },
          status_pasien: pelayanan.status_pasien,
          status_bayar: pelayanan.status_bayar
        },
        
        info_medis: {
          diagnosa: pelayanan.diagnosa || '-',
          tindakan: pelayanan.tindakan || '-',
          keterangan: 'Kontrol rutin',
          keadaan_pulang: 'Baik',
          icd_10: '-'
        },
        
        info_tarif: {
          tarif_bpjs: formatRupiah(pelayanan.tarif_bpjs),
          tarif_rumahsakit: formatRupiah(pelayanan.tarif_rumahsakit),
          total: formatRupiah(pelayanan.tarif_bpjs + pelayanan.tarif_rumahsakit)
        }
      }
    };
    
    res.json(response);
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Gagal mengambil detail pasien'
    });
  }
});

// ========================
// API 4: RIWAYAT PASIEN BY NO_PASIEN (EXISTING - DIPERBAIKI)
// ========================
app.get('/api/pasien/:no_pasien', async (req, res) => {
  try {
    const { no_pasien } = req.params;
    
    console.log(`✅ Riwayat pasien: ${no_pasien}`);
    
    // Cari data master pasien
    const pasien = masterPasien.find(p => p.no_pasien === no_pasien);
    
    if (!pasien) {
      return res.json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }
    
    // Cari semua pelayanan pasien
    const riwayat = pasienRalan.filter(p => p.no_pasien === no_pasien)
      .sort((a, b) => new Date(b.tgl_periksa) - new Date(a.tgl_periksa));
    
    // Join dengan data dokter dan poli
    const riwayatLengkap = riwayat.map(pelayanan => {
      const dokter = masterDokter.find(d => d.kode_dokter === pelayanan.kode_dokter);
      const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
      
      return {
        ...pelayanan,
        nama_dokter: dokter ? dokter.nama_dokter : 'Dokter tidak ditemukan',
        nama_poli: poli ? poli.nama_poli : 'POLI TIDAK DIKETAHUI'
      };
    });
    
    const response = {
      success: true,
      message: `✅ ${riwayatLengkap.length} kunjungan ditemukan`,
      info_pasien: {
        no_pasien: pasien.no_pasien,
        nama_pasien: pasien.nama_pasien,
        tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
        usia: hitungUmur(pasien.tgl_lahir),
        jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        alamat: pasien.alamat,
        telepon: pasien.telepon,
        pekerjaan: pasien.pekerjaan,
        status_pasien: pasien.status_pasien
      },
      
      riwayat_kunjungan: riwayatLengkap.map((row, index) => ({
        no: index + 1,
        registrasi: row.no_reg,
        tgl_periksa: formatTanggal(row.tgl_periksa),
        gol_pasien: getNamaGolongan(row.tarif_bpjs > 0 ? 'BPJS' : 'UMUM'),
        nama_dokter: row.nama_dokter,
        poli: row.nama_poli,
        diagnosa: row.diagnosa || '-',
        status: row.status_pasien || '-',
        tarif_total: formatRupiah(row.tarif_bpjs + row.tarif_rumahsakit)
      }))
    };
    
    res.json(response);
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Gagal mengambil riwayat pasien'
    });
  }
});

// ========================
// API 5: LIST POLI (EXISTING)
// ========================
app.get('/api/list-poli', (req, res) => {
  console.log('✅ Daftar poli diminta');
  
  res.json({
    success: true,
    message: '✅ Daftar poli tersedia',
    data: masterPoli.map(poli => ({
      kode: poli.kode_poli,
      nama: poli.nama_poli,
      lokasi: poli.lokasi
    }))
  });
});

// ========================
// API 6: SEARCH PASIEN (EXISTING - DIPERBAIKI)
// ========================
app.get('/api/search-pasien', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    console.log(`✅ Search: ${keyword}`);

    if (!keyword) {
      return res.json({
        success: true,
        message: 'Masukkan kata kunci pencarian',
        hasil_pencarian: []
      });
    }

    const search = keyword.toLowerCase();
    
    // Cari di masterPasien
    let results = masterPasien.filter(p => 
      p.nama_pasien.toLowerCase().includes(search) ||
      p.no_pasien.includes(search) ||
      p.alamat.toLowerCase().includes(search)
    );

    // Ambil pelayanan terakhir untuk setiap pasien
    const resultsWithPelayanan = results.map(pasien => {
      const pelayananTerakhir = pasienRalan
        .filter(p => p.no_pasien === pasien.no_pasien)
        .sort((a, b) => new Date(b.tgl_periksa) - new Date(a.tgl_periksa))[0];
      
      const dokter = pelayananTerakhir ? 
        masterDokter.find(d => d.kode_dokter === pelayananTerakhir.kode_dokter) : null;
      const poli = pelayananTerakhir ? 
        masterPoli.find(p => p.kode_poli === pelayananTerakhir.kode_poli) : null;
      
      return {
        ...pasien,
        pelayanan_terakhir: pelayananTerakhir ? {
          tgl_periksa: pelayananTerakhir.tgl_periksa,
          dokter: dokter ? dokter.nama_dokter : '-',
          poli: poli ? poli.nama_poli : '-',
          diagnosa: pelayananTerakhir.diagnosa || '-'
        } : null
      };
    });
    
    res.json({
      success: true,
      message: `✅ ${results.length} hasil ditemukan`,
      keyword: keyword,
      hasil_pencarian: resultsWithPelayanan.map(pasien => ({
        no_pasien: pasien.no_pasien,
        nama_pasien: pasien.nama_pasien,
        tgl_lahir: formatTanggalOnly(pasien.tgl_lahir),
        usia: hitungUmur(pasien.tgl_lahir),
        jenis_kelamin: pasien.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        alamat: pasien.alamat,
        telepon: pasien.telepon,
        pelayanan_terakhir: pasien.pelayanan_terakhir ? {
          tgl_periksa: formatTanggal(pasien.pelayanan_terakhir.tgl_periksa),
          dokter: pasien.pelayanan_terakhir.dokter,
          poli: pasien.pelayanan_terakhir.poli,
          diagnosa: pasien.pelayanan_terakhir.diagnosa
        } : { tgl_periksa: 'Belum ada kunjungan' }
      }))
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Gagal melakukan pencarian'
    });
  }
});

// ========================
// API 7: REKAP BULANAN (EXISTING - DIPERBAIKI)
// ========================
app.get('/api/rekap-bulanan', async (req, res) => {
  try {
    const { tahun, bulan } = req.query;
    
    console.log(`✅ Rekap bulanan: ${tahun}-${bulan}`);

    // Filter data pelayanan berdasarkan bulan dan tahun
    const tahunFilter = tahun || '2025';
    const bulanFilter = bulan ? parseInt(bulan) : 12;
    
    const pelayananBulanIni = pasienRalan.filter(p => {
      const tgl = new Date(p.tgl_periksa);
      return tgl.getFullYear() == tahunFilter && 
             (tgl.getMonth() + 1) == bulanFilter;
    });

    // Group by poli
    const rekapPerPoli = {};
    
    pelayananBulanIni.forEach(pelayanan => {
      const poli = masterPoli.find(p => p.kode_poli === pelayanan.kode_poli);
      const namaPoli = poli ? poli.nama_poli : 'LAINNYA';
      
      if (!rekapPerPoli[namaPoli]) {
        rekapPerPoli[namaPoli] = {
          baru: 0,
          lama: 0,
          umum: 0,
          bpjs: 0,
          perusahaan: 0,
          pendapatan_bpjs: 0,
          pendapatan_rs: 0,
          sudah_bayar: 0,
          belum_bayar: 0
        };
      }
      
      const rekap = rekapPerPoli[namaPoli];
      
      // Status pasien
      if (pelayanan.status_pasien === 'BARU') rekap.baru++;
      else if (pelayanan.status_pasien === 'LAMA') rekap.lama++;
      
      // Golongan
      if (pelayanan.tarif_bpjs > 0) rekap.bpjs++;
      else rekap.umum++;
      
      // Pendapatan
      rekap.pendapatan_bpjs += pelayanan.tarif_bpjs;
      rekap.pendapatan_rs += pelayanan.tarif_rumahsakit;
      
      // Pembayaran
      if (pelayanan.status_bayar === 'LUNAS') rekap.sudah_bayar++;
      else rekap.belum_bayar++;
    });

    // Konversi ke array
    const rekapData = Object.entries(rekapPerPoli).map(([namaPoli, data]) => ({
      poli: namaPoli,
      ...data
    }));

    // Hitung total keseluruhan
    const totalKeseluruhan = {
      total_pasien: pelayananBulanIni.length,
      status: {
        baru: rekapData.reduce((sum, item) => sum + item.baru, 0),
        lama: rekapData.reduce((sum, item) => sum + item.lama, 0)
      },
      golongan: {
        umum: rekapData.reduce((sum, item) => sum + item.umum, 0),
        bpjs: rekapData.reduce((sum, item) => sum + item.bpjs, 0),
        perusahaan: rekapData.reduce((sum, item) => sum + item.perusahaan, 0)
      },
      pendapatan: {
        bpjs: rekapData.reduce((sum, item) => sum + item.pendapatan_bpjs, 0),
        rumah_sakit: rekapData.reduce((sum, item) => sum + item.pendapatan_rs, 0),
        total: rekapData.reduce((sum, item) => sum + item.pendapatan_bpjs + item.pendapatan_rs, 0)
      }
    };
    
    const response = {
      success: true,
      message: `✅ Rekap ${getNamaBulan(bulanFilter)} ${tahunFilter}`,
      periode: {
        tahun: tahunFilter,
        bulan: bulanFilter,
        nama_bulan: getNamaBulan(bulanFilter)
      },
      total_keseluruhan: {
        ...totalKeseluruhan,
        pendapatan: {
          bpjs: formatRupiah(totalKeseluruhan.pendapatan.bpjs),
          rumah_sakit: formatRupiah(totalKeseluruhan.pendapatan.rumah_sakit),
          total: formatRupiah(totalKeseluruhan.pendapatan.total)
        }
      },
      rekap_per_bulan: [
        {
          bulan: bulanFilter,
          nama_bulan: getNamaBulan(bulanFilter),
          data_poli: rekapData.map((item, index) => ({
            no: index + 1,
            poli: { kode: getKodePoli(item.poli), nama: item.poli },
            status: { baru: item.baru, lama: item.lama, total: item.baru + item.lama },
            golongan: { 
              umum: item.umum, 
              bpjs: item.bpjs, 
              perusahaan: item.perusahaan,
              lain: 0
            },
            pendapatan: {
              bpjs: item.pendapatan_bpjs,
              rumah_sakit: item.pendapatan_rs,
              total: item.pendapatan_bpjs + item.pendapatan_rs
            },
            pembayaran: {
              sudah: item.sudah_bayar,
              belum: item.belum_bayar,
              persentase: item.sudah_bayar + item.belum_bayar > 0 ?
                `${Math.round((item.sudah_bayar / (item.sudah_bayar + item.belum_bayar)) * 100)}%` : '0%'
            }
          }))
        }
      ]
    };
    
    res.json(response);
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Gagal mengambil data rekap'
    });
  }
});

function getNamaBulan(angkaBulan) {
  const bulan = parseInt(angkaBulan) || 12;
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return namaBulan[bulan - 1] || 'Desember';
}

function getKodePoli(namaPoli) {
  const poli = masterPoli.find(p => p.nama_poli === namaPoli);
  return poli ? poli.kode_poli : '0102005';
}

// ========================
// HOME PAGE DIPERBAIKI
// ========================
app.get('/', (req, res) => {
  res.json({
    message: '🏥 EMIRS API - RAWAT JALAN',
    version: '2.0.0',
    status: '✅ READY',
    endpoints: {
      // API Baru
      get_pelayanan: 'GET /api/getpelayanan?no_pasien=374469&tanggal_pelayanan=2025-12-02',
      
      // API Existing
      list_pasien: 'GET /api/list-pasien?tanggal=2025-12-02',
      detail_pasien: 'GET /api/detail-pasien/20251202120535',
      riwayat_pasien: 'GET /api/pasien/374469',
      list_poli: 'GET /api/list-poli',
      search_pasien: 'GET /api/search-pasien?keyword=LEVIA',
      rekap_bulanan: 'GET /api/rekap-bulanan?tahun=2025&bulan=12'
    },
    note: 'API menggunakan JOIN antara masterPasien dan pasienRalan dengan key no_pasien'
  });
});

// ========================
// ERROR HANDLING
// ========================
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

// ========================
// START SERVER
// ========================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`
  🏥 EMIRS API - RAWAT JALAN
  ==============================
  📍 http://localhost:${PORT}
  
  ✅ API BARU: GET PELAYANAN
  - GET /api/getpelayanan?no_pasien=374469
  - GET /api/getpelayanan?no_pasien=374469&tanggal_pelayanan=2025-12-02
  
  ✅ API EXISTING:
  1. GET /api/list-pasien?tanggal=2025-12-02
  2. GET /api/detail-pasien/20251202120535
  3. GET /api/pasien/374469
  4. GET /api/list-poli
  5. GET /api/search-pasien?keyword=LEVIA
  6. GET /api/rekap-bulanan?tahun=2025&bulan=12
  
  💡 FITUR GET PELAYANAN:
  - JOIN masterPasien + pasienRalan dengan key no_pasien
  - Filter berdasarkan tanggal_pelayanan (opsional)
  - Data lengkap pasien + riwayat pelayanan
  
  📍 CONTOH TEST:
  - http://localhost:3000/api/getpelayanan?no_pasien=374469
  - http://localhost:3000/api/getpelayanan?no_pasien=374469&tanggal_pelayanan=2025-12-02
  
  ✅ Server ready!`);
});