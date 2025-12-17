const express = require('express');

const mysql = require('mysql2/promise');

const cors = require('cors');

require('dotenv').config();


const app = express();

app.use(cors());

app.use(express.json());


// Database connection

const pool = mysql.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    port: process.env.DB_PORT || 3306,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


// Middleware untuk koneksi database

app.use(async (req, res, next) => {

    try {

        req.db = await pool.getConnection();

        req.db.connection.config.namedPlaceholders = true;

        next();

    } catch (error) {

        next(error);

    }

});


// Helper function: Decode binary jadwal (0111110) ke hari

const decodeJadwal = (binaryJadwal) => {

    const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const hariAktif = [];

    

    if (!binaryJadwal || binaryJadwal.length !== 7) return hariList;

    

    for (let i = 0; i < 7; i++) {

        if (binaryJadwal[i] === '1') {

            hariAktif.push(hariList[i]);

        }

    }

    

    return hariAktif.length > 0 ? hariAktif : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

};


// Helper function: Buat jadwal detail dari binary

const buatJadwalDetail = (binaryJadwal, id_dokter, nama_dokter, poli) => {

    const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const jadwalDetail = [];

    

    if (!binaryJadwal || binaryJadwal.length !== 7) {

        // Default jadwal jika tidak ada data

        return [{

            id_dokter: id_dokter,

            nama_dokter: nama_dokter,

            hari: 'Senin',

            jam_mulai: '08:00',

            jam_selesai: '12:00',

            poliklinik: poli || 'Poliklinik Umum',

            sumber: 'default'

        }];

    }

    

    for (let i = 0; i < 7; i++) {

        if (binaryJadwal[i] === '1') {

            // Atur jam berdasarkan hari (bisa disesuaikan)

            let jam_mulai, jam_selesai;

            

            if (hariList[i] === 'Sabtu' || hariList[i] === 'Minggu') {

                jam_mulai = '09:00';

                jam_selesai = '13:00';

            } else {

                jam_mulai = '08:00';

                jam_selesai = '16:00';

            }

            

            jadwalDetail.push({

                id_dokter: id_dokter,

                nama_dokter: nama_dokter,

                hari: hariList[i],

                jam_mulai: jam_mulai,

                jam_selesai: jam_selesai,

                poliklinik: poli || 'Poliklinik',

                sumber: 'binary_jadwal'

            });

        }

    }

    

    return jadwalDetail;

};


// Routes


// 1. GET semua dokter

app.get('/api/dokter', async (req, res) => {

    try {

        const [rows] = await req.db.query('SELECT * FROM dokter ORDER BY nama_dokter');

        res.json({

            success: true,

            data: rows

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil data dokter',

            error: error.message

        });

    }

});


// 2. GET dokter by ID

app.get('/api/dokter/:id', async (req, res) => {

    try {

        const [rows] = await req.db.query(

            'SELECT * FROM dokter WHERE id_dokter = ?',

            [req.params.id]

        );

        

        if (rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: 'Dokter tidak ditemukan'

            });

        }

        

        res.json({

            success: true,

            data: rows[0]

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil data dokter',

            error: error.message

        });

    }

});


// 3. GET semua jadwal dokter (dari field jadwal)

app.get('/api/jadwal', async (req, res) => {

    try {

        const [dokters] = await req.db.query(`

            SELECT 

                id_dokter,

                nama_dokter,

                gelar_depan,

                gelar_belakang,

                CONCAT(gelar_depan, ' ', nama_dokter, ' ', COALESCE(gelar_belakang, '')) as nama_lengkap,

                poli,

                jadwal as binary_jadwal,

                no_telp,

                email

            FROM dokter 

            WHERE jadwal IS NOT NULL AND jadwal != ''

            ORDER BY nama_dokter

        `);

        

        // Transform data: decode binary jadwal

        const jadwalAll = [];

        dokters.forEach(dokter => {

            const jadwalDetail = buatJadwalDetail(

                dokter.binary_jadwal,

                dokter.id_dokter,

                dokter.nama_lengkap,

                dokter.poli

            );

            jadwalAll.push(...jadwalDetail);

        });

        

        // Urutkan berdasarkan hari

        const urutanHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        jadwalAll.sort((a, b) => {

            return urutanHari.indexOf(a.hari) - urutanHari.indexOf(b.hari);

        });

        

        res.json({

            success: true,

            data: jadwalAll,

            total: jadwalAll.length,

            catatan: 'Jadwal di-generate dari field binary jadwal di tabel dokter'

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil jadwal dokter',

            error: error.message

        });

    }

});


// 4. GET jadwal dokter berdasarkan hari

app.get('/api/jadwal/hari/:hari', async (req, res) => {

    try {

        const hari = req.params.hari;

        const [dokters] = await req.db.query(`

            SELECT 

                id_dokter,

                nama_dokter,

                gelar_depan,

                gelar_belakang,

                CONCAT(gelar_depan, ' ', nama_dokter, ' ', COALESCE(gelar_belakang, '')) as nama_lengkap,

                poli,

                jadwal as binary_jadwal,

                no_telp,

                email

            FROM dokter 

            WHERE jadwal IS NOT NULL AND jadwal != ''

            ORDER BY nama_dokter

        `);

        

        // Filter dokter yang praktek di hari tersebut

        const jadwalHari = [];

        const hariIndex = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].indexOf(hari);

        

        dokters.forEach(dokter => {

            if (dokter.binary_jadwal && dokter.binary_jadwal[hariIndex] === '1') {

                // Atur jam berdasarkan hari

                let jam_mulai, jam_selesai;

                

                if (hari === 'Sabtu' || hari === 'Minggu') {

                    jam_mulai = '09:00';

                    jam_selesai = '13:00';

                } else {

                    jam_mulai = '08:00';

                    jam_selesai = '16:00';

                }

                

                jadwalHari.push({

                    id_dokter: dokter.id_dokter,

                    nama_dokter: dokter.nama_lengkap,

                    hari: hari,

                    jam_mulai: jam_mulai,

                    jam_selesai: jam_selesai,

                    poliklinik: dokter.poli || 'Poliklinik',

                    no_telp: dokter.no_telp,

                    email: dokter.email,

                    sumber: 'binary_jadwal'

                });

            }

        });

        

        res.json({

            success: true,

            hari: hari,

            data: jadwalHari,

            total: jadwalHari.length

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil jadwal',

            error: error.message

        });

    }

});


// 5. GET jadwal hari ini

app.get('/api/jadwal/hari-ini', async (req, res) => {

    try {

        const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        const hariIni = hariIndo[new Date().getDay()];

        const hariIndex = new Date().getDay(); // 0=Minggu, 1=Senin, dst

        

        const [dokters] = await req.db.query(`

            SELECT 

                id_dokter,

                nama_dokter,

                gelar_depan,

                gelar_belakang,

                CONCAT(gelar_depan, ' ', nama_dokter, ' ', COALESCE(gelar_belakang, '')) as nama_lengkap,

                poli,

                jadwal as binary_jadwal,

                no_telp,

                email

            FROM dokter 

            WHERE jadwal IS NOT NULL AND jadwal != ''

            ORDER BY nama_dokter

        `);

        

        // Filter dokter yang praktek hari ini

        const jadwalHariIni = [];

        

        dokters.forEach(dokter => {

            if (dokter.binary_jadwal && dokter.binary_jadwal[hariIndex] === '1') {

                // Atur jam berdasarkan hari

                let jam_mulai, jam_selesai;

                

                if (hariIni === 'Sabtu' || hariIni === 'Minggu') {

                    jam_mulai = '09:00';

                    jam_selesai = '13:00';

                } else {

                    jam_mulai = '08:00';

                    jam_selesai = '16:00';

                }

                

                jadwalHariIni.push({

                    id_dokter: dokter.id_dokter,

                    nama_dokter: dokter.nama_lengkap,

                    hari: hariIni,

                    jam_mulai: jam_mulai,

                    jam_selesai: jam_selesai,

                    poliklinik: dokter.poli || 'Poliklinik',

                    no_telp: dokter.no_telp,

                    email: dokter.email,

                    sumber: 'binary_jadwal'

                });

            }

        });

        

        res.json({

            success: true,

            hari: hariIni,

            data: jadwalHariIni,

            total: jadwalHariIni.length,

            catatan: 'Jam praktek default: Weekday 08:00-16:00, Weekend 09:00-13:00'

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil jadwal hari ini',

            error: error.message

        });

    }

});


// 6. GET jadwal dokter berdasarkan ID dokter

app.get('/api/dokter/:id/jadwal', async (req, res) => {

    try {

        const [dokter] = await req.db.query(

            'SELECT * FROM dokter WHERE id_dokter = ?',

            [req.params.id]

        );

        

        if (dokter.length === 0) {

            return res.status(404).json({

                success: false,

                message: 'Dokter tidak ditemukan'

            });

        }

        

        const dokterData = dokter[0];

        const jadwalDetail = buatJadwalDetail(

            dokterData.jadwal,

            dokterData.id_dokter,

            `${dokterData.gelar_depan} ${dokterData.nama_dokter} ${dokterData.gelar_belakang || ''}`,

            dokterData.poli

        );

        

        // Info hari praktek

        const hariPraktek = decodeJadwal(dokterData.jadwal);

        

        res.json({

            success: true,

            data: {

                dokter: {

                    id_dokter: dokterData.id_dokter,

                    nama_lengkap: `${dokterData.gelar_depan} ${dokterData.nama_dokter} ${dokterData.gelar_belakang || ''}`,

                    poli: dokterData.poli,

                    no_telp: dokterData.no_telp,

                    email: dokterData.email

                },

                jadwal: jadwalDetail,

                hari_praktek: hariPraktek,

                binary_jadwal: dokterData.jadwal,

                interpretasi: dokterData.jadwal ? 

                    `Binary: ${dokterData.jadwal} (0=tidak praktek, 1=praktek)` : 

                    'Tidak ada data jadwal'

            }

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil jadwal dokter',

            error: error.message

        });

    }

});


// 7. GET jadwal berdasarkan poli

app.get('/api/jadwal/poli/:poli', async (req, res) => {

    try {

        const poli = req.params.poli;

        const [dokters] = await req.db.query(`

            SELECT 

                id_dokter,

                nama_dokter,

                gelar_depan,

                gelar_belakang,

                CONCAT(gelar_depan, ' ', nama_dokter, ' ', COALESCE(gelar_belakang, '')) as nama_lengkap,

                poli,

                jadwal as binary_jadwal,

                no_telp

            FROM dokter 

            WHERE (poli LIKE ? OR ? = 'all') 

            AND jadwal IS NOT NULL AND jadwal != ''

            ORDER BY nama_dokter

        `, [`%${poli}%`, poli]);

        

        const jadwalPoli = [];

        dokters.forEach(dokter => {

            const jadwalDetail = buatJadwalDetail(

                dokter.binary_jadwal,

                dokter.id_dokter,

                dokter.nama_lengkap,

                dokter.poli

            );

            jadwalPoli.push(...jadwalDetail);

        });

        

        res.json({

            success: true,

            poli: poli,

            data: jadwalPoli,

            total: jadwalPoli.length

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil jadwal',

            error: error.message

        });

    }

});


// 8. Search dokter

app.get('/api/dokter/search/:keyword', async (req, res) => {

    try {

        const keyword = `%${req.params.keyword}%`;

        const [rows] = await req.db.query(`

            SELECT 

                d.*,

                decode_jadwal(d.jadwal) as hari_praktek

            FROM dokter d

            WHERE d.nama_dokter LIKE ? OR d.poli LIKE ?

            ORDER BY d.nama_dokter

        `, [keyword, keyword]);

        

        // Decode jadwal untuk setiap dokter

        const result = rows.map(dokter => ({

            ...dokter,

            hari_praktek: decodeJadwal(dokter.jadwal)

        }));

        

        res.json({

            success: true,

            data: result

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mencari dokter',

            error: error.message

        });

    }

});


// 9. GET decode binary jadwal

app.get('/api/decode-jadwal/:binary', (req, res) => {

    try {

        const binary = req.params.binary;

        const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        const hasil = [];

        

        if (!binary || binary.length !== 7) {

            return res.json({

                success: false,

                message: 'Format binary harus 7 digit (contoh: 0111110)'

            });

        }

        

        for (let i = 0; i < 7; i++) {

            hasil.push({

                hari: hariList[i],

                praktek: binary[i] === '1',

                kode: binary[i]

            });

        }

        

        const hariPraktek = hasil.filter(h => h.praktek).map(h => h.hari);

        

        res.json({

            success: true,

            binary: binary,

            interpretasi: hasil,

            hari_praktek: hariPraktek,

            total_hari_praktek: hariPraktek.length

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal decode jadwal',

            error: error.message

        });

    }

});


// 10. GET hari-hari yang ada jadwal (dari semua dokter)

app.get('/api/hari-jadwal', async (req, res) => {

    try {

        const [dokters] = await req.db.query(`

            SELECT jadwal 

            FROM dokter 

            WHERE jadwal IS NOT NULL AND jadwal != ''

        `);

        

        const hariSet = new Set();

        const hariList = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

        

        dokters.forEach(dokter => {

            if (dokter.jadwal && dokter.jadwal.length === 7) {

                for (let i = 0; i < 7; i++) {

                    if (dokter.jadwal[i] === '1') {

                        hariSet.add(hariList[i]);

                    }

                }

            }

        });

        

        const hariArray = Array.from(hariSet);

        // Urutkan sesuai urutan hari

        const urutanHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        hariArray.sort((a, b) => urutanHari.indexOf(a) - urutanHari.indexOf(b));

        

        res.json({

            success: true,

            data: hariArray,

            total: hariArray.length

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil hari jadwal',

            error: error.message

        });

    }

});


// 11. GET poli yang tersedia

app.get('/api/poli-list', async (req, res) => {

    try {

        const [rows] = await req.db.query(`

            SELECT DISTINCT poli 

            FROM dokter 

            WHERE poli IS NOT NULL AND poli != ''

            ORDER BY poli

        `);

        

        res.json({

            success: true,

            data: rows.map(row => row.poli)

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil list poli',

            error: error.message

        });

    }

});


// 12. GET dokter dengan jadwal lengkap

app.get('/api/dokter-with-jadwal', async (req, res) => {

    try {

        const [dokters] = await req.db.query(`

            SELECT 

                id_dokter,

                nama_dokter,

                gelar_depan,

                gelar_belakang,

                CONCAT(gelar_depan, ' ', nama_dokter, ' ', COALESCE(gelar_belakang, '')) as nama_lengkap,

                poli,

                jadwal as binary_jadwal,

                no_telp,

                email

            FROM dokter 

            WHERE jadwal IS NOT NULL AND jadwal != ''

            ORDER BY nama_dokter

        `);

        

        const result = dokters.map(dokter => ({

            ...dokter,

            hari_praktek: decodeJadwal(dokter.binary_jadwal),

            jadwal_detail: buatJadwalDetail(

                dokter.binary_jadwal,

                dokter.id_dokter,

                dokter.nama_lengkap,

                dokter.poli

            )

        }));

        

        res.json({

            success: true,

            data: result,

            total: result.length

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: 'Gagal mengambil data dokter dengan jadwal',

            error: error.message

        });

    }

});

<<<<<<< HEAD
// ============================================
// RESUME MEDIS ENDPOINTS - TAMBAHAN BARU
// ============================================

// 13. GET resume medis berdasarkan no_pasien/no_rm dan tanggal
app.get('/api/resume-medis', async (req, res) => {
    try {
        const { no_pasien, tanggal_pelayanan } = req.query;

        // Validasi input
        if (!no_pasien || !tanggal_pelayanan) {
            return res.status(400).json({
                success: false,
                message: 'Parameter no_pasien dan tanggal_pelayanan diperlukan'
            });
        }

        // Validasi format tanggal (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(tanggal_pelayanan)) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
            });
        }

        // Query untuk mencari data dari pasien_ralan dan pasien_igd
        const query = `
            (SELECT 
                pr.no_pasien as identifier,
                pr.keluhan_utama,
                pr.s,
                pr.o,
                pr.a,
                pr.p,
                pr.tanggal,
                pr.no_reg,
                'RALAN' as jenis_pelayanan
            FROM pasien_ralan pr
            WHERE pr.no_pasien = ? 
                AND DATE(pr.tanggal) = ?)
            
            UNION
            
            (SELECT 
                pi.no_rm as identifier,
                pi.keluhan_utama,
                pi.s,
                pi.o,
                pi.a,
                pi.p,
                pi.tanggal,
                pi.no_reg,
                'IGD' as jenis_pelayanan
            FROM pasien_igd pi
            WHERE pi.no_rm = ? 
                AND DATE(pi.tanggal) = ?)
            
            ORDER BY tanggal DESC
        `;

        const [rows] = await req.db.execute(query, [
            no_pasien, tanggal_pelayanan,
            no_pasien, tanggal_pelayanan
        ]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data resume medis tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Resume medis berhasil diambil',
            data: rows
        });

    } catch (error) {
        console.error('Error in /api/resume-medis:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
});


// 15. GET search resume medis (fleksibel)
app.get('/api/resume-medis/search', async (req, res) => {
    try {
        const { no_pasien, no_reg, tanggal } = req.query;

        // Validasi minimal salah satu parameter ada
        if (!no_pasien && !no_reg) {
            return res.status(400).json({
                success: false,
                message: 'Salah satu parameter diperlukan: no_pasien atau no_reg'
            });
        }

        if (!tanggal) {
            return res.status(400).json({
                success: false,
                message: 'Parameter tanggal diperlukan'
            });
        }

        // Validasi format tanggal
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(tanggal)) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
            });
        }

        let rows;
        if (no_pasien) {
            const query = `
                (SELECT 
                    pr.no_pasien as identifier,
                    pr.keluhan_utama,
                    pr.s,
                    pr.o,
                    pr.a,
                    pr.p,
                    pr.tanggal,
                    pr.no_reg,
                    'RALAN' as jenis_pelayanan
                FROM pasien_ralan pr
                WHERE pr.no_pasien = ? 
                    AND DATE(pr.tanggal) = ?)
                
                UNION
                
                (SELECT 
                    pi.no_rm as identifier,
                    pi.keluhan_utama,
                    pi.s,
                    pi.o,
                    pi.a,
                    pi.p,
                    pi.tanggal,
                    pi.no_reg,
                    'IGD' as jenis_pelayanan
                FROM pasien_igd pi
                WHERE pi.no_rm = ? 
                    AND DATE(pi.tanggal) = ?)
                
                ORDER BY tanggal DESC
            `;

            [rows] = await req.db.execute(query, [
                no_pasien, tanggal,
                no_pasien, tanggal
            ]);
        } else if (no_reg) {
            const query = `
                (SELECT 
                    pr.no_pasien as identifier,
                    pr.keluhan_utama,
                    pr.s,
                    pr.o,
                    pr.a,
                    pr.p,
                    pr.tanggal,
                    pr.no_reg,
                    'RALAN' as jenis_pelayanan
                FROM pasien_ralan pr
                WHERE pr.no_reg = ? 
                    AND DATE(pr.tanggal) = ?)
                
                UNION
                
                (SELECT 
                    pi.no_rm as identifier,
                    pi.keluhan_utama,
                    pi.s,
                    pi.o,
                    pi.a,
                    pi.p,
                    pi.tanggal,
                    pi.no_reg,
                    'IGD' as jenis_pelayanan
                FROM pasien_igd pi
                WHERE pi.no_reg = ? 
                    AND DATE(pi.tanggal) = ?)
                
                ORDER BY tanggal DESC
            `;

            [rows] = await req.db.execute(query, [
                no_reg, tanggal,
                no_reg, tanggal
            ]);
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data resume medis tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Pencarian resume medis berhasil',
            data: rows
        });

    } catch (error) {
        console.error('Error in /api/resume-medis/search:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
});

// 16. GET health check khusus resume medis
app.get('/api/resume-medis/health', async (req, res) => {
    try {
        // Cek koneksi ke tabel yang dibutuhkan
        const [tables] = await req.db.query(`
            SHOW TABLES LIKE 'pasien_ralan' OR 
            SHOW TABLES LIKE 'pasien_igd'
        `);
        
        const tablesExist = tables.length > 0;
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        res.json({
            success: true,
            service: 'resume-medis-api',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: true,
                required_tables_exist: tablesExist,
                tables_found: tableNames
            },
            endpoints: [
                '/api/resume-medis?no_pasien=123&tanggal_pelayanan=2024-01-15',
                '/api/resume-medis/by-reg?no_reg=REG001&tanggal_pelayanan=2024-01-15',
                '/api/resume-medis/search?no_pasien=123&tanggal=2024-01-15'
            ]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            service: 'resume-medis-api',
            status: 'unhealthy',
            error: error.message
        });
    }
});
=======
>>>>>>> 410ea3cb3c9333980d519a5d0018d3b3ebf0aa5d

// Error handling middleware

app.use((error, req, res, next) => {

    console.error('Server Error:', error);

    res.status(500).json({

        success: false,

        message: 'Terjadi kesalahan pada server',

        error: error.message

    });

});


// 404 handler

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: 'Endpoint tidak ditemukan'

    });

});


// Start server

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);

    console.log(`📊 Menggunakan field 'jadwal' dari tabel dokter`);

    console.log(`🎯 Contoh binary jadwal: 0111110 = Senin-Jumat praktek`);
<<<<<<< HEAD
    console.log(`\n🆕 ENDPOINT RESUME MEDIS BARU:`);
    console.log(`   📍 GET  /api/resume-medis?no_pasien=123&tanggal_pelayanan=2024-01-15`);
    console.log(`   📍 GET  /api/resume-medis/by-reg?no_reg=REG001&tanggal_pelayanan=2024-01-15`);
    console.log(`   📍 GET  /api/resume-medis/search?no_pasien=123&tanggal=2024-01-15`);
    console.log(`   📍 GET  /api/resume-medis/health - Health check`);
=======

>>>>>>> 410ea3cb3c9333980d519a5d0018d3b3ebf0aa5d
});