const express = require('express');
const pool = require('./db');
const app = express();
const PORT = 3000;

app.use(express.json());

/* =====================================================
   API RESUME MEDIS (FINAL – CLEAN & BENAR)
===================================================== */
app.get('/api/resume-medis', async (req, res) => {
  const { no_pasien, tanggal_pelayanan } = req.query;

  // ================= VALIDASI =================
  if (!no_pasien || !tanggal_pelayanan) {
    return res.status(400).json({
      success: false,
      message: 'no_pasien dan tanggal_pelayanan wajib (YYYY-MM-DD)'
    });
  }

  try {
    /* =====================================================
       AMBIL DATA DASAR + SOAP
       - Data pasien dari RALAN
       - SOAP SELALU dari IGD
       - TIDAK NGARANG KOLOM
    ===================================================== */
    const [rows] = await pool.execute(`
      SELECT
        pr.no_pasien,
        pr.no_reg,
        COALESCE(pr.nama_pasien, pi.nama_pasien) AS nama_pasien,
        pr.tanggal AS tanggal_pelayanan,

        -- KELUHAN & SOAP (ASLI DARI IGD)
        pi.keluhan_utama,
        pi.s,
        pi.o,
        pi.a,
        pi.p

      FROM pasien_ralan pr
      LEFT JOIN pasien_igd pi
        ON pr.no_pasien = pi.no_rm
        AND pr.no_reg = pi.no_reg
        AND DATE(pi.tanggal_masuk) = ?

      WHERE pr.no_pasien = ?
        AND DATE(pr.tanggal) = ?
      LIMIT 1
    `, [tanggal_pelayanan, no_pasien, tanggal_pelayanan]);

    // ================= DATA TIDAK ADA =================
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data resume medis tidak ditemukan'
      });
    }

    const r = rows[0];

    /* =====================================================
       RESPONSE FINAL (BERSIH & TERSTRUKTUR)
    ===================================================== */
    res.json({
      success: true,
      data_dasar: {
        no_pasien: r.no_pasien,
        no_reg: r.no_reg,
        nama_pasien: r.nama_pasien,
        tanggal_pelayanan: r.tanggal_pelayanan
      },
      resume_medis: {
        keluhan_utama: r.keluhan_utama || '-',
        soap: {
          s: r.s || '-',
          o: r.o || '-',
          a: r.a || '-',
          p: r.p || '-'
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/* =====================================================
   START SERVER
===================================================== */
app.listen(PORT, () => {
  console.log(`
✅ API RESUME MEDIS AKTIF
----------------------------------
GET /api/resume-medis
?no_pasien=000005
&tanggal_pelayanan=2025-10-29
----------------------------------
Server running on port ${PORT}
`);
});
