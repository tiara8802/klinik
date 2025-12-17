// server2.js - RANAP API (NULL IF EMPTY)
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Database
const pool = mysql.createPool({
    host: process.env.DB_HOST || '103.175.220.185',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emirs',
    port: process.env.DB_PORT || 3306
});

// Helper: Return null for empty, otherwise return value
function cleanValue(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (value === '' || value === '0000-00-00' || value === '0000-00-00 00:00:00') {
        return null;
    }
    return value;
}

// Helper: Format date, return null if empty
function formatDate(dateStr) {
    if (!dateStr || dateStr === '0000-00-00' || dateStr === '0000-00-00 00:00:00') {
        return null;
    }
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString('id-ID');
    } catch {
        return null;
    }
}

// Helper: Format datetime, return null if empty
function formatDateTime(dateStr, timeStr = '') {
    if (!dateStr || dateStr === '0000-00-00' || dateStr === '0000-00-00 00:00:00') {
        return null;
    }
    try {
        let datetime = dateStr;
        if (timeStr && timeStr !== '00:00:00' && timeStr !== '00:00' && timeStr !== null) {
            datetime = `${dateStr} ${timeStr}`;
        }
        const date = new Date(datetime);
        if (isNaN(date.getTime())) return null;
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
        return null;
    }
}

// Helper: Hitung lama dirawat, return null if empty
function hitungLamaDirawat(tglMasuk, tglKeluar) {
    try {
        if (!tglMasuk || tglMasuk === '0000-00-00') return null;
        
        const masuk = new Date(tglMasuk);
        if (isNaN(masuk.getTime())) return null;
        
        const keluar = tglKeluar && tglKeluar !== '0000-00-00' ? new Date(tglKeluar) : new Date();
        const diffTime = Math.abs(keluar - masuk);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return `${diffDays} hari`;
    } catch {
        return null;
    }
}

// ==================== ROUTES ====================

// 1. HOME
app.get('/', (req, res) => {
    res.json({ message: 'RANAP API Server', status: 'OK' });
});

// 2. API INFO
app.get('/api', (req, res) => {
    res.json({ 
        message: 'RANAP API', 
        endpoints: [
            'GET  /api/check-db',
            'GET  /api/ranap/list',
            'GET  /api/ranap/:no_reg',
            'GET  /api/ranap/detail/:no_reg'
        ]
    });
});

// 3. CHECK DATABASE
app.get('/api/check-db', async (req, res) => {
    try {
        const [tables] = await pool.query("SHOW TABLES LIKE 'pasien_inap'");
        
        if (tables.length === 0) {
            return res.json({ 
                success: false, 
                message: 'Tabel pasien_inap tidak ditemukan' 
            });
        }
        
        const [count] = await pool.query("SELECT COUNT(*) as total FROM pasien_inap");
        const [columns] = await pool.query("DESCRIBE pasien_inap");
        const columnNames = columns.map(col => col.Field);
        
        res.json({
            success: true,
            total_data: count[0].total,
            columns: columnNames
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DETAIL PASIEN BY NO_REG - WITH NULL VALUES
app.get('/api/ranap/:no_reg', async (req, res) => {
    try {
        const { no_reg } = req.params;
        
        console.log(`🔍 Mencari pasien: ${no_reg}`);
        
        // Query untuk semua kolom
        const [rows] = await pool.query(
            `SELECT * FROM pasien_inap WHERE no_reg = ?`,
            [no_reg]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Pasien dengan no_reg ${no_reg} tidak ditemukan`
            });
        }
        
        const pasien = rows[0];
        
        // Tentukan apakah pasien sudah pulang atau masih dirawat
        const isPulang = pasien.tgl_keluar && pasien.tgl_keluar !== '0000-00-00';
        const status = isPulang ? 'Pulang' : 'Dirawat';
        
        // Format response dengan SEMUA field - NULL jika kosong
        const response = {
            success: true,
            data: {
                // Registrasi
                no_reg: cleanValue(pasien.no_reg),
                no_rm: cleanValue(pasien.no_rm),
                no_sjp: cleanValue(pasien.no_sjp),
                
                // Identitas
                nama_pasien: cleanValue(pasien.nama_pasien),
                
                // Waktu
                tgl_masuk: cleanValue(pasien.tgl_masuk),
                jam_masuk: cleanValue(pasien.jam_masuk),
                tgl_keluar: cleanValue(pasien.tgl_keluar),
                jam_keluar: cleanValue(pasien.jam_keluar),
                tgl_masuk_formatted: formatDate(pasien.tgl_masuk),
                jam_masuk_formatted: cleanValue(pasien.jam_masuk),
                tgl_keluar_formatted: formatDate(pasien.tgl_keluar),
                jam_keluar_formatted: cleanValue(pasien.jam_keluar),
                datetime_masuk: formatDateTime(pasien.tgl_masuk, pasien.jam_masuk),
                datetime_keluar: formatDateTime(pasien.tgl_keluar, pasien.jam_keluar),
                
                // Ruangan
                kode_kamar: cleanValue(pasien.kode_kamar),
                no_bed: cleanValue(pasien.no_bed),
                kode_ruangan: cleanValue(pasien.kode_ruangan),
                
                // Medis
                dokter: cleanValue(pasien.dokter),
                dpjp: cleanValue(pasien.dpjp),
                diagnosa_masuk: cleanValue(pasien.diagnosa_masuk),
                diagnosa: cleanValue(pasien.diagnosa),
                alergi: cleanValue(pasien.alergi),
                prosedur_masuk: cleanValue(pasien.prosedur_masuk),
                cara_masuk: cleanValue(pasien.cara_masuk),
                pengirim: cleanValue(pasien.pengirim),
                
                // Kelas
                kode_kelas: cleanValue(pasien.kode_kelas),
                id_gol: cleanValue(pasien.id_gol),
                hak_kelas: cleanValue(pasien.hak_kelas),
                naik_kelas: cleanValue(pasien.naik_kelas),
                
                // Penanggung Jawab
                penanggung_jawab: cleanValue(pasien.penanggung_jawab),
                telepon_pj: cleanValue(pasien.telepon_pj),
                
                // Status
                status_bayar: cleanValue(pasien.status_bayar),
                status_pulang: cleanValue(pasien.status_pulang),
                keadaan_pulang: cleanValue(pasien.keadaan_pulang),
                
                // Generated Fields
                status: status,
                lama_dirawat: hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar)
            }
        };
        
        // Tambahkan semua field lainnya dari database yang belum termasuk
        Object.keys(pasien).forEach(key => {
            if (!response.data.hasOwnProperty(key)) {
                response.data[key] = cleanValue(pasien[key]);
            }
        });
        
        res.json(response);
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 5. DETAIL EXTENDED (RAW)
app.get('/api/ranap/detail/:no_reg', async (req, res) => {
    try {
        const { no_reg } = req.params;
        
        const [rows] = await pool.query(
            "SELECT * FROM pasien_inap WHERE no_reg = ?",
            [no_reg]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Data tidak ditemukan`
            });
        }
        
        const pasien = rows[0];
        
        // Buat response dengan semua field as-is (null tetap null)
        const responseData = {};
        
        // Tambahkan semua field dari database dengan cleaning
        Object.keys(pasien).forEach(key => {
            responseData[key] = cleanValue(pasien[key]);
        });
        
        // Tambahkan field tambahan
        const isPulang = pasien.tgl_keluar && pasien.tgl_keluar !== '0000-00-00';
        responseData.status = isPulang ? 'Pulang' : 'Dirawat';
        responseData.lama_dirawat = hitungLamaDirawat(pasien.tgl_masuk, pasien.tgl_keluar);
        responseData.datetime_masuk = formatDateTime(pasien.tgl_masuk, pasien.jam_masuk);
        responseData.datetime_keluar = formatDateTime(pasien.tgl_keluar, pasien.jam_keluar);
        
        res.json({
            success: true,
            data: responseData
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. LIST PASIEN
app.get('/api/ranap/list', async (req, res) => {
    try {
        const { search, status, kamar, page = 1, limit = 50 } = req.query;
        
        let query = `SELECT 
            no_reg,
            no_rm,
            nama_pasien,
            kode_kamar,
            no_bed,
            dokter,
            tgl_masuk,
            jam_masuk,
            tgl_keluar,
            jam_keluar,
            diagnosa_masuk,
            kode_kelas
        FROM pasien_inap`;
        
        let params = [];
        let conditions = [];
        
        if (search) {
            conditions.push("(no_rm LIKE ? OR nama_pasien LIKE ? OR no_reg LIKE ?)");
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (status === 'Dirawat') {
            conditions.push("(tgl_keluar IS NULL OR tgl_keluar = '0000-00-00')");
        } else if (status === 'Pulang') {
            conditions.push("(tgl_keluar IS NOT NULL AND tgl_keluar != '0000-00-00')");
        }
        
        if (kamar && kamar !== 'all') {
            conditions.push("kode_kamar = ?");
            params.push(kamar);
        }
        
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }
        
        query += " ORDER BY tgl_masuk DESC";
        
        // Get total
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
        const [[countResult]] = await pool.query(countQuery, params);
        const total = countResult.total || 0;
        
        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        query += " LIMIT ? OFFSET ?";
        params.push(limitNum, offset);
        
        const [rows] = await pool.query(query, params);
        
        // Format rows dengan null values
        const formattedRows = rows.map(row => {
            const isPulang = row.tgl_keluar && row.tgl_keluar !== '0000-00-00';
            
            return {
                no_reg: cleanValue(row.no_reg),
                no_rm: cleanValue(row.no_rm),
                nama_pasien: cleanValue(row.nama_pasien),
                kode_kamar: cleanValue(row.kode_kamar),
                no_bed: cleanValue(row.no_bed),
                dokter: cleanValue(row.dokter),
                diagnosa_masuk: cleanValue(row.diagnosa_masuk),
                kode_kelas: cleanValue(row.kode_kelas),
                
                // Raw dates
                tgl_masuk: cleanValue(row.tgl_masuk),
                jam_masuk: cleanValue(row.jam_masuk),
                tgl_keluar: cleanValue(row.tgl_keluar),
                jam_keluar: cleanValue(row.jam_keluar),
                
                // Formatted dates
                tgl_masuk_formatted: formatDate(row.tgl_masuk),
                jam_masuk_formatted: cleanValue(row.jam_masuk),
                tgl_keluar_formatted: formatDate(row.tgl_keluar),
                jam_keluar_formatted: cleanValue(row.jam_keluar),
                datetime_masuk: formatDateTime(row.tgl_masuk, row.jam_masuk),
                datetime_keluar: formatDateTime(row.tgl_keluar, row.jam_keluar),
                
                // Generated
                status: isPulang ? 'Pulang' : 'Dirawat',
                lama_dirawat: hitungLamaDirawat(row.tgl_masuk, row.tgl_keluar)
            };
        });
        
        res.json({
            success: true,
            total: total,
            page: pageNum,
            limit: limitNum,
            total_pages: Math.ceil(total / limitNum),
            data: formattedRows
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// 7. SEARCH
app.get('/api/ranap/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.json({ 
                success: true, 
                data: [] 
            });
        }
        
        const [rows] = await pool.query(
            `SELECT 
                no_reg,
                no_rm,
                nama_pasien,
                kode_kamar,
                no_bed,
                dokter,
                tgl_masuk,
                tgl_keluar
            FROM pasien_inap 
            WHERE no_rm LIKE ? OR nama_pasien LIKE ? OR no_reg LIKE ?
            ORDER BY tgl_masuk DESC 
            LIMIT 20`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        
        const formattedRows = rows.map(row => {
            const isPulang = row.tgl_keluar && row.tgl_keluar !== '0000-00-00';
            
            return {
                no_reg: cleanValue(row.no_reg),
                no_rm: cleanValue(row.no_rm),
                nama_pasien: cleanValue(row.nama_pasien),
                kode_kamar: cleanValue(row.kode_kamar),
                no_bed: cleanValue(row.no_bed),
                dokter: cleanValue(row.dokter),
                tgl_masuk: cleanValue(row.tgl_masuk),
                tgl_masuk_formatted: formatDate(row.tgl_masuk),
                status: isPulang ? 'Pulang' : 'Dirawat'
            };
        });
        
        res.json({
            success: true,
            total: formattedRows.length,
            data: formattedRows
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Endpoint tidak ditemukan',
        path: req.path
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
=========================================
🚀 RANAP API SERVER
📡 Port: ${PORT}
🌐 URL: http://localhost:${PORT}

📊 ENDPOINTS:
• http://localhost:${PORT}/api
• http://localhost:${PORT}/api/check-db
• http://localhost:${PORT}/api/ranap/list
• http://localhost:${PORT}/api/ranap/:no_reg
• http://localhost:${PORT}/api/ranap/detail/:no_reg
=========================================
    `);
});