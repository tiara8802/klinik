// controllers/ranapController.js
const pool = require('../config/database');

console.log('✅ ranapController loaded successfully');

const ranapController = {
    // 1. LIST PASIEN
    list: async (req, res) => {
        try {
            const { status, kamar, search } = req.query;
            
            console.log(`📋 LIST - status: ${status}, kamar: ${kamar}, search: ${search}`);
            
            let query = `
                SELECT 
                    no_reg,
                    no_rm,
                    kode_kamar,
                    no_bed,
                    tgl_masuk,
                    jam_masuk,
                    tgl_keluar,
                    dokter,
                    diagnosa_masuk,
                    nama_pasien
                FROM pasien_inap 
                WHERE 1=1
            `;
            
            const params = [];
            
            // Filter status
            if (status && status !== 'all') {
                if (status === 'Dirawat') {
                    query += ' AND (tgl_keluar IS NULL OR tgl_keluar = "0000-00-00")';
                } else if (status === 'Pulang') {
                    query += ' AND (tgl_keluar IS NOT NULL AND tgl_keluar != "0000-00-00")';
                }
            }
            
            // Filter kamar
            if (kamar && kamar !== 'all') {
                query += ' AND kode_kamar = ?';
                params.push(kamar);
            }
            
            // Filter search
            if (search && search.trim() !== '') {
                query += ' AND (no_rm LIKE ? OR no_reg LIKE ? OR nama_pasien LIKE ?)';
                const searchTerm = `%${search.trim()}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            
            query += ' ORDER BY tgl_masuk DESC LIMIT 100';
            
            console.log('📝 Query:', query);
            console.log('📝 Params:', params);
            
            const [rows] = await pool.execute(query, params);
            
            // Format data
            const data = rows.map(p => ({
                no_reg: p.no_reg,
                no_rm: p.no_rm,
                nama_pasien: p.nama_pasien || '-',
                kamar: p.kode_kamar || '-',
                no_bed: p.no_bed || '-',
                dokter: p.dokter || '-',
                status: p.tgl_keluar && p.tgl_keluar !== '0000-00-00' ? 'Pulang' : 'Dirawat',
                tgl_masuk: formatDateTime(p.tgl_masuk, p.jam_masuk),
                tgl_keluar: p.tgl_keluar ? formatDateTime(p.tgl_keluar, '') : '-',
                diagnosa: p.diagnosa_masuk || '-'
            }));
            
            res.json({
                success: true,
                message: `✅ ${rows.length} pasien ditemukan`,
                total: rows.length,
                data: data
            });
            
        } catch (error) {
            console.error('❌ LIST ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data pasien',
                error: error.message
            });
        }
    },
    
    // 2. DETAIL PASIEN
    detail: async (req, res) => {
        try {
            const { no_reg } = req.params;
            console.log(`🔍 DETAIL: ${no_reg}`);
            
            const [rows] = await pool.execute(
                'SELECT * FROM pasien_inap WHERE no_reg = ? LIMIT 1',
                [no_reg]
            );
            
            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Pasien tidak ditemukan'
                });
            }
            
            const pasien = rows[0];
            
            res.json({
                success: true,
                data: {
                    no_reg: pasien.no_reg,
                    no_rm: pasien.no_rm,
                    nama_pasien: pasien.nama_pasien || '-',
                    kamar: pasien.kode_kamar || '-',
                    no_bed: pasien.no_bed || '-',
                    dokter: pasien.dokter || '-',
                    tgl_masuk: formatDateTime(pasien.tgl_masuk, pasien.jam_masuk),
                    tgl_keluar: pasien.tgl_keluar ? formatDateTime(pasien.tgl_keluar, pasien.jam_keluar) : '-',
                    diagnosa_masuk: pasien.diagnosa_masuk || '-',
                    status: pasien.tgl_keluar && pasien.tgl_keluar !== '0000-00-00' ? 'Pulang' : 'Dirawat'
                }
            });
            
        } catch (error) {
            console.error('❌ DETAIL ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil detail',
                error: error.message
            });
        }
    },
    
    // 3. RIWAYAT PASIEN
    riwayat: async (req, res) => {
        try {
            const { no_rm } = req.params;
            console.log(`📊 RIWAYAT: ${no_rm}`);
            
            const [rows] = await pool.execute(
                `SELECT no_reg, tgl_masuk, jam_masuk, tgl_keluar, dokter, diagnosa_masuk, kode_kamar
                 FROM pasien_inap 
                 WHERE no_rm = ? 
                 ORDER BY tgl_masuk DESC`,
                [no_rm]
            );
            
            res.json({
                success: true,
                total: rows.length,
                data: rows.map(r => ({
                    no_reg: r.no_reg,
                    tgl_masuk: formatDateTime(r.tgl_masuk, r.jam_masuk),
                    tgl_keluar: r.tgl_keluar ? formatDateTime(r.tgl_keluar, '') : '-',
                    dokter: r.dokter || '-',
                    kamar: r.kode_kamar || '-',
                    diagnosa: r.diagnosa_masuk || '-'
                }))
            });
            
        } catch (error) {
            console.error('❌ RIWAYAT ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil riwayat',
                error: error.message
            });
        }
    },
    
    // 4. STATISTIK
    statistik: async (req, res) => {
        try {
            console.log('📈 STATISTIK');
            
            const [[stats]] = await pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN (tgl_keluar IS NULL OR tgl_keluar = "0000-00-00") THEN 1 ELSE 0 END) as dirawat,
                    SUM(CASE WHEN (tgl_keluar IS NOT NULL AND tgl_keluar != "0000-00-00") THEN 1 ELSE 0 END) as pulang
                FROM pasien_inap
            `);
            
            res.json({
                success: true,
                data: {
                    total: stats.total || 0,
                    dirawat: stats.dirawat || 0,
                    pulang: stats.pulang || 0
                }
            });
            
        } catch (error) {
            console.error('❌ STATISTIK ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil statistik',
                error: error.message
            });
        }
    },
    
    // 5. SEARCH
    search: async (req, res) => {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.json({ 
                    success: true, 
                    total: 0, 
                    data: [] 
                });
            }
            
            console.log(`🔎 SEARCH: "${q}"`);
            
            const [rows] = await pool.execute(
                `SELECT no_reg, no_rm, nama_pasien, kode_kamar, no_bed, tgl_masuk, dokter
                 FROM pasien_inap 
                 WHERE no_rm LIKE ? OR nama_pasien LIKE ?
                 ORDER BY tgl_masuk DESC 
                 LIMIT 20`,
                [`%${q}%`, `%${q}%`]
            );
            
            res.json({
                success: true,
                total: rows.length,
                data: rows
            });
            
        } catch (error) {
            console.error('❌ SEARCH ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mencari',
                error: error.message
            });
        }
    },
    
    // 6. UPDATE STATUS
    updateStatus: async (req, res) => {
        try {
            const { no_reg } = req.body;
            console.log(`🔄 UPDATE STATUS: ${no_reg}`);
            
            if (!no_reg) {
                return res.status(400).json({
                    success: false,
                    message: 'No registrasi diperlukan'
                });
            }
            
            const today = new Date().toISOString().split('T')[0];
            const time = new Date().toTimeString().substring(0, 8);
            
            await pool.execute(
                'UPDATE pasien_inap SET tgl_keluar = ?, jam_keluar = ? WHERE no_reg = ?',
                [today, time, no_reg]
            );
            
            res.json({
                success: true,
                message: 'Status berhasil diupdate'
            });
            
        } catch (error) {
            console.error('❌ UPDATE ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal update',
                error: error.message
            });
        }
    },
    
    // 7. KAMAR LIST
    getKamarList: async (req, res) => {
        try {
            console.log('🏥 KAMAR LIST');
            
            const [rows] = await pool.execute(
                'SELECT DISTINCT kode_kamar FROM pasien_inap WHERE kode_kamar IS NOT NULL ORDER BY kode_kamar'
            );
            
            res.json({
                success: true,
                total: rows.length,
                data: rows.map(r => r.kode_kamar)
            });
            
        } catch (error) {
            console.error('❌ KAMAR LIST ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil kamar',
                error: error.message
            });
        }
    },
    
    // 8. CHECK TABLES
    checkTables: async (req, res) => {
        try {
            console.log('🔍 CHECK TABLES');
            
            // Cek apakah tabel pasien_inap ada
            const [[exists]] = await pool.execute(
                `SELECT COUNT(*) as exists_flag 
                 FROM information_schema.tables 
                 WHERE table_schema = DATABASE() AND table_name = 'pasien_inap'`
            );
            
            if (exists.exists_flag === 0) {
                return res.json({
                    success: false,
                    message: 'Tabel pasien_inap tidak ditemukan di database'
                });
            }
            
            // Ambil info tabel
            const [columns] = await pool.execute('DESCRIBE pasien_inap');
            const [[count]] = await pool.execute('SELECT COUNT(*) as total FROM pasien_inap');
            const [sample] = await pool.execute('SELECT * FROM pasien_inap LIMIT 2');
            
            res.json({
                success: true,
                table: 'pasien_inap',
                exists: true,
                total_rows: count.total,
                columns: columns.map(c => c.Field),
                sample_data: sample
            });
            
        } catch (error) {
            console.error('❌ CHECK TABLES ERROR:', error.message);
            res.status(500).json({
                success: false,
                message: 'Gagal check tables',
                error: error.message
            });
        }
    }
};

// ====================
// HELPER FUNCTIONS
// ====================
function formatDateTime(date, time) {
    try {
        if (!date || date === '0000-00-00') return '-';
        
        let dateTime = date;
        if (time && time !== '00:00:00') {
            dateTime = `${date} ${time}`;
        }
        
        const d = new Date(dateTime);
        if (isNaN(d.getTime())) return date;
        
        // Format: DD/MM/YYYY HH:mm
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        return date || '-';
    }
}

// Export controller
module.exports = ranapController;