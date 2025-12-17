const db = require('../config/database');

const getObatByPasien = async (req, res) => {
    try {
        const { no_rm, tanggal_pelayanan } = req.query;

        // Validasi parameter
        if (!no_rm || !tanggal_pelayanan) {
            return res.status(400).json({
                error: true,
                message: 'Parameter no_rm dan tanggal_pelayanan wajib diisi'
            });
        }

        // Query untuk join tabel apotek dan pasien_ralan
        const query = `
            SELECT 
                a.no_reg,
                a.no_rm,
                a.tgl_pelayanan,
                a.kode_obat,
                a.nama_obat,
                a.jumlah,
                a.satuan,
                a.harga,
                a.total_harga,
                p.nama_pasien,
                p.alamat,
                p.jenis_kelamin,
                p.tgl_lahir
            FROM apotek a
            INNER JOIN pasien_ralan p ON a.no_reg = p.no_reg
            WHERE a.no_rm = ? AND DATE(a.tgl_pelayanan) = ?
            ORDER BY a.tgl_pelayanan DESC
        `;

        const [results] = await db.query(query, [no_rm, tanggal_pelayanan]);

        if (results.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Data obat tidak ditemukan'
            });
        }

        // Struktur response
        const response = {
            error: false,
            message: 'Data obat berhasil ditemukan',
            data: {
                summary: {
                    no_rm: results[0].no_rm,
                    nama_pasien: results[0].nama_pasien,
                    total_obat: results.length,
                    tanggal_pelayanan: results[0].tgl_pelayanan
                },
                detail_obat: results.map(item => ({
                    kode_obat: item.kode_obat,
                    nama_obat: item.nama_obat,
                    jumlah: item.jumlah,
                    satuan: item.satuan,
                    harga: item.harga,
                    total_harga: item.total_harga
                })),
                total_keseluruhan: results.reduce((sum, item) => sum + parseFloat(item.total_harga), 0)
            }
        };

        res.json(response);
    } catch (err) {
        console.error('❌ Database error:', err);
        res.status(500).json({
            error: true,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

const getPasienInfo = async (req, res) => {
    try {
        const { no_rm } = req.params;

        const query = `
            SELECT 
                p.no_rm,
                p.nama_pasien,
                p.alamat,
                p.jenis_kelamin,
                p.tgl_lahir,
                COUNT(DISTINCT a.tgl_pelayanan) as total_kunjungan,
                COUNT(a.kode_obat) as total_obat_diberikan
            FROM pasien_ralan p
            LEFT JOIN apotek a ON p.no_rm = a.no_rm
            WHERE p.no_rm = ?
            GROUP BY p.no_rm
        `;

        const [results] = await db.query(query, [no_rm]);

        if (results.length === 0) {
            return res.status(404).json({
                error: true,
                message: 'Data pasien tidak ditemukan'
            });
        }

        res.json({
            error: false,
            message: 'Data pasien berhasil ditemukan',
            data: results[0]
        });
    } catch (err) {
        console.error('❌ Database error:', err);
        res.status(500).json({
            error: true,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

// Ekspor fungsi
module.exports = {
    getObatByPasien,
    getPasienInfo
};