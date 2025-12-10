// Data Master Obat - LENGKAP
const masterObat = [
  { kode_obat: 'OB001', nama_obat: 'Paracetamol 500mg', satuan: 'Tablet', harga: 5000, golongan: 'OBAT BEBAS' },
  { kode_obat: 'OB002', nama_obat: 'Amoxicillin 500mg', satuan: 'Tablet', harga: 7500, golongan: 'OBAT KERAS' },
  { kode_obat: 'OB003', nama_obat: 'Cetirizine 10mg', satuan: 'Tablet', harga: 3000, golongan: 'OBAT BEBAS' },
  { kode_obat: 'OB004', nama_obat: 'Omeprazole 20mg', satuan: 'Kapsul', harga: 12000, golongan: 'OBAT KERAS' },
  { kode_obat: 'OB005', nama_obat: 'Salbutamol Inhaler', satuan: 'Puff', harga: 45000, golongan: 'OBAT KERAS' },
  { kode_obat: 'OB006', nama_obat: 'Mefenamic Acid 500mg', satuan: 'Tablet', harga: 8000, golongan: 'OBAT BEBAS TERBATAS' },
  { kode_obat: 'OB007', nama_obat: 'Loratadine 10mg', satuan: 'Tablet', harga: 3500, golongan: 'OBAT BEBAS' },
  { kode_obat: 'OB008', nama_obat: 'Ranitidine 150mg', satuan: 'Tablet', harga: 6000, golongan: 'OBAT BEBAS TERBATAS' },
  { kode_obat: 'OB009', nama_obat: 'Diazepam 5mg', satuan: 'Tablet', harga: 15000, golongan: 'OBAT NARKOTIKA' },
  { kode_obat: 'OB010', nama_obat: 'Vitamin C 500mg', satuan: 'Tablet', harga: 2500, golongan: 'SUPLEMEN' }
];

// Data Apotek (Transaksi Resep) - LENGKAP & BENAR
const dataApotek = [
  {
    no_reg: '20251202120535',
    no_resep: 'RES001',
    tgl_resep: '2025-12-02 12:15:00',
    dokter: 'DOK001',
    status_resep: 'SELESAI',
    status_bayar: 'LUNAS',
    total_harga: 23000,
    user_entry: 'APT001',
    tgl_entry: '2025-12-02 12:20:00',
    detail_obat: [
      { 
        kode_obat: 'OB001', 
        nama_obat: 'Paracetamol 500mg', 
        jumlah: 10, 
        satuan: 'Tablet', 
        harga_satuan: 5000, 
        sub_total: 50000,
        aturan_pakai: '3x1 tablet setelah makan'
      },
      { 
        kode_obat: 'OB002', 
        nama_obat: 'Amoxicillin 500mg', 
        jumlah: 14, 
        satuan: 'Tablet', 
        harga_satuan: 7500, 
        sub_total: 105000,
        aturan_pakai: '2x1 tablet, habiskan'
      },
      { 
        kode_obat: 'OB007', 
        nama_obat: 'Loratadine 10mg', 
        jumlah: 7, 
        satuan: 'Tablet', 
        harga_satuan: 3500, 
        sub_total: 24500,
        aturan_pakai: '1x1 tablet pagi hari'
      }
    ]
  },
  {
    no_reg: '20251202120535',
    no_resep: 'RES002',
    tgl_resep: '2025-12-02 14:30:00',
    dokter: 'DOK001',
    status_resep: 'SELESAI',
    status_bayar: 'LUNAS',
    total_harga: 18000,
    user_entry: 'APT001',
    tgl_entry: '2025-12-02 14:35:00',
    detail_obat: [
      { 
        kode_obat: 'OB003', 
        nama_obat: 'Cetirizine 10mg', 
        jumlah: 10, 
        satuan: 'Tablet', 
        harga_satuan: 3000, 
        sub_total: 30000,
        aturan_pakai: '1x1 tablet malam hari'
      },
      { 
        kode_obat: 'OB008', 
        nama_obat: 'Ranitidine 150mg', 
        jumlah: 10, 
        satuan: 'Tablet', 
        harga_satuan: 6000, 
        sub_total: 60000,
        aturan_pakai: '2x1 tablet sebelum makan'
      }
    ]
  },
  {
    no_reg: '20251202093930',
    no_resep: 'RES003',
    tgl_resep: '2025-12-02 09:45:00',
    dokter: 'DOK002',
    status_resep: 'SELESAI',
    status_bayar: 'LUNAS',
    total_harga: 12500,
    user_entry: 'APT002',
    tgl_entry: '2025-12-02 09:50:00',
    detail_obat: [
      { 
        kode_obat: 'OB004', 
        nama_obat: 'Omeprazole 20mg', 
        jumlah: 10, 
        satuan: 'Kapsul', 
        harga_satuan: 12000, 
        sub_total: 120000,
        aturan_pakai: '1x1 kapsul pagi sebelum makan'
      },
      { 
        kode_obat: 'OB006', 
        nama_obat: 'Mefenamic Acid 500mg', 
        jumlah: 5, 
        satuan: 'Tablet', 
        harga_satuan: 8000, 
        sub_total: 40000,
        aturan_pakai: '3x1 tablet saat nyeri'
      }
    ]
  },
  {
    no_reg: '20251203103015',
    no_resep: 'RES004',
    tgl_resep: '2025-12-03 10:35:00',
    dokter: 'DOK003',
    status_resep: 'PROSES',
    status_bayar: 'BELUM',
    total_harga: 85000,
    user_entry: 'APT003',
    tgl_entry: '2025-12-03 10:40:00',
    detail_obat: [
      { 
        kode_obat: 'OB005', 
        nama_obat: 'Salbutamol Inhaler', 
        jumlah: 1, 
        satuan: 'Puff', 
        harga_satuan: 45000, 
        sub_total: 45000,
        aturan_pakai: 'Sesuai kebutuhan, max 4x/hari'
      },
      { 
        kode_obat: 'OB010', 
        nama_obat: 'Vitamin C 500mg', 
        jumlah: 16, 
        satuan: 'Tablet', 
        harga_satuan: 2500, 
        sub_total: 40000,
        aturan_pakai: '1x1 tablet setelah makan'
      }
    ]
  },
  {
    no_reg: '20251204084520',
    no_resep: 'RES005',
    tgl_resep: '2025-12-04 08:50:00',
    dokter: 'DOK004',
    status_resep: 'SELESAI',
    status_bayar: 'LUNAS',
    total_harga: 30000,
    user_entry: 'APT001',
    tgl_entry: '2025-12-04 08:55:00',
    detail_obat: [
      { 
        kode_obat: 'OB001', 
        nama_obat: 'Paracetamol 500mg', 
        jumlah: 20, 
        satuan: 'Tablet', 
        harga_satuan: 5000, 
        sub_total: 100000,
        aturan_pakai: '3x1 tablet setelah makan'
      },
      { 
        kode_obat: 'OB003', 
        nama_obat: 'Cetirizine 10mg', 
        jumlah: 10, 
        satuan: 'Tablet', 
        harga_satuan: 3000, 
        sub_total: 30000,
        aturan_pakai: '1x1 tablet malam hari'
      }
    ]
  },
  {
    no_reg: '20251205111045',
    no_resep: 'RES006',
    tgl_resep: '2025-12-05 11:20:00',
    dokter: 'DOK003',
    status_resep: 'SELESAI',
    status_bayar: 'LUNAS',
    total_harga: 52000,
    user_entry: 'APT002',
    tgl_entry: '2025-12-05 11:25:00',
    detail_obat: [
      { 
        kode_obat: 'OB002', 
        nama_obat: 'Amoxicillin 500mg', 
        jumlah: 10, 
        satuan: 'Tablet', 
        harga_satuan: 7500, 
        sub_total: 75000,
        aturan_pakai: '2x1 tablet, habiskan'
      },
      { 
        kode_obat: 'OB007', 
        nama_obat: 'Loratadine 10mg', 
        jumlah: 10, 
        satuan: 'Tablet', 
        harga_satuan: 3500, 
        sub_total: 35000,
        aturan_pakai: '1x1 tablet pagi hari'
      }
    ]
  }
];

// Data Petugas Apotek - LENGKAP
const masterApoteker = [
  { kode_apoteker: 'APT001', nama_apoteker: 'dr. Siti Nurhaliza, Apt.', status: 'AKTIF', spesialisasi: 'FARMASI KLINIS' },
  { kode_apoteker: 'APT002', nama_apoteker: 'dr. Budi Santoso, Apt.', status: 'AKTIF', spesialisasi: 'FARMASI RUMAH SAKIT' },
  { kode_apoteker: 'APT003', nama_apoteker: 'dr. Rina Dewi, Apt.', status: 'AKTIF', spesialisasi: 'FARMASI INDUSTRI' }
];

// Ekspor dengan nama yang BENAR
module.exports = {
  masterObat,
  dataApotek,
  masterApoteker
};