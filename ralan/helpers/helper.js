const { masterDokter, masterPoli } = require('../data/mockdata');

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

module.exports = {
  formatRupiah,
  hitungUmur,
  formatTanggal,
  formatTanggalOnly,
  formatJam,
  getNamaDokter,
  getNamaPoli,
  getLokasiPoli,
  getSpesialisasiDokter,
  getNamaGolongan,
  getNamaBulan,
  getKodePoli
};