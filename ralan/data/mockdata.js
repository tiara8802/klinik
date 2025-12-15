// Data Master Pasien
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

// Data Pasien Ralan
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

// Data Dokter
const masterDokter = [
  { kode_dokter: 'DOK001', nama_dokter: 'dr Feri Nirantara Swaspianadiya.Sp.PD', spesialisasi: 'Penyakit Dalam' },
  { kode_dokter: 'DOK002', nama_dokter: 'dr. Riska Hazna A.H Sp.PD', spesialisasi: 'Penyakit Dalam' },
  { kode_dokter: 'DOK003', nama_dokter: 'dr. Sari Dewi, Sp.A', spesialisasi: 'Anak' },
  { kode_dokter: 'DOK004', nama_dokter: 'dr. Ahmad Santoso, Sp.PD', spesialisasi: 'Penyakit Dalam' },
  { kode_dokter: 'DOK005', nama_dokter: 'dr. Rina Wijaya, Sp.A', spesialisasi: 'Anak' }
];

// Data Poli
const masterPoli = [
  { kode_poli: '0102005', nama_poli: 'POLI UMUM', lokasi: 'Lt. 1' },
  { kode_poli: '0102002', nama_poli: 'POLI PENYAKIT DALAM', lokasi: 'Lt. 2' },
  { kode_poli: '0102030', nama_poli: 'POLI ANAK', lokasi: 'Lt. 2' },
  { kode_poli: '0102001', nama_poli: 'POLI BEDAH', lokasi: 'Lt. 3' },
  { kode_poli: '0102003', nama_poli: 'POLI KANDUNGAN', lokasi: 'Lt. 3' },
  { kode_poli: '0102004', nama_poli: 'POLI THT', lokasi: 'Lt. 1' }
];

module.exports = {
  masterPasien,
  pasienRalan,
  masterDokter,
  masterPoli
};