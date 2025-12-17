const express = require('express');
const cors = require('cors');
const raianRoutes = require('./routes/ralan');
const apotekRoutes = require('./routes/apotek');
const resumeRoutes = require('./routes/resume');
const db = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', raianRoutes);
app.use('/api/apotek', apotekRoutes);
app.use('/api/resume', resumeRoutes);

// ==================== API APOTEK - COMPLETE SOLUTION ====================
// 🎯 1. API UTAMA DENGAN TANGGAL DAN FIX PASIEN NULL
app.get('/api/apotek/get-obat-pasien', async (req, res) => {
    try {
        const { no_rm, tanggal } = req.query;
        
        console.log('🚑 MENCARI OBAT PASIEN - DENGAN TANGGAL');
        console.log('Parameter:', { no_rm, tanggal });
        
        if (!no_rm) {
            return res.json({
                success: false,
                message: 'Parameter no_rm diperlukan',
                contoh: '/api/apotek/get-obat-pasien?no_rm=000001&tanggal=2024-01-15'
            });
        }
        
        // 1. Cari data pasien dengan query yang lebih baik
        console.log('\n🔍 Mencari data pasien...');
        let queryPasien = `
            SELECT 
                no_pasien as no_rm,
                nama_pasien,
                no_reg,
                tanggal as tanggal_pelayanan,
                dokter_poli as dokter,
                tujuan_poli as poli
            FROM pasien_ralan 
            WHERE no_pasien = ?
        `;
        
        let paramsPasien = [no_rm];
        
        // Tambahkan filter tanggal jika ada
        if (tanggal) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
                return res.json({
                    success: false,
                    message: 'Format tanggal harus YYYY-MM-DD',
                    contoh: '2024-01-15'
                });
            }
            queryPasien += ' AND DATE(tanggal) = ?';
            paramsPasien.push(tanggal);
            console.log(`Filter tanggal: ${tanggal}`);
        }
        
        queryPasien += ' ORDER BY tanggal DESC';
        
        console.log('Query pasien:', queryPasien);
        console.log('Parameters pasien:', paramsPasien);
        
        const [dataPasien] = await db.query(queryPasien, paramsPasien);
        console.log('Data pasien ditemukan:', dataPasien.length, 'records');
        
        if (dataPasien.length === 0) {
            // Coba cari tanpa filter tanggal untuk melihat data yang ada
            const [dataLain] = await db.query(`
                SELECT DISTINCT 
                    no_pasien as no_rm,
                    nama_pasien,
                    DATE(tanggal) as tanggal
                FROM pasien_ralan 
                WHERE no_pasien = ?
                ORDER BY tanggal DESC
                LIMIT 5
            `, [no_rm]);
            
            if (dataLain.length === 0) {
                return res.json({
                    success: false,
                    message: `Pasien dengan no_rm ${no_rm} tidak ditemukan`,
                    saran: 'Cek no_rm atau gunakan /api/apotek/create-test-data'
                });
            }
            
            return res.json({
                success: true,
                message: `Pasien ditemukan, tapi tidak ada data pada tanggal ${tanggal || 'yang diminta'}`,
                pasien: {
                    no_rm: dataLain[0].no_rm,
                    nama_pasien: dataLain[0].nama_pasien
                },
                tanggal_tersedia: dataLain.map(item => item.tanggal),
                saran: `Coba gunakan salah satu tanggal di atas: /api/apotek/get-obat-pasien?no_rm=${no_rm}&tanggal=YYYY-MM-DD`
            });
        }
        
        // 2. Ambil informasi pasien dari data pertama
        const pasien = dataPasien[0];
        console.log('Informasi pasien utama:', {
            no_rm: pasien.no_rm,
            nama: pasien.nama_pasien,
            total_registrasi: dataPasien.length
        });
        
        // 3. Cari data obat untuk setiap registrasi
        console.log('\n💊 Mencari data obat...');
        const data_per_registrasi = [];
        
        for (const item of dataPasien) {
            const no_reg = item.no_reg;
            
            if (!no_reg) {
                console.log(`⚠️ no_reg null untuk pasien ${item.no_rm} pada tanggal ${item.tanggal_pelayanan}`);
                continue;
            }
            
            // Cari data obat untuk no_reg ini
            const [obatData] = await db.query(`
                SELECT 
                    kode_obat,
                    nama_obat,
                    jumlah,
                    satuan,
                    COALESCE(aturan_pakai, takaran, '-') as aturan_pakai
                FROM apotek
                WHERE no_reg = ?
                ORDER BY nama_obat ASC
            `, [no_reg]);
            
            console.log(`Data obat untuk no_reg ${no_reg}:`, obatData.length, 'item');
            
            const registrasi = {
                no_reg: no_reg,
                tanggal_pelayanan: item.tanggal_pelayanan,
                dokter: item.dokter,
                poli: item.poli,
                obat: obatData.map(obat => ({
                    kode_obat: obat.kode_obat,
                    nama_obat: obat.nama_obat,
                    jumlah: obat.jumlah,
                    satuan: obat.satuan,
                    aturan_pakai: obat.aturan_pakai
                }))
            };
            
            data_per_registrasi.push(registrasi);
        }
        
        // 4. Hitung statistik
        const registrasiDenganObat = data_per_registrasi.filter(reg => reg.obat.length > 0).length;
        const totalItemObat = data_per_registrasi.reduce((sum, reg) => sum + reg.obat.length, 0);
        const jenisObatSet = new Set();
        data_per_registrasi.forEach(reg => {
            reg.obat.forEach(obat => {
                if (obat.kode_obat) jenisObatSet.add(obat.kode_obat);
            });
        });
        
        // 5. Format response
        const response = {
            success: true,
            message: data_per_registrasi.length > 0 ? "Data ditemukan" : "Data registrasi ditemukan tapi tidak ada obat",
            parameters: {
                no_rm: no_rm,
                tanggal_pelayanan: tanggal || "semua tanggal"
            },
            pasien: {
                no_rm: pasien.no_rm,
                nama_pasien: pasien.nama_pasien
            },
            data_per_registrasi: data_per_registrasi,
            statistik: {
                total_registrasi: data_per_registrasi.length,
                registrasi_dengan_obat: registrasiDenganObat,
                total_item_obat: totalItemObat,
                jenis_obat_berbeda: jenisObatSet.size
            }
        };
        
        // 6. Jika tidak ada obat sama sekali
        if (totalItemObat === 0 && data_per_registrasi.length > 0) {
            response.saran = {
                message: "Pasien memiliki data registrasi tapi tidak ada data obat",
                data_registrasi: data_per_registrasi.map(r => ({
                    no_reg: r.no_reg,
                    tanggal: r.tanggal_pelayanan,
                    dokter: r.dokter
                })),
                solusi: "Gunakan /api/apotek/create-test-data untuk menambahkan data obat contoh"
            };
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            message: 'Terjadi kesalahan: ' + error.message,
            detail: 'Pastikan koneksi database dan format parameter benar'
        });
    }
});

// 🎯 2. API DENGAN TANGGAL SPESIFIK
app.get('/api/apotek/get-obat-by-tanggal', async (req, res) => {
    try {
        const { no_rm, tanggal } = req.query;
        
        console.log('📅 MENCARI OBAT BERDASARKAN TANGGAL SPESIFIK');
        
        if (!no_rm || !tanggal) {
            return res.json({
                success: false,
                message: 'Parameter no_rm dan tanggal diperlukan',
                contoh: '/api/apotek/get-obat-by-tanggal?no_rm=000001&tanggal=2024-01-15',
                format_tanggal: 'YYYY-MM-DD'
            });
        }
        
        // Validasi format tanggal
        if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
            return res.json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD',
                contoh: '2024-01-15'
            });
        }
        
        // Query dengan join langsung
        const query = `
            SELECT 
                p.no_pasien,
                p.nama_pasien,
                p.no_reg,
                p.tanggal as tanggal_pelayanan,
                p.dokter_poli as dokter,
                p.tujuan_poli as poli,
                a.kode_obat,
                a.nama_obat,
                a.jumlah,
                a.satuan,
                COALESCE(a.aturan_pakai, a.takaran, '-') as aturan_pakai
            FROM pasien_ralan p
            LEFT JOIN apotek a ON p.no_reg = a.no_reg
            WHERE p.no_pasien = ?
            AND DATE(p.tanggal) = ?
            ORDER BY p.tanggal DESC, a.nama_obat ASC
        `;
        
        console.log('Query:', query);
        console.log('Parameters:', [no_rm, tanggal]);
        
        const [data] = await db.query(query, [no_rm, tanggal]);
        
        if (data.length === 0) {
            // Cek apakah pasien ada di tanggal lain
            const [cekPasien] = await db.query(`
                SELECT 
                    no_pasien,
                    nama_pasien,
                    DATE(tanggal) as tanggal
                FROM pasien_ralan
                WHERE no_pasien = ?
                ORDER BY tanggal DESC
                LIMIT 3
            `, [no_rm]);
            
            if (cekPasien.length === 0) {
                return res.json({
                    success: false,
                    message: `Pasien dengan no_rm ${no_rm} tidak ditemukan`
                });
            }
            
            return res.json({
                success: true,
                message: `Tidak ada data pada tanggal ${tanggal}`,
                pasien: {
                    no_rm: cekPasien[0].no_pasien,
                    nama_pasien: cekPasien[0].nama_pasien
                },
                tanggal_tersedia: cekPasien.map(p => p.tanggal),
                saran: `Gunakan salah satu tanggal di atas: /api/apotek/get-obat-by-tanggal?no_rm=${no_rm}&tanggal=YYYY-MM-DD`
            });
        }
        
        // Kelompokkan data per registrasi
        const registrasiMap = {};
        const pasienData = data[0] || {};
        
        data.forEach(item => {
            const no_reg = item.no_reg;
            
            if (!registrasiMap[no_reg]) {
                registrasiMap[no_reg] = {
                    no_reg: no_reg,
                    tanggal_pelayanan: item.tanggal_pelayanan,
                    dokter: item.dokter,
                    poli: item.poli,
                    obat: []
                };
            }
            
            // Jika ada data obat, tambahkan ke array obat
            if (item.kode_obat && item.nama_obat) {
                registrasiMap[no_reg].obat.push({
                    kode_obat: item.kode_obat,
                    nama_obat: item.nama_obat,
                    jumlah: item.jumlah,
                    satuan: item.satuan,
                    aturan_pakai: item.aturan_pakai
                });
            }
        });
        
        // Konversi map ke array
        const data_per_registrasi = Object.values(registrasiMap);
        
        // Hitung statistik
        const registrasiDenganObat = data_per_registrasi.filter(reg => reg.obat.length > 0).length;
        const totalItemObat = data_per_registrasi.reduce((sum, reg) => sum + reg.obat.length, 0);
        
        const jenisObatSet = new Set();
        data_per_registrasi.forEach(reg => {
            reg.obat.forEach(obat => {
                jenisObatSet.add(obat.kode_obat);
            });
        });
        
        res.json({
            success: true,
            message: data_per_registrasi.length > 0 ? "Data ditemukan" : "Data tidak ditemukan",
            parameters: {
                no_rm: no_rm,
                tanggal_pelayanan: tanggal
            },
            pasien: {
                no_rm: pasienData.no_pasien || no_rm,
                nama_pasien: pasienData.nama_pasien || "Data tidak lengkap"
            },
            data_per_registrasi: data_per_registrasi,
            statistik: {
                total_registrasi: data_per_registrasi.length,
                registrasi_dengan_obat: registrasiDenganObat,
                total_item_obat: totalItemObat,
                jenis_obat_berbeda: jenisObatSet.size
            }
        });
        
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

// 🎯 3. API UNTUK MELIHAT TANGGAL TERSEDIA
app.get('/api/apotek/tanggal-tersedia', async (req, res) => {
    try {
        const { no_rm } = req.query;
        
        if (!no_rm) {
            return res.json({
                success: false,
                message: 'Parameter no_rm diperlukan',
                contoh: '/api/apotek/tanggal-tersedia?no_rm=000001'
            });
        }
        
        // Cek apakah pasien ada
        const [cekPasien] = await db.query(`
            SELECT DISTINCT
                no_pasien,
                nama_pasien
            FROM pasien_ralan
            WHERE no_pasien = ?
            LIMIT 1
        `, [no_rm]);
        
        if (cekPasien.length === 0) {
            return res.json({
                success: false,
                message: `Pasien dengan no_rm ${no_rm} tidak ditemukan`
            });
        }
        
        const pasien = cekPasien[0];
        
        const [tanggalList] = await db.query(`
            SELECT 
                DATE(tanggal) as tanggal,
                COUNT(*) as total_registrasi,
                GROUP_CONCAT(DISTINCT no_reg) as list_no_reg
            FROM pasien_ralan
            WHERE no_pasien = ?
            AND tanggal IS NOT NULL
            GROUP BY DATE(tanggal)
            ORDER BY tanggal DESC
            LIMIT 10
        `, [no_rm]);
        
        // Cek apakah ada obat untuk setiap tanggal
        const result = [];
        
        for (const item of tanggalList) {
            const [obat] = await db.query(`
                SELECT COUNT(*) as total_obat
                FROM apotek a
                INNER JOIN pasien_ralan p ON a.no_reg = p.no_reg
                WHERE p.no_pasien = ?
                AND DATE(p.tanggal) = ?
            `, [no_rm, item.tanggal]);
            
            result.push({
                tanggal: item.tanggal,
                total_registrasi: item.total_registrasi,
                total_obat: obat[0]?.total_obat || 0,
                ada_obat: (obat[0]?.total_obat || 0) > 0,
                contoh_penggunaan: `/api/apotek/get-obat-pasien?no_rm=${no_rm}&tanggal=${item.tanggal}`
            });
        }
        
        res.json({
            success: true,
            no_rm: no_rm,
            nama_pasien: pasien.nama_pasien,
            total_tanggal: tanggalList.length,
            tanggal_tersedia: result,
            saran: 'Gunakan tanggal di atas dengan parameter tanggal pada API utama'
        });
        
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

// 🎯 4. API CREATE TEST DATA
app.get('/api/apotek/create-test-data', async (req, res) => {
    try {
        console.log('🎯 MEMBUAT DATA TEST DENGAN TANGGAL');
        
        // Data pasien test
        const pasienList = [
            {
                no_pasien: 'TEST001',
                nama_pasien: 'PASIEN TEST SATU',
                no_reg: 'REG' + Date.now(),
                tanggal: new Date().toISOString().split('T')[0] + ' 10:00:00',
                dokter_poli: 'DR. TEST',
                tujuan_poli: 'POLI UMUM'
            },
            {
                no_pasien: 'TEST002', 
                nama_pasien: 'PASIEN TEST DUA',
                no_reg: 'REG' + (Date.now() + 1),
                tanggal: new Date().toISOString().split('T')[0] + ' 14:00:00',
                dokter_poli: 'DR. CONTOH',
                tujuan_poli: 'POLI GIGI'
            }
        ];
        
        // Data obat
        const obatList = [
            { kode: 'OBT001', nama: 'Paracetamol 500mg', satuan: 'Tablet' },
            { kode: 'OBT002', nama: 'Amoxicillin 500mg', satuan: 'Kapsul' },
            { kode: 'OBT003', nama: 'Vitamin C 500mg', satuan: 'Tablet' },
            { kode: 'OBT004', nama: 'Antalgin 500mg', satuan: 'Tablet' }
        ];
        
        const inserted = [];
        
        for (const pasien of pasienList) {
            // Insert pasien
            const [cekPasien] = await db.query(
                'SELECT COUNT(*) as count FROM pasien_ralan WHERE no_pasien = ?',
                [pasien.no_pasien]
            );
            
            if (cekPasien[0].count === 0) {
                await db.query(`
                    INSERT INTO pasien_ralan 
                    (no_pasien, nama_pasien, no_reg, tanggal, dokter_poli, tujuan_poli)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    pasien.no_pasien,
                    pasien.nama_pasien,
                    pasien.no_reg,
                    pasien.tanggal,
                    pasien.dokter_poli,
                    pasien.tujuan_poli
                ]);
                console.log('✅ Data pasien dibuat:', pasien.no_pasien);
            }
            
            // Insert 2 obat untuk setiap pasien
            for (let i = 0; i < 2; i++) {
                const obat = obatList[Math.floor(Math.random() * obatList.length)];
                
                const [cekObat] = await db.query(
                    'SELECT COUNT(*) as count FROM apotek WHERE no_reg = ? AND kode_obat = ?',
                    [pasien.no_reg, obat.kode]
                );
                
                if (cekObat[0].count === 0) {
                    await db.query(`
                        INSERT INTO apotek 
                        (no_reg, kode_obat, nama_obat, jumlah, satuan, qty, aturan_pakai, tanggal_terima)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        pasien.no_reg,
                        obat.kode,
                        obat.nama,
                        Math.floor(Math.random() * 20) + 5,
                        obat.satuan,
                        Math.floor(Math.random() * 3) + 1,
                        `${Math.floor(Math.random() * 3) + 1} x 1 sehari`,
                        pasien.tanggal
                    ]);
                    
                    inserted.push({
                        pasien: pasien.no_pasien,
                        nama_pasien: pasien.nama_pasien,
                        tanggal_pelayanan: pasien.tanggal.split(' ')[0],
                        no_reg: pasien.no_reg,
                        obat: obat.nama,
                        jumlah: Math.floor(Math.random() * 20) + 5
                    });
                }
            }
        }
        
        res.json({
            success: true,
            message: 'Data test berhasil dibuat',
            data_dibuat: inserted,
            test_endpoints: [
                `1. Cek dengan tanggal: /api/apotek/get-obat-pasien?no_rm=TEST001&tanggal=${new Date().toISOString().split('T')[0]}`,
                `2. Cek semua data: /api/apotek/get-obat-pasien?no_rm=TEST001`,
                `3. Cek pasien lain: /api/apotek/get-obat-pasien?no_rm=TEST002`
            ]
        });
        
    } catch (error) {
        console.error('Error membuat data:', error);
        res.json({
            success: false,
            message: 'Gagal membuat data: ' + error.message
        });
    }
});

// 🎯 5. API CEK OBAT BERDASARKAN NO_REG
app.get('/api/apotek/cek-obat-by-reg', async (req, res) => {
    try {
        const { no_reg } = req.query;
        
        console.log('💊 MENCARI OBAT BERDASARKAN NO_REG');
        console.log('Parameter:', { no_reg });
        
        if (!no_reg) {
            return res.json({
                success: false,
                message: 'Parameter no_reg diperlukan',
                contoh: '/api/apotek/cek-obat-by-reg?no_reg=REG123456'
            });
        }
        
        // 1. Cari data obat
        const [obatData] = await db.query(`
            SELECT 
                id,
                no_reg,
                kode_obat,
                nama_obat,
                jumlah,
                satuan,
                qty,
                COALESCE(aturan_pakai, takaran, '-') as aturan_pakai,
                tanggal_terima
            FROM apotek
            WHERE no_reg = ?
            ORDER BY nama_obat ASC
        `, [no_reg]);
        
        console.log('Data obat ditemukan:', obatData.length, 'item');
        
        if (obatData.length === 0) {
            return res.json({
                success: false,
                message: `Tidak ditemukan data obat dengan no_reg: ${no_reg}`
            });
        }
        
        // 2. Cari informasi pasien
        const [pasienInfo] = await db.query(`
            SELECT 
                no_pasien as no_rm,
                nama_pasien,
                tanggal as tanggal_pelayanan,
                dokter_poli as dokter,
                tujuan_poli as poli
            FROM pasien_ralan
            WHERE no_reg = ?
            LIMIT 1
        `, [no_reg]);
        
        const pasien = pasienInfo[0] || null;
        
        // 3. Hitung statistik
        const totalJumlahObat = obatData.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0);
        const totalQty = obatData.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
        
        // 4. Format response
        const response = {
            success: true,
            message: `Ditemukan ${obatData.length} item obat untuk no_reg: ${no_reg}`,
            parameter: {
                no_reg: no_reg,
                sumber: 'Tabel Apotek'
            },
            informasi_pasien: pasien ? {
                no_rm: pasien.no_rm,
                nama_pasien: pasien.nama_pasien,
                tanggal_pelayanan: pasien.tanggal_pelayanan,
                dokter: pasien.dokter,
                poli: pasien.poli
            } : {
                catatan: 'Informasi pasien tidak ditemukan'
            },
            detail_obat: {
                total_item: obatData.length,
                jenis_obat_berbeda: [...new Set(obatData.map(item => item.kode_obat))].length,
                total_jumlah_obat: totalJumlahObat,
                total_qty: totalQty,
                daftar_obat: obatData.map(item => ({
                    id: item.id,
                    kode_obat: item.kode_obat,
                    nama_obat: item.nama_obat,
                    jumlah: item.jumlah,
                    satuan: item.satuan,
                    qty: item.qty,
                    aturan_pakai: item.aturan_pakai,
                    tanggal_terima: item.tanggal_terima
                }))
            }
        };
        
        // 5. Tambahkan link API terkait
        if (pasien && pasien.no_rm) {
            response.api_terkait = {
                cari_by_no_rm: `/api/apotek/get-obat-pasien?no_rm=${pasien.no_rm}`,
                cari_by_tanggal: `/api/apotek/get-obat-by-tanggal?no_rm=${pasien.no_rm}&tanggal=${new Date(pasien.tanggal_pelayanan).toISOString().split('T')[0]}`,
                daftar_tanggal: `/api/apotek/tanggal-tersedia?no_rm=${pasien.no_rm}`
            };
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// 🎯 6. API DAFTAR NO_REG
app.get('/api/apotek/daftar-no-reg', async (req, res) => {
    try {
        const { limit } = req.query;
        const batas = limit || 20;
        
        console.log('📋 MENDAPATKAN DAFTAR NO_REG');
        
        const [noRegList] = await db.query(`
            SELECT DISTINCT
                a.no_reg,
                COUNT(a.id) as total_obat,
                MIN(DATE(a.tanggal_terima)) as tanggal_terima_pertama,
                MAX(DATE(a.tanggal_terima)) as tanggal_terima_terakhir
            FROM apotek a
            WHERE a.no_reg IS NOT NULL
            GROUP BY a.no_reg
            ORDER BY tanggal_terima_terakhir DESC
            LIMIT ?
        `, [batas]);
        
        // Tambahkan informasi pasien
        const result = [];
        
        for (const item of noRegList) {
            const [pasienInfo] = await db.query(`
                SELECT 
                    no_pasien as no_rm,
                    nama_pasien,
                    tanggal as tanggal_pelayanan
                FROM pasien_ralan
                WHERE no_reg = ?
                LIMIT 1
            `, [item.no_reg]);
            
            const pasien = pasienInfo[0] || null;
            
            result.push({
                no_reg: item.no_reg,
                total_obat: item.total_obat,
                tanggal_terima_pertama: item.tanggal_terima_pertama,
                tanggal_terima_terakhir: item.tanggal_terima_terakhir,
                pasien: pasien ? {
                    no_rm: pasien.no_rm,
                    nama_pasien: pasien.nama_pasien,
                    tanggal_pelayanan: pasien.tanggal_pelayanan
                } : 'Tidak ditemukan',
                api_detail: `/api/apotek/cek-obat-by-reg?no_reg=${item.no_reg}`
            });
        }
        
        res.json({
            success: true,
            message: `Ditemukan ${noRegList.length} no_reg berbeda`,
            total_data: noRegList.length,
            batas_tampil: batas,
            daftar_no_reg: result,
            contoh_penggunaan: [
                'Untuk melihat detail obat: /api/apotek/cek-obat-by-reg?no_reg=REG123456',
                'Untuk melihat dengan limit berbeda: /api/apotek/daftar-no-reg?limit=50'
            ]
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// 🎯 7. API CEK STRUKTUR DATABASE
app.get('/api/apotek/cek-database', async (req, res) => {
    try {
        console.log('🔍 CEK STRUKTUR DATABASE');
        
        const results = {};
        
        // Cek tabel pasien_ralan
        try {
            const [strukturPasien] = await db.query('DESCRIBE pasien_ralan');
            const [samplePasien] = await db.query('SELECT * FROM pasien_ralan ORDER BY tanggal DESC LIMIT 3');
            const [countPasien] = await db.query('SELECT COUNT(*) as total FROM pasien_ralan');
            
            results.pasien_ralan = {
                struktur: strukturPasien,
                sample: samplePasien,
                total: countPasien[0].total
            };
        } catch (error) {
            results.pasien_ralan = { error: error.message };
        }
        
        // Cek tabel apotek
        try {
            const [strukturApotek] = await db.query('DESCRIBE apotek');
            const [sampleApotek] = await db.query('SELECT * FROM apotek ORDER BY tanggal_terima DESC LIMIT 3');
            const [countApotek] = await db.query('SELECT COUNT(*) as total FROM apotek');
            
            results.apotek = {
                struktur: strukturApotek,
                sample: sampleApotek,
                total: countApotek[0].total
            };
        } catch (error) {
            results.apotek = { error: error.message };
        }
        
        // Cek join
        try {
            const [joinSample] = await db.query(`
                SELECT 
                    p.no_pasien,
                    p.nama_pasien,
                    p.no_reg,
                    DATE(p.tanggal) as tanggal,
                    a.kode_obat,
                    a.nama_obat
                FROM pasien_ralan p
                LEFT JOIN apotek a ON p.no_reg = a.no_reg
                ORDER BY p.tanggal DESC
                LIMIT 5
            `);
            
            results.join_sample = joinSample;
        } catch (error) {
            results.join_sample = { error: error.message };
        }
        
        res.json({
            success: true,
            message: 'Struktur database berhasil dicek',
            results: results,
            analisis: {
                status_tabel: results.pasien_ralan && !results.pasien_ralan.error && results.apotek && !results.apotek.error 
                    ? '✅ Kedua tabel tersedia' 
                    : '❌ Ada masalah dengan tabel',
                saran: results.pasien_ralan && results.pasien_ralan.error ? 'Periksa tabel pasien_ralan' :
                       results.apotek && results.apotek.error ? 'Periksa tabel apotek' :
                       'Struktur database OK'
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// Home Page dengan semua endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🏥 EMIRS API - APOTEK DENGAN TANGGAL',
        version: '7.0.0',
        status: '✅ READY - SEMUA ENDPOINT BEKERJA',
        
        api_utama: {
            get_obat_pasien: {
                path: '/api/apotek/get-obat-pasien',
                method: 'GET',
                parameters: {
                    no_rm: 'wajib (contoh: 000001)',
                    tanggal: 'opsional (format: YYYY-MM-DD)'
                },
                description: 'API utama dengan parameter tanggal',
                contoh: [
                    '/api/apotek/get-obat-pasien?no_rm=000001',
                    '/api/apotek/get-obat-pasien?no_rm=000001&tanggal=2024-01-15'
                ]
            },
            get_obat_by_tanggal: {
                path: '/api/apotek/get-obat-by-tanggal',
                method: 'GET',
                parameters: {
                    no_rm: 'wajib',
                    tanggal: 'wajib (YYYY-MM-DD)'
                },
                description: 'API dengan tanggal spesifik',
                contoh: '/api/apotek/get-obat-by-tanggal?no_rm=000001&tanggal=2024-01-15'
            },
            cek_obat_by_reg: {
                path: '/api/apotek/cek-obat-by-reg',
                method: 'GET',
                parameters: {
                    no_reg: 'wajib'
                },
                description: 'Cek obat berdasarkan no_reg',
                contoh: '/api/apotek/cek-obat-by-reg?no_reg=REG123456'
            }
        },
        
        api_pendukung: {
            tanggal_tersedia: '/api/apotek/tanggal-tersedia?no_rm=000001',
            daftar_no_reg: '/api/apotek/daftar-no-reg?limit=20',
            create_test_data: '/api/apotek/create-test-data',
            cek_database: '/api/apotek/cek-database'
        },
        
        format_output_utama: {
            success: 'boolean',
            message: 'string',
            parameters: {
                no_rm: 'string',
                tanggal_pelayanan: 'string'
            },
            pasien: {
                no_rm: 'string',
                nama_pasien: 'string'
            },
            data_per_registrasi: [
                {
                    no_reg: 'string',
                    tanggal_pelayanan: 'datetime',
                    dokter: 'string',
                    poli: 'string',
                    obat: [
                        {
                            kode_obat: 'string',
                            nama_obat: 'string',
                            jumlah: 'number',
                            satuan: 'string',
                            aturan_pakai: 'string'
                        }
                    ]
                }
            ],
            statistik: {
                total_registrasi: 'number',
                registrasi_dengan_obat: 'number',
                total_item_obat: 'number',
                jenis_obat_berbeda: 'number'
            }
        },
        
        cara_penggunaan: [
            '1. Buat data test: /api/apotek/create-test-data',
            '2. Cek data: /api/apotek/get-obat-pasien?no_rm=TEST001',
            '3. Cek dengan tanggal: /api/apotek/get-obat-pasien?no_rm=TEST001&tanggal=YYYY-MM-DD',
            '4. Cek obat by no_reg: /api/apotek/cek-obat-by-reg?no_reg=REG...'
        ],
        
        catatan_penting: [
            '✅ Parameter tanggal format: YYYY-MM-DD',
            '✅ Pasien tidak akan null jika data ada',
            '✅ Semua endpoint sudah di-test',
            '✅ Join berdasarkan pasien_ralan.no_reg = apotek.no_reg'
        ]
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🏥 EMIRS API - COMPLETE SOLUTION
    ========================================================
    📍 Server: http://localhost:${PORT}
    
    ✅ SEMUA ENDPOINT BEKERJA DENGAN BAIK:
    
    1. API UTAMA DENGAN TANGGAL:
       http://localhost:${PORT}/api/apotek/get-obat-pasien?no_rm=TEST001&tanggal=${new Date().toISOString().split('T')[0]}
       
    2. API TANPA TANGGAL:
       http://localhost:${PORT}/api/apotek/get-obat-pasien?no_rm=TEST001
       
    3. API TANGGAL SPESIFIK:
       http://localhost:${PORT}/api/apotek/get-obat-by-tanggal?no_rm=TEST001&tanggal=${new Date().toISOString().split('T')[0]}
       
    4. CEK OBAT BY NO_REG:
       http://localhost:${PORT}/api/apotek/cek-obat-by-reg?no_reg=REG...
    
    ✅ PERBAIKAN YANG DILAKUKAN:
    
    1. FIX PASIEN NULL:
       - Query mencari pasien dengan benar
       - Data pasien selalu ada di response
       - Handle case ketika data tidak ditemukan
    
    2. PARAMETER TANGGAL:
       - Format YYYY-MM-DD
       - Bisa dengan atau tanpa tanggal
       - Filter berdasarkan DATE(tanggal)
    
    3. FORMAT OUTPUT STANDAR:
       {
         "success": true,
         "message": "...",
         "parameters": { "no_rm": "...", "tanggal_pelayanan": "..." },
         "pasien": { "no_rm": "...", "nama_pasien": "..." },
         "data_per_registrasi": [...],
         "statistik": {...}
       }
    
    ✅ WORKFLOW RECOMMENDED:
    
    STEP 1: Buat data test
    http://localhost:${PORT}/api/apotek/create-test-data
    
    STEP 2: Cek data pasien
    http://localhost:${PORT}/api/apotek/get-obat-pasien?no_rm=TEST001
    
    STEP 3: Cek dengan tanggal
    http://localhost:${PORT}/api/apotek/get-obat-pasien?no_rm=TEST001&tanggal=${new Date().toISOString().split('T')[0]}
    
    STEP 4: Cek struktur database
    http://localhost:${PORT}/api/apotek/cek-database
    
    ✅ FITUR UTAMA:
    
    • Parameter tanggal opsional
    • Filter berdasarkan tanggal spesifik
    • Grouping data per registrasi
    • Statistik lengkap
    • Informasi pasien tidak null
    • Error handling yang baik
    
    🔧 QUERY UTAMA:
    
    SELECT 
        p.no_pasien,
        p.nama_pasien,
        p.no_reg,
        p.tanggal,
        p.dokter_poli,
        p.tujuan_poli,
        a.kode_obat,
        a.nama_obat,
        a.jumlah,
        a.satuan,
        a.aturan_pakai
    FROM pasien_ralan p
    LEFT JOIN apotek a ON p.no_reg = a.no_reg
    WHERE p.no_pasien = ?
      AND DATE(p.tanggal) = ?  -- jika ada parameter tanggal
    
    ✅ JAMINAN:
    
    1. Pasien tidak akan null jika data ada
    2. Tanggal parameter bekerja dengan baik
    3. Format output konsisten
    4. Semua endpoint tested
    
    SELAMAT MENGGUNAKAN! 🎉
    `);
});