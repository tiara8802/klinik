const mysql = require('mysql2/promise');
require('dotenv').config();

// Buat koneksi pool seperti di project teman (cek file controller lain)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rumah_sakit_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

class ResumeMedisController {
  // GET resume medis berdasarkan no_pasien/no_rm dan tanggal
  async getResumeByPasien(req, res) {
    try {
      const { no_pasien, tanggal_pelayanan } = req.query;

      // Validasi input
      if (!no_pasien || !tanggal_pelayanan) {
        return res.status(400).json({
          success: false,
          message: 'Parameter no_pasien dan tanggal_pelayanan diperlukan'
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

      const [rows] = await pool.execute(query, [
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
      console.error('Error in getResumeByPasien:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message
      });
    }
  }

  // GET resume medis berdasarkan no_reg dan tanggal
  async getResumeByReg(req, res) {
    try {
      const { no_reg, tanggal_pelayanan } = req.query;

      // Validasi input
      if (!no_reg || !tanggal_pelayanan) {
        return res.status(400).json({
          success: false,
          message: 'Parameter no_reg dan tanggal_pelayanan diperlukan'
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

      const [rows] = await pool.execute(query, [
        no_reg, tanggal_pelayanan,
        no_reg, tanggal_pelayanan
      ]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Data resume medis tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Resume medis berhasil diambil berdasarkan nomor registrasi',
        data: rows
      });

    } catch (error) {
      console.error('Error in getResumeByReg:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: error.message
      });
    }
  }
}

module.exports = new ResumeMedisController();