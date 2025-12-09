const pool = require('../db');
const helper = require('../helpers/helper');

const ruanganController = {
    // Ketersediaan bed per ruangan
    getKetersediaanBed: async (req, res) => {
        try {
            console.log('📊 API Ketersediaan Bed diakses');

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
            const convertedRows = helper.convertBigIntToNumber(rows);

            if (!convertedRows || convertedRows.length === 0) {
                return res.json({
                    success: true,
                    message: 'Tidak ada data ruangan ditemukan',
                    data: []
                });
            }

            // Kelompokkan data per ruangan
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

                switch(kelas) {
                    case '01':
                        dataPerRuangan[ruangan].supervip = {
                            jumlah_tt: Number(row.jumlah_tt) || 0,
                            jumlah_isi: Number(row.jumlah_isi) || 0,
                            jumlah_kosong: Number(row.jumlah_kosong) || 0
                        };
                        totalPerKelas['01'].jumlah_tt += Number(row.jumlah_tt) || 0;
                        totalPerKelas['01'].jumlah_isi += Number(row.jumlah_isi) || 0;
                        totalPerKelas['01'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                        break;
                    case '02':
                        dataPerRuangan[ruangan].vip = {
                            jumlah_tt: Number(row.jumlah_tt) || 0,
                            jumlah_isi: Number(row.jumlah_isi) || 0,
                            jumlah_kosong: Number(row.jumlah_kosong) || 0
                        };
                        totalPerKelas['02'].jumlah_tt += Number(row.jumlah_tt) || 0;
                        totalPerKelas['02'].jumlah_isi += Number(row.jumlah_isi) || 0;
                        totalPerKelas['02'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                        break;
                    case '03':
                        dataPerRuangan[ruangan].kelas_1 = {
                            jumlah_tt: Number(row.jumlah_tt) || 0,
                            jumlah_isi: Number(row.jumlah_isi) || 0,
                            jumlah_kosong: Number(row.jumlah_kosong) || 0
                        };
                        totalPerKelas['03'].jumlah_tt += Number(row.jumlah_tt) || 0;
                        totalPerKelas['03'].jumlah_isi += Number(row.jumlah_isi) || 0;
                        totalPerKelas['03'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                        break;
                    case '04':
                        dataPerRuangan[ruangan].kelas_2 = {
                            jumlah_tt: Number(row.jumlah_tt) || 0,
                            jumlah_isi: Number(row.jumlah_isi) || 0,
                            jumlah_kosong: Number(row.jumlah_kosong) || 0
                        };
                        totalPerKelas['04'].jumlah_tt += Number(row.jumlah_tt) || 0;
                        totalPerKelas['04'].jumlah_isi += Number(row.jumlah_isi) || 0;
                        totalPerKelas['04'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                        break;
                    case '05':
                        dataPerRuangan[ruangan].kelas_3 = {
                            jumlah_tt: Number(row.jumlah_tt) || 0,
                            jumlah_isi: Number(row.jumlah_isi) || 0,
                            jumlah_kosong: Number(row.jumlah_kosong) || 0
                        };
                        totalPerKelas['05'].jumlah_tt += Number(row.jumlah_tt) || 0;
                        totalPerKelas['05'].jumlah_isi += Number(row.jumlah_isi) || 0;
                        totalPerKelas['05'].jumlah_kosong += Number(row.jumlah_kosong) || 0;
                        break;
                    case '06':
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

                dataPerRuangan[ruangan].total.jumlah_tt += Number(row.jumlah_tt) || 0;
                dataPerRuangan[ruangan].total.jumlah_isi += Number(row.jumlah_isi) || 0;
                dataPerRuangan[ruangan].total.jumlah_kosong += Number(row.jumlah_kosong) || 0;
            });

            const dataArray = Object.values(dataPerRuangan);
            let grandTotal = { jumlah_tt: 0, jumlah_isi: 0, jumlah_kosong: 0 };

            Object.values(totalPerKelas).forEach(kelas => {
                grandTotal.jumlah_tt += kelas.jumlah_tt;
                grandTotal.jumlah_isi += kelas.jumlah_isi;
                grandTotal.jumlah_kosong += kelas.jumlah_kosong;
            });

            const response = {
                success: true,
                message: '✅ Data ketersediaan bed berhasil diambil',
                jumlah_ruangan: dataArray.length,
                data: dataArray,
                total_keseluruhan: {
                    supervip: totalPerKelas['01'],
                    vip: totalPerKelas['02'],
                    kelas_1: totalPerKelas['03'],
                    kelas_2: totalPerKelas['04'],
                    kelas_3: totalPerKelas['05'],
                    non_kelas: totalPerKelas['06'],
                    grand_total: grandTotal
                },
                keterangan: {
                    a: 'Jumlah TT (Tempat Tidur)',
                    b: 'Jumlah Kamar Isi',
                    c: 'Jumlah Kamar Kosong'
                }
            };

            res.json(response);

        } catch (error) {
            console.error('❌ Error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Format tabel ketersediaan bed
    getKetersediaanBedTabel: async (req, res) => {
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
            const convertedRows = helper.convertBigIntToNumber(rows);

            const tabelFormat = {
                header: ['Ruangan', 'SUPERVIP', 'VIP', 'KELAS 1', 'KELAS 2', 'KELAS 3', 'NON KELAS', 'Jumlah'],
                columns: ['A', 'B', 'C'],
                data: {}
            };

            convertedRows.forEach(row => {
                const ruangan = row.nama_ruangan;
                const kelas = helper.getNamaKelas(row.kode_kelas);
                
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
                
                if (tabelFormat.data[ruangan][kelas]) {
                    tabelFormat.data[ruangan][kelas] = {
                        A: Number(row.A) || 0,
                        B: Number(row.B) || 0,
                        C: Number(row.C) || 0
                    };
                    
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
    },

    // Cek koneksi database
    checkDatabase: async (req, res) => {
        try {
            const [result] = await pool.query('SELECT NOW() as timestamp');
            res.json({
                success: true,
                message: 'Database connection OK',
                timestamp: result[0].timestamp,
                api: 'Ketersediaan Bed API v2.0'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: error.message
            });
        }
    }
};

module.exports = ruanganController;