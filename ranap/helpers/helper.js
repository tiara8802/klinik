// Konversi BigInt ke Number
function convertBigIntToNumber(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'bigint') {
        return Number(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => convertBigIntToNumber(item));
    }
    
    if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = convertBigIntToNumber(obj[key]);
        }
        return newObj;
    }
    
    return obj;
}

// Format Rupiah
function formatRupiah(angka) {
    try {
        if (!angka && angka !== 0) return 'Rp 0';
        const num = parseFloat(angka) || 0;
        return 'Rp ' + num.toLocaleString('id-ID');
    } catch {
        return 'Rp 0';
    }
}

// Hitung umur
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

// Format tanggal
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

// Format tanggal saja
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

// Hitung lama dirawat
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

// Get nama kelas dari kode
function getNamaKelas(kodeKelas) {
    const mapping = {
        '01': 'SUPERVIP',
        '02': 'VIP', 
        '03': 'KELAS 1',
        '04': 'KELAS 2',
        '05': 'KELAS 3',
        '06': 'NON KELAS'
    };
    return mapping[kodeKelas] || kodeKelas || 'LAINNYA';
}

// Get kelas dari ruangan
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

// Get nama kelas dari ruangan
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

module.exports = {
    convertBigIntToNumber,
    formatRupiah,
    hitungUmur,
    formatTanggal,
    formatTanggalOnly,
    hitungLamaDirawat,
    getNamaKelas,
    getKelasFromRuangan,
    getNamaKelasFromRuangan
};