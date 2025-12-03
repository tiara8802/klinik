const express = require('express');

const cors = require('cors');

const pool = require('./db');



const app = express();

app.use(cors());

app.use(express.json());



// ========================

// HELPER FUNCTIONS

// ========================

function formatRupiah(angka) {

  if (!angka && angka !== 0) return 'Rp 0';

  return 'Rp ' + parseFloat(angka).toLocaleString('id-ID');

}



function hitungUmur(tglLahir) {

  if (!tglLahir) return 'Tidak diketahui';

  try {

    const lahir = new Date(tglLahir);

    const sekarang = new Date();

    let tahun = sekarang.getFullYear() - lahir.getFullYear();

    let bulan = sekarang.getMonth() - lahir.getMonth();

    

    if (bulan < 0) {

      tahun--;

      bulan += 12;

    }

    

    return `${tahun} tahun${bulan > 0 ? ` ${bulan} bulan` : ''}`;

  } catch (e) {

    return 'Tidak diketahui';

  }

}



// MAPPING POLI

function getNamaPoli(kodePoli) {

  const mapping = {

    '0102005': 'POLI UMUM',

    '0102008': 'POLI GIGI', 

    '0102030': 'POLI ANAK',

    '0102001': 'POLI BEDAH',

    '0102002': 'POLI PENYAKIT DALAM',

    '0102003': 'POLI KANDUNGAN',

    '0102004': 'POLI THT',

    '0102006': 'POLI SARAF',

    '0102007': 'POLI KULIT',

    '0102009': 'POLI MATA',

    '0102010': 'IGD',

    '0102011': 'POLI JANTUNG',

    '0102012': 'POLI PARU'

  };

  return mapping[kodePoli] || `POLI ${kodePoli}`;

}



// MAPPING GOLONGAN

function getNamaGolongan(kode) {

  const mapping = {

    '11': 'UMUM / BAYAR',

    '12': 'BPJS',

    '13': 'ASURANSI',

    '14': 'PERUSAHAAN',

    '15': 'GRATIS'

  };

  return mapping[kode] || `GOLONGAN ${kode}`;

}



// ========================

// API 1: GET PELAYANAN - FIXED VERSION

// ========================

app.get('/api/getpelayanan', async (req, res) => {

  try {

    const { no_pasien, tanggal } = req.query;

    

    // Validasi

    if (!no_pasien || !tanggal) {

      return res.status(400).json({

        success: false,

        message: 'Parameter no_pasien dan tanggal wajib diisi',

        contoh: '/api/getpelayanan?no_pasien=000011&tanggal=2025-10-02'

      });

    }

    

    console.log(`📋 Request: ${no_pasien} - ${tanggal}`);

    

    // QUERY SIMPLE - HANYA 2 TARIF

    const query = `

      SELECT 

        -- Data Pasien

        p.no_pasien,

        p.nama_pasien,

        p.tgl_lahir,

        p.jenis_kelamin,

        p.alamat,

        p.telpon,

        p.pekerjaan,

        

        -- Data Golongan

        gp.keterangan as nama_golongan,

        

        -- Data Pelayanan

        pr.no_reg,

        pr.tanggal as tanggal_pelayanan,

        pr.no_antrian,

        pr.tujuan_poli,

        pr.dokter_poli,

        pr.status_pasien,

        pr.status_bayar,

        pr.diagnosa,

        pr.keterangan,

        pr.tindakan_operasi,

        

        -- HANYA 2 TARIF INI

        pr.tarif_bpjs,

        pr.tarif_rumahsakit,

        

        -- Golongan dari pasien_ralan

        pr.gol_pasien,

        

        pr.jam_masuk,

        pr.jam_keluar,

        pr.keadaan_pulang

      FROM pasien_ralan pr

      INNER JOIN pasien p ON pr.no_pasien = p.no_pasien

      LEFT JOIN gol_pasien gp ON pr.gol_pasien = gp.id_gol

      WHERE pr.no_pasien = ? 

        AND DATE(pr.tanggal) = DATE(?)

      ORDER BY pr.tanggal DESC

    `;

    

    const [rows] = await pool.query(query, [no_pasien, tanggal]);

    

    if (rows.length === 0) {

      return res.json({

        success: true,

        message: 'Tidak ada data ditemukan',

        data: []

      });

    }

    

    // Format response

    const firstRow = rows[0];

    

    // Hitung total tarif untuk logging

    const totalTarifBpjs = rows.reduce((sum, row) => sum + (parseFloat(row.tarif_bpjs) || 0), 0);

    const totalTarifRS = rows.reduce((sum, row) => sum + (parseFloat(row.tarif_rumahsakit) || 0), 0);

    

    console.log(`💰 Total tarif: BPJS=${formatRupiah(totalTarifBpjs)}, RS=${formatRupiah(totalTarifRS)}`);

    

    const response = {

      success: true,

      message: '✅ Data berhasil diambil',

      jumlah_data: rows.length,

      info_pasien: {

        no_pasien: firstRow.no_pasien,

        nama: firstRow.nama_pasien,

        tgl_lahir: firstRow.tgl_lahir,

        usia: hitungUmur(firstRow.tgl_lahir),

        jenis_kelamin: firstRow.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',

        alamat: firstRow.alamat,

        telepon: firstRow.telpon

      },

      info_golongan: {

        kode: firstRow.gol_pasien,

        nama: firstRow.nama_golongan || getNamaGolongan(firstRow.gol_pasien)

      },

      data_pelayanan: rows.map((row, index) => {

        // HANYA 2 TARIF INI YANG DIAMBIL

        const tarifBpjs = parseFloat(row.tarif_bpjs) || 0;

        const tarifRumahSakit = parseFloat(row.tarif_rumahsakit) || 0;

        const total = tarifBpjs + tarifRumahSakit;

        

        return {

          no: index + 1,

          registrasi: {

            no_reg: row.no_reg,

            no_antrian: row.no_antrian,

            tanggal: row.tanggal_pelayanan,

            jam: {

              masuk: row.jam_masuk,

              keluar: row.jam_keluar

            }

          },

          klinik: {

            poli: {

              kode: row.tujuan_poli,

              nama: getNamaPoli(row.tujuan_poli)  // NAMA POLI ADA!

            },

            dokter: row.dokter_poli,

            status: row.status_pasien

          },

          // HANYA 2 TARIF INI

          tarif: {

            bpjs: {

              nilai: tarifBpjs,

              rupiah: formatRupiah(tarifBpjs)

            },

            rumah_sakit: {

              nilai: tarifRumahSakit,

              rupiah: formatRupiah(tarifRumahSakit)

            },

            total: {

              nilai: total,

              rupiah: formatRupiah(total)

            }

          },

          pembayaran: row.status_bayar,

          medis: {

            diagnosa: row.diagnosa || '-',

            tindakan: row.tindakan_operasi || '-',

            catatan: row.keterangan || '-'

          },

          pulang: row.keadaan_pulang || '-'

        };

      })

    };

    

    res.json(response);

    

  } catch (error) {

    console.error('Error:', error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});



// ========================

// API 2: CEK DATA TARIF

// ========================

app.get('/api/cek-tarif/:no_pasien', async (req, res) => {

  try {

    const { no_pasien } = req.params;

    

    const [rows] = await pool.query(`

      SELECT 

        tanggal,

        tujuan_poli,

        tarif_bpjs,

        tarif_rumahsakit,

        gol_pasien,

        status_bayar

      FROM pasien_ralan 

      WHERE no_pasien = ?

      ORDER BY tanggal DESC

      LIMIT 10

    `, [no_pasien]);

    

    const totals = rows.reduce((acc, row) => {

      acc.bpjs += parseFloat(row.tarif_bpjs) || 0;

      acc.rs += parseFloat(row.tarif_rumahsakit) || 0;

      return acc;

    }, { bpjs: 0, rs: 0, total: 0 });

    

    totals.total = totals.bpjs + totals.rs;

    

    res.json({

      success: true,

      no_pasien: no_pasien,

      jumlah_transaksi: rows.length,

      ringkasan_tarif: {

        total_bpjs: formatRupiah(totals.bpjs),

        total_rumah_sakit: formatRupiah(totals.rs),

        grand_total: formatRupiah(totals.total)

      },

      detail: rows.map(row => ({

        tanggal: row.tanggal,

        poli: getNamaPoli(row.tujuan_poli),

        tarif_bpjs: formatRupiah(row.tarif_bpjs),

        tarif_rs: formatRupiah(row.tarif_rumahsakit),

        total: formatRupiah((parseFloat(row.tarif_bpjs) || 0) + (parseFloat(row.tarif_rumahsakit) || 0)),

        gol_pasien: row.gol_pasien,

        status_bayar: row.status_bayar

      }))

    });

    

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});



// ========================

// HOME PAGE

// ========================

app.get('/', (req, res) => {

  res.json({

    message: '🏥 EMIRS API - READY',

    endpoint: 'GET /api/getpelayanan?no_pasien=...&tanggal=...',

    contoh: 'http://localhost:3000/api/getpelayanan?no_pasien=000011&tanggal=2025-10-02'

  });

});



// ========================

// START SERVER

// ========================

const PORT = 3000;

app.listen(PORT, () => {

  console.log(`

  🏥 EMIRS API SERVER

  ===================

  📍 http://localhost:${PORT}

  

  ✅ ENDPOINT UTAMA:

  GET /api/getpelayanan?no_pasien=...&tanggal=...

  

  ✅ Server ready!`);

});