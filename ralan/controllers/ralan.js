const pool = require('../db');

// ==================== HELPER FUNCTIONS ====================
exports.getMonthName = (month) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1] || 'Tidak Diketahui';
};

exports.formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

// ==================== HEALTH CHECK ====================
exports.getHealth = async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as status');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
};

// ==================== POLIKLINIK FUNCTIONS ====================
exports.getAllPoliklinik = async (req, res) => {
  try {
    const query = `
      SELECT 
        kode as kd_poli,
        keterangan as nm_poli,
        briging,
        kasir,
        status,
        jkn,
        kontrol
      FROM poliklinik 
      WHERE status = '1' 
        AND kode IS NOT NULL 
        AND keterangan IS NOT NULL
      ORDER BY keterangan ASC
    `;
    
    const [rows] = await pool.query(query);
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Data poliklinik tidak ditemukan' 
      });
    }
    
    const poliklinikList = rows.map(row => ({
      kode_poli: row.kd_poli,
      nama_poli: row.nm_poli,
      singkatan: row.briging || '',
      kasir: row.kasir,
      jkn: row.jkn,
      kontrol: row.kontrol,
      status: row.status
    }));
    
    res.json({
      success: true,
      data: poliklinikList,
      count: rows.length,
      message: 'Data poliklinik berhasil diambil'
    });
  } catch (error) {
    console.error('Error fetching poliklinik:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

exports.getPasienByPoliklinik = async (req, res) => {
  try {
    const { tujuan_poli } = req.params;
    const { tanggal, dokter_poli, limit = 100, page = 1 } = req.query;
    
    if (!tujuan_poli) {
      return res.status(400).json({
        success: false,
        message: 'Kode poliklinik harus diisi'
      });
    }
    
    // Cek apakah poliklinik ada
    const [poliCheck] = await pool.query(
      'SELECT kode, keterangan FROM poliklinik WHERE kode = ?',
      [tujuan_poli]
    );
    
    if (poliCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Poliklinik dengan kode ${tujuan_poli} tidak ditemukan`
      });
    }
    
    const offset = (page - 1) * limit;
    const namaPoli = poliCheck[0].keterangan;
    
    // Query menggunakan tabel pasien_ralan
    let query = `
      SELECT 
        no_reg,
        no_pasien,
        nama_pasien,
        gol_pasien,
        tujuan_poli,
        tanggal,
        dokter_poli,
        status_pasien,
        askes
      FROM pasien_ralan 
      WHERE tujuan_poli = ?
    `;
    
    const params = [tujuan_poli];
    
    if (tanggal) {
      query += ' AND DATE(tanggal) = ?';
      params.push(tanggal);
    }
    
    if (dokter_poli) {
      query += ' AND dokter_poli LIKE ?';
      params.push(`%${dokter_poli}%`);
    }
    
    let countQuery = query.replace(
      'SELECT no_reg, no_pasien, nama_pasien, gol_pasien, tujuan_poli, tanggal, dokter_poli, status_pasien, askes',
      'SELECT COUNT(*) as total'
    );
    
    query += ' ORDER BY tanggal DESC, no_reg DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));
    const total = countResult[0]?.total || 0;
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        message: `Tidak ada pasien di poliklinik ${namaPoli}${tanggal ? ` pada ${tanggal}` : ''}`,
        data: [],
        poliklinik: {
          kode: tujuan_poli,
          nama: namaPoli
        },
        tanggal: tanggal || 'Semua tanggal',
        count: 0
      });
    }
    
    // Format response
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    const formattedData = rows.map(row => ({
      no_registrasi: row.no_reg,
      no_pasien: row.no_pasien,
      nama_pasien: row.nama_pasien,
      gol_pasien: row.gol_pasien || 'Tidak diisi',
      tgl_periksa: formatDate(row.tanggal),
      dokter: row.dokter_poli || 'Tidak diketahui',
      status_pasien: row.status_pasien || 'Tidak diketahui',
      askes: row.askes || '-'
    }));
    
    res.json({
      success: true,
      data: formattedData,
      poliklinik: {
        kode: tujuan_poli,
        nama: namaPoli
      },
      tanggal: tanggal || 'Semua tanggal',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      },
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching patients by poliklinik:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      sql: error.sql
    });
  }
};

// ==================== PASIEN FUNCTIONS ====================
exports.getDetailPasien = async (req, res) => {
  try {
    const { no_reg } = req.params;
    
    if (!no_reg) {
      return res.status(400).json({
        success: false,
        message: 'Nomor registrasi harus diisi'
      });
    }
    
    // Query menggunakan tabel pasien_ralan
    const query = `
      SELECT 
        no_reg,
        no_pasien,
        nama_pasien,
        gol_pasien,
        askes,
        tujuan_poli,
        tanggal,
        tanggal_pulang,
        status_pasien,
        dokter_poli,
        jumlah,
        dari_poli,
        dokter_pengirim,
        perusahaan,
        no_sjp,
        jenis
      FROM pasien_ralan 
      WHERE no_reg = ?
      LIMIT 1
    `;
    
    const [rows] = await pool.query(query, [no_reg]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pasien tidak ditemukan'
      });
    }
    
    const patient = rows[0];
    
    // Format tanggal
    const formatDateTime = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleString('id-ID');
    };
    
    res.json({
      success: true,
      data: {
        registrasi: {
          no_reg: patient.no_reg,
          no_pasien: patient.no_pasien,
          tgl_periksa: formatDateTime(patient.tanggal),
          gol_pasien: patient.gol_pasien || 'Tidak diisi',
          nama_dokter: patient.dokter_poli || 'Tidak diketahui',
          status_pasien: patient.status_pasien || 'Tidak diketahui',
          tujuan_poli: patient.tujuan_poli,
          dari_poli: patient.dari_poli,
          dokter_pengirim: patient.dokter_pengirim,
          jumlah: patient.jumlah
        },
        detail: {
          nama_pasien: patient.nama_pasien,
          askes: patient.askes,
          perusahaan: patient.perusahaan,
          no_sjp: patient.no_sjp,
          jenis: patient.jenis,
          tanggal_pulang: patient.tanggal_pulang ? formatDateTime(patient.tanggal_pulang) : 'Belum pulang'
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching patient detail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Fungsi searchPasien (tambahan)
exports.searchPasien = async (req, res) => {
  try {
    const { keyword, limit = 50 } = req.query;
    
    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Keyword minimal 2 karakter'
      });
    }
    
    const searchTerm = `%${keyword}%`;
    
    const query = `
      SELECT DISTINCT
        no_pasien,
        nama_pasien,
        gol_pasien,
        askes,
        (
          SELECT tanggal 
          FROM pasien_ralan pr2 
          WHERE pr2.no_pasien = pr.no_pasien 
          ORDER BY tanggal DESC 
          LIMIT 1
        ) as last_visit,
        (
          SELECT tujuan_poli 
          FROM pasien_ralan pr2 
          WHERE pr2.no_pasien = pr.no_pasien 
          ORDER BY tanggal DESC 
          LIMIT 1
        ) as last_poli,
        (
          SELECT COUNT(*) 
          FROM pasien_ralan pr2 
          WHERE pr2.no_pasien = pr.no_pasien
        ) as total_kunjungan
      FROM pasien_ralan pr
      WHERE (nama_pasien LIKE ? OR no_pasien LIKE ?)
      GROUP BY no_pasien, nama_pasien, gol_pasien, askes
      ORDER BY nama_pasien
      LIMIT ?
    `;
    
    const [rows] = await pool.query(query, [searchTerm, searchTerm, parseInt(limit)]);
    
    // Format tanggal
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    const formattedData = rows.map(row => ({
      no_pasien: row.no_pasien,
      nama_pasien: row.nama_pasien,
      gol_pasien: row.gol_pasien || 'Tidak diisi',
      askes: row.askes,
      last_visit: formatDate(row.last_visit),
      last_poli: row.last_poli,
      total_kunjungan: row.total_kunjungan
    }));
    
    res.json({
      success: true,
      data: formattedData,
      count: rows.length,
      keyword: keyword
    });
    
  } catch (error) {
    console.error('Error searching patient:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getPasienByNo = async (req, res) => {
  try {
    const { no_pasien } = req.params;
    
    if (!no_pasien) {
      return res.status(400).json({
        success: false,
        message: 'Nomor pasien harus diisi'
      });
    }
    
    const query = `
      SELECT 
        no_reg,
        no_pasien,
        nama_pasien,
        gol_pasien,
        tujuan_poli,
        tanggal,
        dokter_poli,
        status_pasien,
        askes,
        jumlah
      FROM pasien_ralan 
      WHERE no_pasien = ?
      ORDER BY tanggal DESC
      LIMIT 15
    `;
    
    const [rows] = await pool.query(query, [no_pasien]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pasien tidak ditemukan'
      });
    }
    
    // Format tanggal
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    const pasienInfo = {
      no_pasien: rows[0].no_pasien,
      nama_pasien: rows[0].nama_pasien,
      gol_pasien: rows[0].gol_pasien || 'Tidak diisi',
      askes: rows[0].askes,
      total_kunjungan: rows.length,
      kunjungan_pertama: rows.length > 0 ? formatDate(rows[rows.length - 1].tanggal) : null,
      kunjungan_terakhir: rows.length > 0 ? formatDate(rows[0].tanggal) : null
    };
    
    const riwayat = rows.map(r => ({
      no_reg: r.no_reg,
      tanggal: formatDate(r.tanggal),
      tujuan_poli: r.tujuan_poli,
      dokter_poli: r.dokter_poli || 'Tidak diketahui',
      status_pasien: r.status_pasien || 'Tidak diketahui',
      jumlah: r.jumlah
    }));
    
    res.json({
      success: true,
      data: {
        info_pasien: pasienInfo,
        riwayat_kunjungan: riwayat
      }
    });
    
  } catch (error) {
    console.error('Error fetching patient by no:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ==================== PELAYANAN FUNCTIONS ====================
exports.getPelayananByPasien = async (req, res) => {
  try {
    const { no_pasien } = req.params;
    const { tanggal } = req.query;
    
    if (!no_pasien) {
      return res.status(400).json({
        success: false,
        message: 'Nomor pasien harus diisi'
      });
    }
    
    let query = `
      SELECT 
        no_reg,
        no_pasien,
        nama_pasien,
        gol_pasien,
        tujuan_poli,
        tanggal,
        dokter_poli,
        status_pasien,
        no_antrian
      FROM pasien_ralan 
      WHERE no_pasien = ?
    `;
    
    const params = [no_pasien];
    
    if (tanggal) {
      query += ' AND DATE(tanggal) = ?';
      params.push(tanggal);
    }
    
    query += ' ORDER BY tanggal DESC';
    
    const [rows] = await pool.query(query, params);
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        message: `Pasien ${no_pasien} tidak memiliki pelayanan${tanggal ? ` pada ${tanggal}` : ''}`,
        data: [],
        no_pasien: no_pasien,
        tanggal: tanggal || 'Semua tanggal',
        count: 0
      });
    }
    
    // Format tanggal
    const formatDateTime = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleString('id-ID');
    };
    
    const formattedData = rows.map(row => ({
      no_reg: row.no_reg,
      no_pasien: row.no_pasien,
      nama_pasien: row.nama_pasien,
      gol_pasien: row.gol_pasien || 'Tidak diisi',
      tujuan_poli: row.tujuan_poli,
      tanggal: formatDateTime(row.tanggal),
      dokter_poli: row.dokter_poli || 'Tidak diketahui',
      status_pasien: row.status_pasien || 'Tidak diketahui',
      no_antrian: row.no_antrian
    }));
    
    res.json({
      success: true,
      data: formattedData,
      pasien: {
        no_pasien: rows[0].no_pasien,
        nama_pasien: rows[0].nama_pasien,
        total_pelayanan: rows.length
      },
      tanggal: tanggal || 'Semua tanggal',
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching pelayanan by pasien:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getPelayananByDate = async (req, res) => {
  try {
    const { tanggal, tujuan_poli, limit = 100, page = 1 } = req.query;
    
    if (!tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal harus diisi (format: YYYY-MM-DD)'
      });
    }
    
    // Validasi format tanggal
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      return res.status(400).json({
        success: false,
        message: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'
      });
    }
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        no_reg,
        no_pasien,
        nama_pasien,
        gol_pasien,
        tujuan_poli,
        tanggal,
        dokter_poli,
        status_pasien,
        no_antrian
      FROM pasien_ralan 
      WHERE DATE(tanggal) = ?
    `;
    
    const params = [tanggal];
    
    if (tujuan_poli && tujuan_poli !== 'all') {
      query += ' AND tujuan_poli = ?';
      params.push(tujuan_poli);
    }
    
    let countQuery = query.replace(
      'SELECT no_reg, no_pasien, nama_pasien, gol_pasien, tujuan_poli, tanggal, dokter_poli, status_pasien, no_antrian',
      'SELECT COUNT(*) as total'
    );
    
    query += ' ORDER BY no_antrian DESC, no_reg DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));
    const total = countResult[0]?.total || 0;
    
    // Format waktu
    const formatTime = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    };
    
    const formattedData = rows.map(row => ({
      no_reg: row.no_reg,
      no_pasien: row.no_pasien,
      nama_pasien: row.nama_pasien,
      gol_pasien: row.gol_pasien || 'Tidak diisi',
      tujuan_poli: row.tujuan_poli,
      jam: formatTime(row.tanggal),
      dokter_poli: row.dokter_poli || 'Tidak diketahui',
      status_pasien: row.status_pasien || 'Tidak diketahui',
      no_antrian: row.no_antrian
    }));
    
    // Statistik
    const statistik = {
      total_pasien: total,
      poliklinik_unik: [...new Set(rows.map(r => r.tujuan_poli))].length,
      golongan_pasien: {
        umum: rows.filter(r => r.gol_pasien === 'UMUM').length,
        bpjs: rows.filter(r => r.gol_pasien === 'BPJS').length,
      }
    };
    
    res.json({
      success: true,
      data: formattedData,
      tanggal: tanggal,
      statistik: statistik,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      },
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching pelayanan by date:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getPelayananDetail = async (req, res) => {
  try {
    const { no_reg } = req.params;
    
    if (!no_reg) {
      return res.status(400).json({
        success: false,
        message: 'Nomor registrasi harus diisi'
      });
    }
    
    const query = `
      SELECT *
      FROM pasien_ralan 
      WHERE no_reg = ?
      LIMIT 1
    `;
    
    const [rows] = await pool.query(query, [no_reg]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data pelayanan tidak ditemukan'
      });
    }
    
    const data = rows[0];
    
    // Format tanggal
    const formatDateTime = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleString('id-ID');
    };
    
    const responseData = {
      registrasi: {
        no_reg: data.no_reg,
        no_pasien: data.no_pasien,
        no_antrian: data.no_antrian,
        tanggal_registrasi: formatDateTime(data.tanggal),
        tanggal_pulang: data.tanggal_pulang ? formatDateTime(data.tanggal_pulang) : 'Belum pulang'
      },
      pasien: {
        nama_pasien: data.nama_pasien,
        gol_pasien: data.gol_pasien || 'Tidak diisi',
        askes: data.askes,
        perusahaan: data.perusahaan,
        no_sip: data.no_sip
      },
      pemeriksaan: {
        tujuan_poli: data.tujuan_poli,
        dari_poli: data.dari_poli,
        dokter_poli: data.dokter_poli || 'Tidak diketahui',
        dokter_pengirim: data.dokter_pengirim,
        status_pasien: data.status_pasien || 'Tidak diketahui',
        jenis: data.jenis
      },
      administrasi: {
        jumlah: data.jumlah,
        status_pasien: data.status_pasien
      }
    };
    
    res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Error fetching pelayanan detail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ==================== LAPORAN FUNCTIONS ====================
exports.getLaporanPasienPerBulan = async (req, res) => {
  try {
    const { tahun, bulan, tujuan_poli, gol_pasien } = req.query;
    
    const currentYear = new Date().getFullYear();
    const selectedYear = tahun || currentYear;
    
    let query = `
      SELECT 
        YEAR(tanggal) as tahun,
        MONTH(tanggal) as bulan,
        DATE_FORMAT(tanggal, '%Y-%m') as periode,
        tujuan_poli,
        gol_pasien,
        COUNT(DISTINCT no_pasien) as jumlah_pasien,
        COUNT(no_reg) as jumlah_kunjungan
      FROM pasien_ralan 
      WHERE YEAR(tanggal) = ?
        AND tujuan_poli IS NOT NULL
    `;
    
    const params = [selectedYear];
    
    if (bulan && bulan !== 'all') {
      query += ' AND MONTH(tanggal) = ?';
      params.push(bulan);
    }
    
    if (tujuan_poli && tujuan_poli !== 'all') {
      query += ' AND tujuan_poli = ?';
      params.push(tujuan_poli);
    }
    
    if (gol_pasien && gol_pasien !== 'all') {
      query += ' AND gol_pasien = ?';
      params.push(gol_pasien);
    }
    
    query += `
      GROUP BY YEAR(tanggal), MONTH(tanggal), tujuan_poli, gol_pasien
      ORDER BY tahun DESC, bulan DESC
    `;
    
    const [rows] = await pool.query(query, params);
    
    const data = rows.map(row => ({
      tahun: row.tahun,
      bulan: row.bulan,
      periode: row.periode,
      nama_bulan: getMonthName(row.bulan),
      tujuan_poli: row.tujuan_poli,
      gol_pasien: row.gol_pasien || 'Tidak diisi',
      jumlah_pasien: row.jumlah_pasien,
      jumlah_kunjungan: row.jumlah_kunjungan
    }));
    
    // Summary
    const totalPasien = data.reduce((sum, item) => sum + item.jumlah_pasien, 0);
    const totalKunjungan = data.reduce((sum, item) => sum + item.jumlah_kunjungan, 0);
    
    res.json({
      success: true,
      data: data,
      summary: {
        total_pasien: totalPasien,
        total_kunjungan: totalKunjungan,
        total_poliklinik: [...new Set(data.map(item => item.tujuan_poli))].length,
        total_golongan: [...new Set(data.map(item => item.gol_pasien))].length
      },
      count: data.length
    });
    
  } catch (error) {
    console.error('Error generating laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getDetailPasienLaporan = async (req, res) => {
  try {
    const { 
      tahun, 
      bulan, 
      tujuan_poli, 
      gol_pasien,
      limit = 100,
      page = 1 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        no_reg,
        no_pasien,
        nama_pasien,
        gol_pasien,
        askes,
        tujuan_poli,
        tanggal,
        dokter_poli,
        status_pasien
      FROM pasien_ralan 
      WHERE 1=1
    `;
    
    const params = [];
    
    if (tahun && tahun !== 'all') {
      query += ' AND YEAR(tanggal) = ?';
      params.push(tahun);
    }
    
    if (bulan && bulan !== 'all') {
      query += ' AND MONTH(tanggal) = ?';
      params.push(bulan);
    }
    
    if (tujuan_poli && tujuan_poli !== 'all') {
      query += ' AND tujuan_poli = ?';
      params.push(tujuan_poli);
    }
    
    if (gol_pasien && gol_pasien !== 'all') {
      query += ' AND gol_pasien = ?';
      params.push(gol_pasien);
    }
    
    let countQuery = query.replace(
      'SELECT no_reg, no_pasien, nama_pasien, gol_pasien, askes, tujuan_poli, tanggal, dokter_poli, status_pasien',
      'SELECT COUNT(*) as total'
    );
    
    query += ' ORDER BY tanggal DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));
    const total = countResult[0]?.total || 0;
    
    // Format tanggal
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    const data = rows.map(row => ({
      no_reg: row.no_reg,
      no_pasien: row.no_pasien,
      nama_pasien: row.nama_pasien,
      gol_pasien: row.gol_pasien || 'Tidak diisi',
      askes: row.askes,
      tujuan_poli: row.tujuan_poli,
      tanggal: formatDate(row.tanggal),
      dokter_poli: row.dokter_poli || 'Tidak diketahui',
      status_pasien: row.status_pasien || 'Tidak diketahui'
    }));
    
    res.json({
      success: true,
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      },
      filter: {
        tahun: tahun || 'all',
        bulan: bulan || 'all',
        tujuan_poli: tujuan_poli || 'all',
        gol_pasien: gol_pasien || 'all'
      },
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching detail pasien laporan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getRekapPoliklinik = async (req, res) => {
  try {
    const { tahun, bulan } = req.query;
    
    const currentYear = new Date().getFullYear();
    const selectedYear = tahun || currentYear;
    
    let query = `
      SELECT 
        tujuan_poli,
        COUNT(DISTINCT no_pasien) as total_pasien,
        COUNT(no_reg) as total_kunjungan,
        SUM(CASE WHEN gol_pasien = 'UMUM' THEN 1 ELSE 0 END) as umum,
        SUM(CASE WHEN gol_pasien = 'BPJS' THEN 1 ELSE 0 END) as bpjs
      FROM pasien_ralan 
      WHERE YEAR(tanggal) = ?
        AND tujuan_poli IS NOT NULL
    `;
    
    const params = [selectedYear];
    
    if (bulan && bulan !== 'all') {
      query += ' AND MONTH(tanggal) = ?';
      params.push(bulan);
    }
    
    query += `
      GROUP BY tujuan_poli
      ORDER BY total_kunjungan DESC
    `;
    
    const [rows] = await pool.query(query, params);
    
    // Hitung total
    const totals = rows.reduce((acc, row) => ({
      total_pasien: acc.total_pasien + row.total_pasien,
      total_kunjungan: acc.total_kunjungan + row.total_kunjungan,
      total_umum: acc.total_umum + (row.umum || 0),
      total_bpjs: acc.total_bpjs + (row.bpjs || 0)
    }), {
      total_pasien: 0,
      total_kunjungan: 0,
      total_umum: 0,
      total_bpjs: 0
    });
    
    // Hitung persentase
    const calculatePercentage = (value) => {
      return totals.total_kunjungan > 0 ? ((value / totals.total_kunjungan) * 100).toFixed(2) : '0.00';
    };
    
    const persentase = {
      umum: calculatePercentage(totals.total_umum),
      bpjs: calculatePercentage(totals.total_bpjs)
    };
    
    res.json({
      success: true,
      data: rows.map(row => ({
        tujuan_poli: row.tujuan_poli,
        total_pasien: row.total_pasien || 0,
        total_kunjungan: row.total_kunjungan || 0,
        umum: row.umum || 0,
        bpjs: row.bpjs || 0
      })),
      summary: {
        periode: `${selectedYear}${bulan && bulan !== 'all' ? ` Bulan ${getMonthName(bulan)}` : ''}`,
        total_poliklinik: rows.length,
        totals: totals,
        persentase: persentase
      },
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error fetching rekap poliklinik:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ==================== REKAP FUNCTIONS (FIXED) ====================

const getMonthName = (month) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[month - 1] || 'Tidak Diketahui';
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

exports.rekapHarian = async (req, res) => {
  try {
    const { tanggal } = req.query;
    
    if (!tanggal) {
      return res.status(400).json({
        success: false,
        message: 'Parameter tanggal harus diisi (format: YYYY-MM-DD)'
      });
    }
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      return res.status(400).json({
        success: false,
        message: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'
      });
    }
    
    const query = `
      SELECT 
        tanggal,
        kode_poli,
        baru,
        lama,
        reguler,
        eksekutif,
        dinas_a,
        dinas_pur,
        umum,
        bpjs,
        prsh
      FROM rekap_pasienralan
      WHERE DATE(tanggal) = ?
      ORDER BY kode_poli
    `;
    
    console.log(`Query rekap harian: ${query}`, [tanggal]);
    const [rows] = await pool.query(query, [tanggal]);
    
    if (rows.length === 0) {
      return res.json({
        success: true,
        message: `Tidak ada data rekap untuk tanggal ${tanggal}`,
        data: [],
        count: 0
      });
    }
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
    
  } catch (error) {
    console.error('Error rekap harian:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      code: error.code
    });
  }
};

exports.rekapBulanan = async (req, res) => {
  try {
    // Ambil parameter dari query string
    const { tanggal, tahun, bulan } = req.query;
    
    console.log('Parameters received:', { tanggal, tahun, bulan });
    
    // Jika ada parameter tanggal, ambil berdasarkan tanggal
    if (tanggal) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
        return res.status(400).json({
          success: false,
          message: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'
        });
      }
      
      const query = `
        SELECT 
          tanggal,
          kode_poli,
          baru,
          lama,
          reguler,
          eksekutif,
          dinas_a,
          dinas_pur,
          umum,
          bpjs,
          prsh
        FROM rekap_pasienralan
        WHERE DATE(tanggal) = ?
        ORDER BY tanggal, kode_poli
      `;
      
      console.log('Query dengan tanggal:', query, [tanggal]);
      const [rows] = await pool.query(query, [tanggal]);
      
      if (rows.length === 0) {
        return res.json({
          success: true,
          message: `Tidak ada data untuk tanggal ${tanggal}`,
          data: [],
          count: 0
        });
      }
      
      return res.json({
        success: true,
        data: rows,
        count: rows.length,
        filter: { tanggal }
      });
    }
    
    // Jika ada parameter tahun dan bulan
    if (tahun && bulan) {
      if (isNaN(tahun) || isNaN(bulan) || bulan < 1 || bulan > 12) {
        return res.status(400).json({
          success: false,
          message: 'Tahun harus angka, bulan harus 1-12'
        });
      }
      
      const query = `
        SELECT 
          tanggal,
          kode_poli,
          baru,
          lama,
          reguler,
          eksekutif,
          dinas_a,
          dinas_pur,
          umum,
          bpjs,
          prsh
        FROM rekap_pasienralan
        WHERE YEAR(tanggal) = ?
          AND MONTH(tanggal) = ?
        ORDER BY tanggal, kode_poli
      `;
      
      console.log('Query dengan tahun dan bulan:', query, [tahun, bulan]);
      const [rows] = await pool.query(query, [tahun, bulan]);
      
      if (rows.length === 0) {
        return res.json({
          success: true,
          message: `Tidak ada data untuk ${bulan}-${tahun}`,
          data: [],
          count: 0
        });
      }
      
      return res.json({
        success: true,
        data: rows,
        count: rows.length,
        filter: { tahun, bulan }
      });
    }
    
    // Jika hanya ada tahun
    if (tahun) {
      if (isNaN(tahun)) {
        return res.status(400).json({
          success: false,
          message: 'Tahun harus angka'
        });
      }
      
      const query = `
        SELECT 
          tanggal,
          kode_poli,
          baru,
          lama,
          reguler,
          eksekutif,
          dinas_a,
          dinas_pur,
          umum,
          bpjs,
          prsh
        FROM rekap_pasienralan
        WHERE YEAR(tanggal) = ?
        ORDER BY tanggal, kode_poli
      `;
      
      console.log('Query dengan tahun:', query, [tahun]);
      const [rows] = await pool.query(query, [tahun]);
      
      if (rows.length === 0) {
        return res.json({
          success: true,
          message: `Tidak ada data untuk tahun ${tahun}`,
          data: [],
          count: 0
        });
      }
      
      return res.json({
        success: true,
        data: rows,
        count: rows.length,
        filter: { tahun }
      });
    }
    
    // DEFAULT: Tampilkan SEMUA data dari tabel (tanpa filter)
    console.log('Mengambil SEMUA data dari tabel rekap_pasienralan');
    
    const query = `
      SELECT 
        tanggal,
        kode_poli,
        baru,
        lama,
        reguler,
        eksekutif,
        dinas_a,
        dinas_pur,
        umum,
        bpjs,
        prsh
      FROM rekap_pasienralan
      ORDER BY tanggal DESC, kode_poli
      LIMIT 1000
    `;
    
    console.log('Query semua data:', query);
    const [rows] = await pool.query(query);
    
    // Ambil statistik
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_rows,
        MIN(tanggal) as tanggal_awal,
        MAX(tanggal) as tanggal_akhir,
        COUNT(DISTINCT DATE(tanggal)) as total_hari,
        COUNT(DISTINCT kode_poli) as total_poli
      FROM rekap_pasienralan
    `);
    
    // Format response untuk semua data
    const formattedData = rows.map(row => ({
      tanggal: formatDate(row.tanggal),
      kode_poli: row.kode_poli,
      baru: parseInt(row.baru) || 0,
      lama: parseInt(row.lama) || 0,
      reguler: parseInt(row.reguler) || 0,
      eksekutif: parseInt(row.eksekutif) || 0,
      dinas_a: parseInt(row.dinas_a) || 0,
      dinas_pur: parseInt(row.dinas_pur) || 0,
      umum: parseInt(row.umum) || 0,
      bpjs: parseInt(row.bpjs) || 0,
      prsh: parseInt(row.prsh) || 0,
      total_kunjungan: (parseInt(row.reguler) || 0) + 
                      (parseInt(row.eksekutif) || 0) + 
                      (parseInt(row.dinas_a) || 0) + 
                      (parseInt(row.dinas_pur) || 0),
      total_pasien: (parseInt(row.baru) || 0) + (parseInt(row.lama) || 0)
    }));
    
    res.json({
      success: true,
      data: formattedData,
      count: rows.length,
      stats: {
        total_rows: stats[0]?.total_rows || 0,
        tanggal_awal: formatDate(stats[0]?.tanggal_awal),
        tanggal_akhir: formatDate(stats[0]?.tanggal_akhir),
        total_hari: stats[0]?.total_hari || 0,
        total_poli: stats[0]?.total_poli || 0,
        note: 'Data ditampilkan maksimal 1000 baris terbaru'
      },
      filter: 'semua_data'
    });
    
  } catch (error) {
    console.error('Error rekap bulanan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rekap bulanan',
      error: error.message,
      code: error.code,
      suggestion: 'Periksa koneksi database dan struktur tabel rekap_pasienralan'
    });
  }
};

exports.rekapTahunan = async (req, res) => {
  try {
    const { tahun } = req.query;
    
    // Jika ada parameter tahun
    if (tahun) {
      if (isNaN(tahun)) {
        return res.status(400).json({
          success: false,
          message: 'Tahun harus angka'
        });
      }
      
      const query = `
        SELECT 
          YEAR(tanggal) as tahun,
          MONTH(tanggal) as bulan,
          DATE_FORMAT(tanggal, '%Y-%m') as periode,
          COUNT(DISTINCT DATE(tanggal)) as hari_aktif,
          COUNT(DISTINCT kode_poli) as total_poli,
          SUM(CAST(baru AS UNSIGNED)) as total_baru,
          SUM(CAST(lama AS UNSIGNED)) as total_lama,
          SUM(CAST(reguler AS UNSIGNED)) as total_reguler,
          SUM(CAST(eksekutif AS UNSIGNED)) as total_eksekutif,
          SUM(CAST(dinas_a AS UNSIGNED)) as total_dinas_a,
          SUM(CAST(dinas_pur AS UNSIGNED)) as total_dinas_pur,
          SUM(CAST(umum AS UNSIGNED)) as total_umum,
          SUM(CAST(bpjs AS UNSIGNED)) as total_bpjs,
          SUM(CAST(prsh AS UNSIGNED)) as total_prsh
        FROM rekap_pasienralan 
        WHERE YEAR(tanggal) = ?
        GROUP BY YEAR(tanggal), MONTH(tanggal)
        ORDER BY bulan
      `;
      
      console.log('Query rekap tahunan:', query, [tahun]);
      const [rows] = await pool.query(query, [tahun]);
      
      if (rows.length === 0) {
        return res.json({
          success: true,
          message: `Tidak ada data untuk tahun ${tahun}`,
          data: [],
          count: 0
        });
      }
      
      const formattedData = rows.map(row => ({
        tahun: row.tahun,
        bulan: parseInt(row.bulan),
        nama_bulan: getMonthName(row.bulan),
        periode: row.periode,
        hari_aktif: parseInt(row.hari_aktif) || 0,
        total_poli: parseInt(row.total_poli) || 0,
        total_baru: parseInt(row.total_baru) || 0,
        total_lama: parseInt(row.total_lama) || 0,
        total_reguler: parseInt(row.total_reguler) || 0,
        total_eksekutif: parseInt(row.total_eksekutif) || 0,
        total_dinas_a: parseInt(row.total_dinas_a) || 0,
        total_dinas_pur: parseInt(row.total_dinas_pur) || 0,
        total_umum: parseInt(row.total_umum) || 0,
        total_bpjs: parseInt(row.total_bpjs) || 0,
        total_prsh: parseInt(row.total_prsh) || 0,
        total_kunjungan: (parseInt(row.total_reguler) || 0) + 
                        (parseInt(row.total_eksekutif) || 0) + 
                        (parseInt(row.total_dinas_a) || 0) + 
                        (parseInt(row.total_dinas_pur) || 0),
        total_pasien: (parseInt(row.total_baru) || 0) + (parseInt(row.total_lama) || 0)
      }));
      
      return res.json({
        success: true,
        data: formattedData,
        count: rows.length,
        filter: { tahun }
      });
    }
    
    // DEFAULT: Ringkasan semua tahun
    const query = `
      SELECT 
        YEAR(tanggal) as tahun,
        COUNT(DISTINCT DATE(tanggal)) as hari_aktif,
        COUNT(DISTINCT kode_poli) as total_poli,
        SUM(CAST(baru AS UNSIGNED)) as total_baru,
        SUM(CAST(lama AS UNSIGNED)) as total_lama,
        SUM(CAST(reguler AS UNSIGNED)) as total_reguler,
        SUM(CAST(eksekutif AS UNSIGNED)) as total_eksekutif,
        SUM(CAST(dinas_a AS UNSIGNED)) as total_dinas_a,
        SUM(CAST(dinas_pur AS UNSIGNED)) as total_dinas_pur,
        SUM(CAST(umum AS UNSIGNED)) as total_umum,
        SUM(CAST(bpjs AS UNSIGNED)) as total_bpjs,
        SUM(CAST(prsh AS UNSIGNED)) as total_prsh
      FROM rekap_pasienralan 
      GROUP BY YEAR(tanggal)
      ORDER BY tahun DESC
    `;
    
    console.log('Query ringkasan semua tahun:', query);
    const [rows] = await pool.query(query);
    
    const formattedData = rows.map(row => ({
      tahun: row.tahun,
      hari_aktif: parseInt(row.hari_aktif) || 0,
      total_poli: parseInt(row.total_poli) || 0,
      total_baru: parseInt(row.total_baru) || 0,
      total_lama: parseInt(row.total_lama) || 0,
      total_reguler: parseInt(row.total_reguler) || 0,
      total_eksekutif: parseInt(row.total_eksekutif) || 0,
      total_dinas_a: parseInt(row.total_dinas_a) || 0,
      total_dinas_pur: parseInt(row.total_dinas_pur) || 0,
      total_umum: parseInt(row.total_umum) || 0,
      total_bpjs: parseInt(row.total_bpjs) || 0,
      total_prsh: parseInt(row.total_prsh) || 0,
      total_kunjungan: (parseInt(row.total_reguler) || 0) + 
                      (parseInt(row.total_eksekutif) || 0) + 
                      (parseInt(row.total_dinas_a) || 0) + 
                      (parseInt(row.total_dinas_pur) || 0),
      total_pasien: (parseInt(row.total_baru) || 0) + (parseInt(row.total_lama) || 0)
    }));
    
    res.json({
      success: true,
      data: formattedData,
      count: rows.length,
      filter: 'semua_tahun'
    });
    
  } catch (error) {
    console.error('Error rekap tahunan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rekap tahunan',
      error: error.message,
      code: error.code
    });
  }
};

// Endpoint untuk cek tabel
exports.checkTable = async (req, res) => {
  try {
    // Cek apakah tabel ada
    const [tables] = await pool.query("SHOW TABLES LIKE 'rekap_pasienralan'");
    
    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tabel rekap_pasienralan tidak ditemukan'
      });
    }
    
    // Ambil struktur tabel
    const [columns] = await pool.query('DESCRIBE rekap_pasienralan');
    
    // Ambil 5 data contoh
    const [sampleData] = await pool.query(`
      SELECT * FROM rekap_pasienralan 
      ORDER BY tanggal DESC 
      LIMIT 5
    `);
    
    res.json({
      success: true,
      table_exists: true,
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null,
        key: col.Key
      })),
      sample_data: sampleData,
      total_columns: columns.length
    });
    
  } catch (error) {
    console.error('Error checking table:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memeriksa tabel',
      error: error.message,
      code: error.code
    });
  }
};

// ==================== DEBUG FUNCTIONS ====================
exports.listTables = async (req, res) => {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    
    const tableList = tables.map(row => Object.values(row)[0]);
    
    const rekapTables = tableList.filter(table => 
      table.toLowerCase().includes('rekap') || 
      table.toLowerCase().includes('summary') ||
      table.toLowerCase().includes('laporan')
    );
    
    const tableDetails = [];
    
    for (const table of rekapTables.slice(0, 5)) {
      try {
        const [columns] = await pool.query(`DESCRIBE ${table}`);
        tableDetails.push({
          name: table,
          columns: columns.map(col => col.Field),
          total_columns: columns.length
        });
      } catch (err) {
        tableDetails.push({
          name: table,
          error: err.message
        });
      }
    }
    
    res.json({
      success: true,
      total_tables: tableList.length,
      all_tables: tableList.slice(0, 30),
      rekap_tables: rekapTables,
      table_details: tableDetails
    });
    
  } catch (error) {
    console.error('Error listing tables:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing tables',
      error: error.message
    });
  }
};

exports.findRekapTable = async (req, res) => {
  try {
    const [allTables] = await pool.query('SHOW TABLES');
    const tableNames = allTables.map(row => Object.values(row)[0]);
    
    const targetColumns = ['tanggal', 'kode_poli', 'tujuan_poli', 'umum', 'bpjs', 'prsh', 'baru', 'lama'];
    const matchingTables = [];
    
    for (const tableName of tableNames) {
      try {
        const [columns] = await pool.query(`DESCRIBE ${tableName}`);
        const columnNames = columns.map(col => col.Field);
        
        const matchCount = targetColumns.filter(col => 
          columnNames.includes(col)
        ).length;
        
        if (matchCount >= 3) {
          const importantColumns = ['umum', 'bpjs', 'prsh'];
          const importantMatch = importantColumns.filter(col => 
            columnNames.includes(col)
          ).length;
          
          if (importantMatch >= 1) {
            matchingTables.push({
              name: tableName,
              columns: columnNames,
              match_count: matchCount,
              important_match: importantMatch
            });
          }
        }
      } catch (err) {
        // Skip error
      }
    }
    
    matchingTables.sort((a, b) => {
      if (b.important_match !== a.important_match) {
        return b.important_match - a.important_match;
      }
      return b.match_count - a.match_count;
    });
    
    let sampleData = null;
    if (matchingTables.length > 0) {
      const bestTable = matchingTables[0].name;
      try {
        const [sample] = await pool.query(`SELECT * FROM ${bestTable} LIMIT 3`);
        sampleData = {
          table: bestTable,
          data: sample
        };
      } catch (err) {
        sampleData = { error: err.message };
      }
    }
    
    res.json({
      success: true,
      total_tables: tableNames.length,
      matching_tables: matchingTables,
      sample_data: sampleData,
      recommendation: matchingTables.length > 0 ? 
        `Gunakan tabel "${matchingTables[0].name}"` :
        'Tidak ditemukan tabel rekap'
    });
    
  } catch (error) {
    console.error('Error finding rekap table:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding rekap table',
      error: error.message
    });
  }
};

exports.debugGolonganPasien = async (req, res) => {
  try {
    const { tahun, bulan } = req.query;
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const selectedYear = tahun || currentYear;
    const selectedMonth = bulan || currentMonth;
    
    const query = `
      SELECT 
        no_reg,
        no_pasien,
        nama_pasien,
        gol_pasien,
        tujuan_poli,
        tanggal,
        dokter_poli
      FROM pasien_ralan 
      WHERE YEAR(tanggal) = ? AND MONTH(tanggal) = ?
      ORDER BY tanggal DESC
      LIMIT 10
    `;
    
    const [rows] = await pool.query(query, [selectedYear, selectedMonth]);
    
    const golonganAnalysis = rows.reduce((acc, row) => {
      const gol = row.gol_pasien || '(kosong/null)';
      if (!acc[gol]) {
        acc[gol] = 0;
      }
      acc[gol]++;
      return acc;
    }, {});
    
    res.json({
      success: true,
      periode: `${selectedYear}-${selectedMonth}`,
      total_data: rows.length,
      sample_data: rows.map(r => ({
        no_reg: r.no_reg,
        no_pasien: r.no_pasien,
        nama_pasien: r.nama_pasien,
        gol_pasien: r.gol_pasien || '(kosong)',
        tujuan_poli: r.tujuan_poli,
        tanggal: r.tanggal ? new Date(r.tanggal).toISOString().split('T')[0] : null
      })),
      analisis_gol_pasien: Object.entries(golonganAnalysis).map(([gol, jumlah]) => ({
        gol_pasien: gol,
        jumlah: jumlah
      }))
    });
    
  } catch (error) {
    console.error('Error debugging golongan pasien:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};