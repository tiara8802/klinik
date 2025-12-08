const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Helper function untuk konversi BigInt ke Number
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

// Helper function untuk mendapatkan nama kelas
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

// ========================
// API: KETERSEDIAAN BED PER RUANGAN (SESUAI SS3)
// ========================
app.get('/api/ruangan/ketersediaan-bed', async (req, res) => {
    try {
        console.log('📊 API Ketersediaan Bed diakses');

        // Query sesuai SS3: hanya A (TT), B (Isi), C (Kosong)
        const query = `
            SELECT 
                r.nama_ruangan,
                k.kode_kelas,
                COUNT(k.no_bed) AS jumlah_tt,
                SUM(CASE WHEN k.status_kamar = 'ISI' THEN 1 ELSE 0 END) AS jumlah_isi,
                SUM(CASE WHEN k.status_kamar = 'KOSONG' THEN 1 ELSE 0 END) AS jumlah_kosong
            FROM ruangan r
            LEFT JOIN kamar k ON r.kode_ruangan = k.kode_ruangan
            WHERE r.status = '1'
            GROUP BY r.nama_ruangan, k.kode_kelas
            ORDER BY 
                FIELD(r.nama_ruangan, 'ICU', 'NICU') DESC,
                r.nama_ruangan,
                k.kode_kelas
        `;

        const [rows] = await pool.query(query);
        
        // Konversi BigInt ke Number
        const convertedRows = convertBigIntToNumber(rows);

        if (!convertedRows || convertedRows.length === 0) {
            return res.json({
                success: true,
                message: 'Tidak ada data ruangan ditemukan',
                data: []
            });
        }

        console.log(`📈 Data ditemukan: ${convertedRows.length} baris`);

        // Kelompokkan data per ruangan sesuai format SS3
        const dataPerRuangan = {};
        const totalPerKelas = {
            '01': { nama: 'SUPERVIP', jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
            '02': { nama: 'VIP', jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
            '03': { nama: 'KELAS 1', jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
            '04': { nama: 'KELAS 2', jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
            '05': { nama: 'KELAS 3', jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
            '06': { nama: 'NON KELAS', jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 }
        };

        convertedRows.forEach(row => {
            const ruangan = row.nama_ruangan;
            const kelas = row.kode_kelas;

            // Inisialisasi jika ruangan baru
            if (!dataPerRuangan[ruangan]) {
                dataPerRuangan[ruangan] = {
                    ruangan: ruangan,
                    supervip: { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
                    vip: { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
                    kelas_1: { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
                    kelas_2: { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
                    kelas_3: { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
                    non_kelas: { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 },
                    total: { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 }
                };
            }

            // Update data berdasarkan kelas (sesuai SS3)
            switch(kelas) {
                case '01': // SUPERVIP
                    dataPerRuangan[ruangan].supervip = {
                        jumlah_tt: Number(row.jumlah_tt) || 0,
                        jumlah_isi: Number(row.jumlah_isi) || 0,
                        jumlah_kosong: Number(row.jumlah_kosong) || 0
                    };
                    totalPerKelas['01'].jumlah_tt += Number(row.jumlah_tt) || 0;
                    totalPerKelas['01'].jumlah_isi += Number(row.jumlah_isi) || 0;
                    totalPerKelas['01'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                    break;

                case '02': // VIP
                    dataPerRuangan[ruangan].vip = {
                        jumlah_tt: Number(row.jumlah_tt) || 0,
                        jumlah_isi: Number(row.jumlah_isi) || 0,
                        jumlah_kosong: Number(row.jumlah_kosong) || 0
                    };
                    totalPerKelas['02'].jumlah_tt += Number(row.jumlah_tt) || 0;
                    totalPerKelas['02'].jumlah_isi += Number(row.jumlah_isi) || 0;
                    totalPerKelas['02'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                    break;

                case '03': // KELAS 1
                    dataPerRuangan[ruangan].kelas_1 = {
                        jumlah_tt: Number(row.jumlah_tt) || 0,
                        jumlah_isi: Number(row.jumlah_isi) || 0,
                        jumlah_kosong: Number(row.jumlah_kosong) || 0
                    };
                    totalPerKelas['03'].jumlah_tt += Number(row.jumlah_tt) || 0;
                    totalPerKelas['03'].jumlah_isi += Number(row.jumlah_isi) || 0;
                    totalPerKelas['03'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                    break;

                case '04': // KELAS 2
                    dataPerRuangan[ruangan].kelas_2 = {
                        jumlah_tt: Number(row.jumlah_tt) || 0,
                        jumlah_isi: Number(row.jumlah_isi) || 0,
                        jumlah_kosong: Number(row.jumlah_kosong) || 0
                    };
                    totalPerKelas['04'].jumlah_tt += Number(row.jumlah_tt) || 0;
                    totalPerKelas['04'].jumlah_isi += Number(row.jumlah_isi) || 0;
                    totalPerKelas['04'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                    break;

                case '05': // KELAS 3
                    dataPerRuangan[ruangan].kelas_3 = {
                        jumlah_tt: Number(row.jumlah_tt) || 0,
                        jumlah_isi: Number(row.jumlah_isi) || 0,
                        jumlah_kosong: Number(row.jumlah_kosong) || 0
                    };
                    totalPerKelas['05'].jumlah_tt += Number(row.jumlah_tt) || 0;
                    totalPerKelas['05'].jumlah_isi += Number(row.jumlah_isi) || 0;
                    totalPerKelas['05'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                    break;

                case '06': // NON KELAS
                    dataPerRuangan[ruangan].non_kelas = {
                        jumlah_tt: Number(row.jumlah_tt) || 0,
                        jumlah_isi: Number(row.jumlah_isi) || 0,
                        jumlah_kosong: Number(row.jumlah_kosong) || 0
                    };
                    totalPerKelas['06'].jumlah_tt += Number(row.jumlah_tt) || 0;
                    totalPerKelas['06'].jumlah_isi += Number(row.jumlah_isi) || 0;
                    totalPerKelas['06'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                    break;
            }

            // Update total per ruangan
            dataPerRuangan[ruangan].total.jumlah_tt += Number(row.jumlah_tt) || 0;
            dataPerRuangan[ruangan].total.jumlah_isi += Number(row.jumlah_isi) || 0;
            dataPerRuangan[ruangan].total.jumlah_kosong += Number(row.jumlah_kosong) || 0;
        });

        // Konversi ke array untuk response
        const dataArray = Object.values(dataPerRuangan);

        // Hitung grand total
        let grandTotal = { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 };

        Object.values(totalPerKelas).forEach(kelas => {
            grandTotal.jumlah_tt += kelas.jumlah_tt;
            grandTotal.jumlah_isi += kelas.jumlah_isi;
            grandTotal.jumlah_kosong += kelas.jumlah_kosong;
        });

        // Format response sesuai SS3
        const response = {
            success: true,
            message: '✅ Data ketersediaan bed berhasil diambil',
            jumlah_ruangan: dataArray.length,
            data: dataArray,
            total_keseluruhan: {
                supervip: {
                    jumlah_tt: totalPerKelas['01'].jumlah_tt,
                    jumlah_isi: totalPerKelas['01'].jumlah_isi,
                    jumlah_kosong: totalPerKelas['01'].jumlah_kosong
                },
                vip: {
                    jumlah_tt: totalPerKelas['02'].jumlah_tt,
                    jumlah_isi: totalPerKelas['02'].jumlah_isi,
                    jumlah_kosong: totalPerKelas['02'].jumlah_kosong
                },
                kelas_1: {
                    jumlah_tt: totalPerKelas['03'].jumlah_tt,
                    jumlah_isi: totalPerKelas['03'].jumlah_isi,
                    jumlah_kosong: totalPerKelas['03'].jumlah_kosong
                },
                kelas_2: {
                    jumlah_tt: totalPerKelas['04'].jumlah_tt,
                    jumlah_isi: totalPerKelas['04'].jumlah_isi,
                    jumlah_kosong: totalPerKelas['04'].jumlah_kosong
                },
                kelas_3: {
                    jumlah_tt: totalPerKelas['05'].jumlah_tt,
                    jumlah_isi: totalPerKelas['05'].jumlah_isi,
                    jumlah_kosong: totalPerKelas['05'].jumlah_kosong
                },
                non_kelas: {
                    jumlah_tt: totalPerKelas['06'].jumlah_tt,
                    jumlah_isi: totalPerKelas['06'].jumlah_isi,
                    jumlah_kosong: totalPerKelas['06'].jumlah_kosong
                },
                grand_total: grandTotal
            },
            keterangan: {
                a: 'Jumlah TT (Tempat Tidur)',
                b: 'Jumlah Kamar Isi',
                c: 'Jumlah Kamar Kosong'
            },
            catatan: 'Data sesuai format SS3 tanpa kolom booking'
        };

        res.json(response);

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            detail: 'Periksa koneksi database atau query SQL'
        });
    }
});

// ========================
// API 2: DATA RUANGAN DALAM FORMAT TABEL (SESUAI SS3)
// ========================
app.get('/api/ruangan/ketersediaan-bed/tabel', async (req, res) => {
    try {
        console.log('📋 API Format Tabel diakses');

        const query = `
            SELECT 
                r.nama_ruangan,
                k.kode_kelas,
                COUNT(k.no_bed) AS A,
                SUM(CASE WHEN k.status_kamar = 'ISI' THEN 1 ELSE 0 END) AS B,
                SUM(CASE WHEN k.status_kamar = 'KOSONG' THEN 1 ELSE 0 END) AS C
            FROM ruangan r
            LEFT JOIN kamar k ON r.kode_ruangan = k.kode_ruangan
            WHERE r.status = '1'
            GROUP BY r.nama_ruangan, k.kode_kelas
            ORDER BY r.nama_ruangan, k.kode_kelas
        `;

        const [rows] = await pool.query(query);
        const convertedRows = convertBigIntToNumber(rows);

        // Format seperti tabel SS3
        const tabelFormat = {
            header: ['Ruangan', 'SUPERVIP', 'VIP', 'KELAS 1', 'KELAS 2', 'KELAS 3', 'NON KELAS', 'Jumlah'],
            columns: ['A', 'B', 'C'], // Sesuai SS3: A=TT, B=Isi, C=Kosong
            data: {}
        };

        convertedRows.forEach(row => {
            const ruangan = row.nama_ruangan;
            const kelas = getNamaKelas(row.kode_kelas);
            
            if (!tabelFormat.data[ruangan]) {
                tabelFormat.data[ruangan] = {
                    SUPERVIP: { A: 0, B: 0, C: 0 },
                    VIP: { A: 0, B: 0, C: 0 },
                    'KELAS 1': { A: 0, B: 0, C: 0 },
                    'KELAS 2': { A: 0, B: 0, C: 0 },
                    'KELAS 3': { A: 0, B: 0, C: 0 },
                    'NON KELAS': { A: 0, B: 0, C: 0 },
                    Jumlah: { A: 0, B: 0, C: 0 }
                };
            }
            
            // Update data berdasarkan kelas
            if (tabelFormat.data[ruangan][kelas]) {
                tabelFormat.data[ruangan][kelas] = {
                    A: Number(row.A) || 0,
                    B: Number(row.B) || 0,
                    C: Number(row.C) || 0
                };
                
                // Update total per ruangan
                tabelFormat.data[ruangan].Jumlah.A += Number(row.A) || 0;
                tabelFormat.data[ruangan].Jumlah.B += Number(row.B) || 0;
                tabelFormat.data[ruangan].Jumlah.C += Number(row.C) || 0;
            }
        });

        res.json({
            success: true,
            message: '✅ Format tabel berhasil dibuat',
            format: 'Sesuai SS3 Laporan Ketersediaan Bed',
            tabel: tabelFormat
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ========================
// API 3: CHECK DATABASE
// ========================
app.get('/api/check-db', async (req, res) => {
    try {
        const [result] = await pool.query('SELECT NOW() as timestamp');
        res.json({
            success: true,
            message: 'Database connection OK',
            timestamp: result[0].timestamp,
            api: 'Ketersediaan Bed API v2.0',
            catatan: 'Format: A=Jumlah TT, B=Jumlah Isi, C=Jumlah Kosong'
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// ========================
// HOME PAGE
// ========================
app.get('/', (req, res) => {
    res.json({
        message: '🏥 EMIRS BED MANAGEMENT API',
        version: '2.0',
        catatan: 'Sesuai format SS3 (tanpa booking)',
        endpoints: [
            'GET /api/ruangan/ketersediaan-bed - Data lengkap ketersediaan bed',
            'GET /api/ruangan/ketersediaan-bed/tabel - Format tabel seperti SS3',
            'GET /api/check-db - Cek koneksi database'
        ],
        format_data: {
            jumlah_tt: 'A = Jumlah Tempat Tidur',
            jumlah_isi: 'B = Jumlah Kamar Isi', 
            jumlah_kosong: 'C = Jumlah Kamar Kosong'
        }
    });
});

// ========================
// START SERVER
// ========================
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`
    🏥 EMIRS BED MANAGEMENT API v2.0
    ================================
    📍 http://localhost:${PORT}
    
    ✅ FORMAT: Sesuai SS3 (tanpa booking)
    ✅ Kolom: A=TT, B=Isi, C=Kosong
    
    ✅ ENDPOINTS:
    GET  /api/ruangan/ketersediaan-bed
    GET  /api/ruangan/ketersediaan-bed/tabel  
    GET  /api/check-db
    
    ✅ Server ready!`);
});