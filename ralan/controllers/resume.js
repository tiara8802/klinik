const pool = require('../db');

/**
 * @desc    Get medical resume with JOIN pasien_ralan + pasien_igd
 * @route   GET /api/resume-medis
 * @access  Public
 */
const getResumeMedis = async (req, res) => {
  try {
    const { no_pasien, tanggal_pelayanan } = req.query;

    // VALIDASI
    if (!no_pasien || !tanggal_pelayanan) {
      return res.status(400).json({
        success: false,
        message: 'Parameter wajib: no_pasien & tanggal_pelayanan (YYYY-MM-DD)'
      });
    }

    console.log(`🔍 [RESUME] Mencari data untuk: ${no_pasien}, ${tanggal_pelayanan}`);

    // ============ QUERY UTAMA - DIPERBAIKI ============
    const [rows] = await pool.execute(`
      SELECT 
        -- Data dari pasien_ralan
        pr.no_pasien,
        pr.no_reg,
        pr.tanggal,
        
        -- Nama pasien - DIPERBAIKI: ambil langsung dari pasien_igd dulu
        COALESCE(
          pi.nama_pasien,  -- Prioritas 1: dari pasien_igd
          pr.nama_pasien,  -- Prioritas 2: dari pasien_ralan
          (SELECT nama_pasien FROM pasien WHERE no_rm = pr.no_pasien LIMIT 1),
          CONCAT('Pasien ', pr.no_pasien)  -- Fallback
        ) as nama_pasien,
        
        -- Data SOAP dari pasien_igd
        pi.keluhan_utama,
        pi.s,
        pi.o,
        pi.a,
        pi.p
        
      FROM pasien_ralan pr
      
      -- Join dengan pasien_igd untuk data SOAP
      LEFT JOIN pasien_igd pi ON 
        pr.no_pasien = pi.no_rm
        AND DATE(pi.tanggal_masuk) = DATE(pr.tanggal)  -- DIPERBAIKI: join berdasarkan tanggal
        
      WHERE pr.no_pasien = ?
        AND DATE(pr.tanggal) = DATE(?)
        
      LIMIT 1
    `, [no_pasien, tanggal_pelayanan]);

    // ============ DATA TIDAK DITEMUKAN ============
    if (rows.length === 0) {
      console.log(`⚠️ [RESUME] Data tidak ditemukan di pasien_ralan, cari di pasien_igd saja...`);
      
      // COBA CARI DI pasien_igd SAJA - DIPERBAIKI
      const [igdRows] = await pool.execute(`
        SELECT 
          pi.no_rm as no_pasien,
          pi.no_reg,
          pi.tanggal_masuk as tanggal,
          pi.nama_pasien,  -- DIPERBAIKI: ambil nama langsung
          pi.keluhan_utama,
          pi.s,
          pi.o,
          pi.a,
          pi.p
        FROM pasien_igd pi
        WHERE pi.no_rm = ?
          AND DATE(pi.tanggal_masuk) = DATE(?)
        LIMIT 1
      `, [no_pasien, tanggal_pelayanan]);
      
      if (igdRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Data tidak ditemukan untuk ${no_pasien} pada ${tanggal_pelayanan}`,
          suggestion: 'Cek nomor pasien dan tanggal pelayanan'
        });
      }
      
      const row = igdRows[0];
      
      // CARI NAMA DARI SUMBER LAIN - DIPERBAIKI
      let nama_pasien = row.nama_pasien || `Pasien ${no_pasien}`; // Default dari query
      if (!nama_pasien || nama_pasien.trim() === '') {
        try {
          const [namaRows] = await pool.execute(`
            SELECT COALESCE(
              (SELECT nama_pasien FROM pasien_ralan WHERE no_pasien = ? AND DATE(tanggal) = DATE(?) LIMIT 1),
              (SELECT nama_pasien FROM pasien WHERE no_rm = ? LIMIT 1),
              CONCAT('Pasien ', ?)
            ) as nama_pasien
          `, [no_pasien, tanggal_pelayanan, no_pasien, no_pasien]);
          
          if (namaRows.length > 0) {
            nama_pasien = namaRows[0].nama_pasien;
          }
        } catch (namaError) {
          console.log('⚠️ [RESUME] Tidak bisa ambil nama:', namaError.message);
        }
      }
      
      const response = {
        success: true,
        data_dasar: {
          no_pasien: row.no_pasien || no_pasien,
          no_reg: row.no_reg || '-',
          nama_pasien: nama_pasien,
          tanggal_pelayanan: row.tanggal ? 
            new Date(row.tanggal).toISOString().split('T')[0] :  // DIPERBAIKI: format YYYY-MM-DD
            tanggal_pelayanan
        },
        resume_medis: {
          keluhan_utama: row.keluhan_utama || '-',
          soap: {
            s: row.s || '-',
            o: row.o || '-',
            a: row.a || '-',
            p: row.p || '-'
          }
        },
        note: 'Data diambil dari pasien_igd saja'
      };
      
      console.log('✅ [RESUME] Data ditemukan dari pasien_igd');
      return res.json(response);
    }

    const row = rows[0];
    
    console.log('✅ [RESUME] Data ditemukan:', {
      no_pasien: row.no_pasien,
      no_reg: row.no_reg,
      nama: row.nama_pasien,
      has_soap: !!(row.s || row.o || row.a || row.p)
    });

    // ============ FORMAT RESPONSE - DIPERBAIKI ============
    const response = {
      success: true,
      data_dasar: {
        no_pasien: row.no_pasien || no_pasien,
        no_reg: row.no_reg || '-',
        nama_pasien: row.nama_pasien || `Pasien ${no_pasien}`, // DIPERBAIKI
        tanggal_pelayanan: row.tanggal ? 
          new Date(row.tanggal).toISOString().split('T')[0] :  // DIPERBAIKI: format YYYY-MM-DD
          tanggal_pelayanan
      },
      resume_medis: {
        keluhan_utama: row.keluhan_utama || '-',
        soap: {
          s: row.s || '-',
          o: row.o || '-',
          a: row.a || '-',
          p: row.p || '-'
        }
      }
    };

    return res.json(response);

  } catch (error) {
    console.error('❌ [RESUME] Error:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
      tip: 'Periksa parameter dan koneksi database'
    });
  }
};

/**
 * @desc    Simple version of resume API - DIPERBAIKI
 * @route   GET /api/resume-medis/simple
 * @access  Public
 */
const getResumeMedisSimple = async (req, res) => {
  try {
    const { no_pasien, tanggal_pelayanan } = req.query;

    if (!no_pasien || !tanggal_pelayanan) {
      return res.status(400).json({
        success: false,
        message: 'Parameter wajib'
      });
    }

    console.log(`🔍 [RESUME SIMPLE] Mencari: ${no_pasien}, ${tanggal_pelayanan}`);

    // QUERY SEDERHANA - DIPERBAIKI
    const [rows] = await pool.execute(`
      SELECT 
        pr.no_pasien,
        pr.no_reg,
        pr.tanggal,
        COALESCE(pi.nama_pasien, pr.nama_pasien) as nama_pasien,  // DIPERBAIKI
        pi.keluhan_utama,
        pi.s,
        pi.o,
        pi.a,
        pi.p
      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi ON pr.no_pasien = pi.no_rm
        AND DATE(pi.tanggal_masuk) = DATE(pr.tanggal)  // DIPERBAIKI
      WHERE pr.no_pasien = ?
        AND DATE(pr.tanggal) = DATE(?)
      LIMIT 1
    `, [no_pasien, tanggal_pelayanan]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan'
      });
    }

    const row = rows[0];
    
    const response = {
      success: true,
      data_dasar: {
        no_pasien: row.no_pasien,
        no_reg: row.no_reg,
        nama_pasien: row.nama_pasien || `Pasien ${no_pasien}`,  // DIPERBAIKI
        tanggal_pelayanan: row.tanggal ? 
          new Date(row.tanggal).toISOString().split('T')[0] :  // DIPERBAIKI
          tanggal_pelayanan
      },
      resume_medis: {
        keluhan_utama: row.keluhan_utama || '-',
        soap: {
          s: row.s || '-',
          o: row.o || '-',
          a: row.a || '-',
          p: row.p || '-'
        }
      }
    };

    console.log('✅ [RESUME SIMPLE] Response ready');
    res.json(response);

  } catch (error) {
    console.error('Error getResumeMedisSimple:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ============ FUNGSI LAIN TIDAK DIUBAH ============
/**
 * @desc    Check database structure for resume
 * @route   GET /api/resume-medis/check
 * @access  Public
 */
const checkDatabaseStructure = async (req, res) => {
  try {
    console.log('🔍 [RESUME CHECK] Mengecek struktur database...');

    // 1. Cek tabel yang relevan
    const [tables] = await pool.execute(`
      SELECT table_name, table_rows
      FROM information_schema.tables 
      WHERE table_schema = 'emirs'
        AND table_name IN ('pasien_ralan', 'pasien_igd', 'pasien', 'rekap_pasienralan')
    `);

    // 2. Cek kolom pasien_ralan
    const [ralanColumns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'emirs' 
        AND TABLE_NAME = 'pasien_ralan'
      ORDER BY ORDINAL_POSITION
    `);

    // 3. Cek kolom pasien_igd
    const [igdColumns] = await pool.execute(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'emirs' 
        AND TABLE_NAME = 'pasien_igd'
      ORDER BY ORDINAL_POSITION
    `);

    // 4. Test JOIN
    const [joinTest] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT pr.no_pasien) as total_pasien_ralan,
        COUNT(DISTINCT pi.no_rm) as total_pasien_igd,
        COUNT(CASE WHEN pi.no_rm IS NOT NULL THEN 1 END) as join_success
      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi ON pr.no_pasien = pi.no_rm
      WHERE pr.tanggal >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // 5. Contoh data untuk no_pasien 000011 - DIPERBAIKI
    const [contohData] = await pool.execute(`
      SELECT 
        pr.no_pasien,
        pr.no_reg,
        pr.tanggal,
        COALESCE(pi.nama_pasien, pr.nama_pasien) as nama_pasien,
        pi.keluhan_utama,
        pi.s,
        pi.o,
        pi.a,
        pi.p
      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi ON pr.no_pasien = pi.no_rm
        AND DATE(pi.tanggal_masuk) = DATE(pr.tanggal)
      WHERE pr.no_pasien = '000011'
        AND DATE(pr.tanggal) = '2025-10-06'  // DIPERBAIKI: tanggal dari screenshot
      LIMIT 1
    `);

    res.json({
      success: true,
      database: 'emirs',
      timestamp: new Date().toISOString(),
      
      tables_found: tables,
      
      columns: {
        pasien_ralan: ralanColumns.map(c => c.COLUMN_NAME),
        pasien_igd: igdColumns.map(c => c.COLUMN_NAME)
      },
      
      join_test: joinTest[0],
      
      contoh_data: contohData,
      
      api_info: {
        endpoint: 'GET /api/resume-medis',
        parameters: 'no_pasien, tanggal_pelayanan (YYYY-MM-DD)',
        example: '/api/resume-medis?no_pasien=000011&tanggal_pelayanan=2025-10-06'  // DIPERBAIKI
      },
      
      status: 'READY'
    });

  } catch (error) {
    console.error('Error checkDatabaseStructure:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengecek struktur database',
      error: error.message
    });
  }
};

/**
 * @desc    Search medical resume - DIPERBAIKI sedikit
 * @route   GET /api/resume-medis/search
 * @access  Public
 */
const searchResume = async (req, res) => {
  try {
    const { no_pasien, nama, tanggal, limit = 20 } = req.query;

    console.log('🔍 [RESUME SEARCH] Mencari dengan parameter:', { no_pasien, nama, tanggal, limit });

    let query = `
      SELECT 
        pr.no_pasien,
        pr.no_reg,
        pr.tanggal,
        COALESCE(pi.nama_pasien, pr.nama_pasien) as nama_pasien,  // DIPERBAIKI
        pi.keluhan_utama,
        pi.s,
        pi.o,
        pi.a,
        pi.p
      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi ON pr.no_pasien = pi.no_rm
        AND DATE(pi.tanggal_masuk) = DATE(pr.tanggal)  // DIPERBAIKI
      WHERE 1=1
    `;
    
    const params = [];
    
    if (no_pasien) {
      query += ' AND pr.no_pasien LIKE ?';
      params.push(`${no_pasien}%`);
    }
    
    if (nama) {
      query += ' AND (pr.nama_pasien LIKE ? OR pi.nama_pasien LIKE ?)';  // DIPERBAIKI
      params.push(`%${nama}%`, `%${nama}%`);
    }
    
    if (tanggal) {
      query += ' AND DATE(pr.tanggal) = ?';
      params.push(tanggal);
    }
    
    query += ' ORDER BY pr.tanggal DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await pool.execute(query, params);

    res.json({
      success: true,
      count: rows.length,
      results: rows.map(row => ({
        no_pasien: row.no_pasien,
        no_reg: row.no_reg,
        tanggal: row.tanggal,
        nama_pasien: row.nama_pasien || '-',
        keluhan_utama: row.keluhan_utama || 'Tidak ada',
        has_soap_data: !!(row.s || row.o || row.a || row.p)
      }))
    });

  } catch (error) {
    console.error('Error searchResume:', error);
    res.status(500).json({
      success: false,
      message: 'Error search',
      error: error.message
    });
  }
};

/**
 * @desc    Debug resume query - DIPERBAIKI
 * @route   GET /api/resume-medis/debug
 * @access  Public
 */
const getResumeDebug = async (req, res) => {
  try {
    const { no_pasien, tanggal_pelayanan } = req.query;

    if (!no_pasien || !tanggal_pelayanan) {
      return res.status(400).json({
        success: false,
        message: 'Parameter wajib'
      });
    }

    console.log(`🔍 [RESUME DEBUG] Debug query untuk: ${no_pasien}, ${tanggal_pelayanan}`);

    // 1. Cek di pasien_ralan
    const [ralanData] = await pool.execute(`
      SELECT 
        no_pasien,
        no_reg,
        tanggal,
        nama_pasien
      FROM pasien_ralan 
      WHERE no_pasien = ?
        AND DATE(tanggal) = DATE(?)
      LIMIT 1
    `, [no_pasien, tanggal_pelayanan]);

    // 2. Cek di pasien_igd
    const [igdData] = await pool.execute(`
      SELECT 
        no_rm,
        no_reg,
        tanggal_masuk,
        nama_pasien,  // DIPERBAIKI: tambah kolom nama
        keluhan_utama,
        s, o, a, p
      FROM pasien_igd 
      WHERE no_rm = ?
        AND DATE(tanggal_masuk) = DATE(?)
      LIMIT 1
    `, [no_pasien, tanggal_pelayanan]);

    // 3. Test JOIN
    const [joinData] = await pool.execute(`
      SELECT 
        pr.no_pasien,
        pr.no_reg,
        pr.tanggal,
        pr.nama_pasien as nama_ralan,
        pi.nama_pasien as nama_igd,  // DIPERBAIKI
        pi.no_rm,
        pi.keluhan_utama
      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi ON pr.no_pasien = pi.no_rm
        AND DATE(pi.tanggal_masuk) = DATE(pr.tanggal)  // DIPERBAIKI
      WHERE pr.no_pasien = ?
        AND DATE(pr.tanggal) = DATE(?)
      LIMIT 1
    `, [no_pasien, tanggal_pelayanan]);

    res.json({
      success: true,
      parameters: { no_pasien, tanggal_pelayanan },
      
      pasien_ralan: {
        found: ralanData.length > 0,
        data: ralanData.length > 0 ? ralanData[0] : null
      },
      
      pasien_igd: {
        found: igdData.length > 0,
        data: igdData.length > 0 ? igdData[0] : null
      },
      
      join_result: {
        found: joinData.length > 0,
        data: joinData.length > 0 ? joinData[0] : null
      },
      
      analysis: {
        data_available: ralanData.length > 0 || igdData.length > 0,
        soap_available: igdData.length > 0,
        join_possible: ralanData.length > 0 && igdData.length > 0,
        nama_ralan: ralanData.length > 0 ? ralanData[0].nama_pasien : 'Tidak ada',
        nama_igd: igdData.length > 0 ? igdData[0].nama_pasien : 'Tidak ada'
      }
    });

  } catch (error) {
    console.error('Error getResumeDebug:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Test resume API - DIPERBAIKI
 * @route   GET /api/resume-medis/test
 * @access  Public
 */
const testResumeAPI = async (req, res) => {
  try {
    // Test dengan data contoh dari screenshot
    const testData = {
      no_pasien: '000011',
      tanggal_pelayanan: '2025-10-06'  // DIPERBAIKI: tanggal dari screenshot
    };

    // Simulasi query
    const [testRows] = await pool.execute(`
      SELECT 
        pr.no_pasien,
        pr.no_reg,
        pr.tanggal,
        COALESCE(pi.nama_pasien, pr.nama_pasien) as nama_pasien,  // DIPERBAIKI
        pi.keluhan_utama,
        pi.s,
        pi.o,
        pi.a,
        pi.p
      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi ON pr.no_pasien = pi.no_rm
        AND DATE(pi.tanggal_masuk) = DATE(pr.tanggal)  // DIPERBAIKI
      WHERE pr.no_pasien = ?
        AND DATE(pr.tanggal) = ?
      LIMIT 1
    `, [testData.no_pasien, testData.tanggal_pelayanan]);

    res.json({
      success: true,
      message: 'Resume API Test',
      test_data: testData,
      query_result: testRows.length > 0 ? 'DATA_FOUND' : 'NO_DATA',
      expected_response: {
        data_dasar: {
          no_pasien: '000011',
          no_reg: '20251006162007',  // DIPERBAIKI: dari screenshot
          nama_pasien: 'M ABDUL ROUF',  // Dari screenshot
          tanggal_pelayanan: '2025-10-06'  // Format YYYY-MM-DD
        },
        resume_medis: {
          keluhan_utama: '-',
          soap: {
            s: '(NULL)',
            o: '(NULL)',
            a: '(NULL)',
            p: '(NULL)'
          }
        }
      },
      actual_data: testRows.length > 0 ? testRows[0] : null,
      status: 'READY'
    });

  } catch (error) {
    console.error('Error testResumeAPI:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * @desc    Get resume by registration number - DIPERBAIKI
 * @route   GET /api/resume-medis/by-reg/:no_reg
 * @access  Public
 */
const getResumeByNoReg = async (req, res) => {
  try {
    const { no_reg } = req.params;

    if (!no_reg) {
      return res.status(400).json({
        success: false,
        message: 'Parameter no_reg wajib'
      });
    }

    console.log(`🔍 [RESUME BY REG] Mencari data untuk no_reg: ${no_reg}`);

    const [rows] = await pool.execute(`
      SELECT 
        pr.no_pasien,
        pr.no_reg,
        pr.tanggal,
        COALESCE(pi.nama_pasien, pr.nama_pasien) as nama_pasien,  // DIPERBAIKI
        pi.keluhan_utama,
        pi.s,
        pi.o,
        pi.a,
        pi.p
      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi ON pr.no_pasien = pi.no_rm
        AND pr.no_reg = pi.no_reg
      WHERE pr.no_reg = ?
      LIMIT 1
    `, [no_reg]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Data tidak ditemukan untuk no_reg: ${no_reg}`
      });
    }

    const row = rows[0];
    
    const response = {
      success: true,
      data_dasar: {
        no_pasien: row.no_pasien,
        no_reg: row.no_reg,
        nama_pasien: row.nama_pasien || `Pasien ${row.no_pasien}`,  // DIPERBAIKI
        tanggal_pelayanan: row.tanggal ? 
          new Date(row.tanggal).toISOString().split('T')[0] : null  // DIPERBAIKI
      },
      resume_medis: {
        keluhan_utama: row.keluhan_utama || '-',
        soap: {
          s: row.s || '-',
          o: row.o || '-',
          a: row.a || '-',
          p: row.p || '-'
        }
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error getResumeByNoReg:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// EKSPOR
module.exports = {
  getResumeMedis,
  getResumeMedisSimple,
  checkDatabaseStructure,
  searchResume,
  getResumeDebug,
  testResumeAPI,
  getResumeByNoReg
};