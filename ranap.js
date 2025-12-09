const express = require('express');

const cors = require('cors');



const app = express();

app.use(cors());

app.use(express.json());



// ========================

// DATA OKUPANSI KAMAR (DARI TABEL)

// ========================

const dataOkupansi = [

  { ruangan: 'KIRANA', tt: 7, d: 2, u: 0, epj5: 3, pr3h: 0, jamish: 5, bor: 14, persentase: 71.43 },

  { ruangan: 'KARTIKA', tt: 17, d: 1, u: 0, epj5: 9, pr3h: 0, jamish: 10, bor: 36, persentase: 58.82 },

  { ruangan: 'WIDYA', tt: 19, d: 1, u: 0, epj5: 11, pr3h: 0, jamish: 12, bor: 29, persentase: 63.16 },

  { ruangan: 'ICU', tt: 18, d: 1, u: 0, epj5: 9, pr3h: 0, jamish: 10, bor: 57, persentase: 56.56 },

  { ruangan: 'YUDHA', tt: 30, d: 1, u: 0, epj5: 22, pr3h: 2, jamish: 25, bor: 83, persentase: 83.33 },

  { ruangan: 'HESTI (BAT)', tt: 10, d: 0, u: 0, epj5: 5, pr3h: 0, jamish: 5, bor: 15, persentase: 50.00 },

  { ruangan: 'KEKICANA', tt: 30, d: 3, u: 0, epj5: 12, pr3h: 1, jamish: 16, bor: 47, persentase: 53.33 },

  { ruangan: 'PLISRA', tt: 28, d: 3, u: 0, epj5: 16, pr3h: 0, jamish: 19, bor: 63, persentase: 67.86 },

  { ruangan: 'PRATAMA', tt: 27, d: 0, u: 0, epj5: 25, pr3h: 0, jamish: 25, bor: 85, persentase: 92.59 },

  { ruangan: 'NICU', tt: 4, d: 0, u: 0, epj5: 0, pr3h: 0, jamish: 0, bor: 0, persentase: 0.00 },

  { ruangan: 'CHANDRA', tt: 14, d: 0, u: 0, epj5: 4, pr3h: 0, jamish: 4, bor: 15, persentase: 28.57 }

];



// ========================

// HELPER FUNCTIONS

// ========================

function getKodeKelasFromRuangan(ruangan) {

  const kelasMap = {

    'KIRANA': 'KLS01',

    'KARTIKA': 'KLS01',

    'WIDYA': 'KLS02',

    'ICU': 'ICU',

    'YUDHA': 'KLS03',

    'HESTI (BAT)': 'KLS02',

    'KEKICANA': 'KLS03',

    'PLISRA': 'KLS02',

    'PRATAMA': 'KLS01',

    'NICU': 'NICU',

    'CHANDRA': 'KLS03'

  };

  return kelasMap[ruangan] || 'KLS01';

}



function getNamaKelas(ruangan) {

  const namaKelasMap = {

    'KIRANA': 'Kelas 1',

    'KARTIKA': 'Kelas 1',

    'WIDYA': 'Kelas 2',

    'ICU': 'Intensive Care Unit',

    'YUDHA': 'Kelas 3',

    'HESTI (BAT)': 'Kelas 2',

    'KEKICANA': 'Kelas 3',

    'PLISRA': 'Kelas 2',

    'PRATAMA': 'Kelas 1',

    'NICU': 'Neonatal ICU',

    'CHANDRA': 'Kelas 3'

  };

  return namaKelasMap[ruangan] || 'Kelas 1';

}



// ========================

// API 1: DATA KAMAR DENGAN STATUS (status_kamar="kosong"/"terisi", status_text=0/1)

// ========================

app.get('/api/kamar-status', async (req, res) => {

  try {

    const { status_kamar, kode_ruangan } = req.query;

    

    console.log(`✅ Data kamar dengan status: status_kamar=${status_kamar}, kode_ruangan=${kode_ruangan}`);

    

    // Generate data kamar dari data okupansi

    let kamarList = [];

    

    dataOkupansi.forEach((ruangan, idx) => {

      const kodeRuang = `RG${(idx + 1).toString().padStart(2, '0')}`;

      const namaRuang = ruangan.ruangan;

      const jumlahTerisi = ruangan.jamish;

      const jumlahKosong = ruangan.tt - ruangan.jamish;

      const kelasRuang = getKodeKelasFromRuangan(namaRuang);

      const namaKelasRuang = getNamaKelas(namaRuang);

      

      // Kamar TERISI (status_kamar = "terisi", status_text = 1)

      for (let i = 1; i <= jumlahTerisi; i++) {

        kamarList.push({

          kode_kamar: `${kodeRuang}-${(i).toString().padStart(2, '0')}`,

          kode_ruangan: kodeRuang,

          nama_ruangan: namaRuang,

          kode_kelas: kelasRuang,

          nama_kelas: namaKelasRuang,

          status_kamar: "terisi", // STRING "terisi"

          status_text: 1 // NUMBER 1

          // NO_BED DIHAPUS

        });

      }

      

      // Kamar KOSONG (status_kamar = "kosong", status_text = 0)

      for (let i = 1; i <= jumlahKosong; i++) {

        kamarList.push({

          kode_kamar: `${kodeRuang}-K${i.toString().padStart(2, '0')}`, // Tambah K untuk kosong

          kode_ruangan: kodeRuang,

          nama_ruangan: namaRuang,

          kode_kelas: kelasRuang,

          nama_kelas: namaKelasRuang,

          status_kamar: "kosong", // STRING "kosong"

          status_text: 0 // NUMBER 0

          // NO_BED DIHAPUS

        });

      }

    });

    

    // Filter by status_kamar (string)

    if (status_kamar) {

      if (status_kamar === 'kosong' || status_kamar === 'terisi') {

        kamarList = kamarList.filter(k => k.status_kamar === status_kamar);

      } else if (status_kamar === '0') {

        // Support untuk query dengan angka 0

        kamarList = kamarList.filter(k => k.status_text === 0);

      } else if (status_kamar === '1') {

        // Support untuk query dengan angka 1

        kamarList = kamarList.filter(k => k.status_text === 1);

      }

    }

    

    // Filter by kode_ruangan

    if (kode_ruangan) {

      kamarList = kamarList.filter(k => k.kode_ruangan === kode_ruangan);

    }

    

    // Contoh khusus untuk CHANDRA (RG11) - K10 harus kosong

    const rg11K10 = kamarList.find(k => k.kode_kamar === 'RG11-K10');

    if (rg11K10) {

      const index = kamarList.findIndex(k => k.kode_kamar === 'RG11-K10');

      kamarList[index] = {

        ...kamarList[index],

        status_kamar: "kosong", // STRING "kosong"

        status_text: 0 // NUMBER 0

      };

    }

    

    // Contoh khusus untuk KEKICANA (RG07) - 03 harus terisi

    const rg07_03 = kamarList.find(k => k.kode_kamar === 'RG07-03');

    if (rg07_03) {

      const index = kamarList.findIndex(k => k.kode_kamar === 'RG07-03');

      kamarList[index] = {

        ...kamarList[index],

        status_kamar: "terisi", // STRING "terisi"

        status_text: 1 // NUMBER 1

      };

    }

    

    const response = {

      success: true,

      message: `✅ ${kamarList.length} kamar ditemukan`,

      data: kamarList

    };

    

    res.json(response);

    

  } catch (error) {

    console.log('⚠️  Error:', error.message);

    res.json({

      success: false,

      message: 'Gagal mengambil data kamar'

    });

  }

});



// ========================

// API 2: DETAIL RUANGAN

// ========================

app.get('/api/ruangan/:kode', async (req, res) => {

  try {

    const { kode } = req.params;

    

    console.log(`✅ Detail ruangan: ${kode}`);

    

    // Cari ruangan berdasarkan kode

    const ruanganIndex = dataOkupansi.findIndex((_, idx) => 

      `RG${(idx + 1).toString().padStart(2, '0')}` === kode

    );

    

    if (ruanganIndex === -1) {

      return res.json({

        success: false,

        message: 'Ruangan tidak ditemukan'

      });

    }

    

    const ruangan = dataOkupansi[ruanganIndex];

    const kodeRuang = kode;

    const namaRuang = ruangan.ruangan;

    const jumlahTerisi = ruangan.jamish;

    const jumlahKosong = ruangan.tt - ruangan.jamish;

    

    // Generate detail kamar

    const semuaKamar = [];

    

    // Kamar TERISI

    for (let i = 1; i <= jumlahTerisi; i++) {

      semuaKamar.push({

        kode_kamar: `${kodeRuang}-${i.toString().padStart(2, '0')}`,

        // NO_BED DIHAPUS

        status_kamar: "terisi", // STRING "terisi"

        status_text: 1 // NUMBER 1

      });

    }

    

    // Kamar KOSONG

    for (let i = 1; i <= jumlahKosong; i++) {

      semuaKamar.push({

        kode_kamar: `${kodeRuang}-K${i.toString().padStart(2, '0')}`, // Tambah K untuk kosong

        // NO_BED DIHAPUS

        status_kamar: "kosong", // STRING "kosong"

        status_text: 0 // NUMBER 0

      });

    }

    

    // Khusus untuk RG11 (CHANDRA), pastikan K10 kosong

    if (kode === 'RG11') {

      const rg11K10 = semuaKamar.find(k => k.kode_kamar === 'RG11-K10');

      if (rg11K10) {

        const index = semuaKamar.findIndex(k => k.kode_kamar === 'RG11-K10');

        semuaKamar[index] = {

          ...semuaKamar[index],

          status_kamar: "kosong",

          status_text: 0

        };

      }

    }

    

    // Khusus untuk RG07 (KEKICANA), pastikan 03 terisi

    if (kode === 'RG07') {

      const rg07_03 = semuaKamar.find(k => k.kode_kamar === 'RG07-03');

      if (rg07_03) {

        const index = semuaKamar.findIndex(k => k.kode_kamar === 'RG07-03');

        semuaKamar[index] = {

          ...semuaKamar[index],

          status_kamar: "terisi",

          status_text: 1

        };

      }

    }

    

    const response = {

      success: true,

      message: `✅ Detail ruangan ${namaRuang}`,

      data: {

        ruangan: namaRuang,

        kode_ruangan: kodeRuang,

        kelas: getNamaKelas(namaRuang),

        kode_kelas: getKodeKelasFromRuangan(namaRuang),

        total_tempat_tidur: ruangan.tt,

        terisi: jumlahTerisi,

        kosong: jumlahKosong,

        persentase_okupansi: ruangan.persentase.toFixed(2) + '%',

        detail_statistik: {

          d: ruangan.d,

          u: ruangan.u,

          epj5: ruangan.epj5,

          pr3h: ruangan.pr3h,

          jamish: ruangan.jamish,

          bor: ruangan.bor

        },

        kamar: semuaKamar,

        statistik_kamar: {

          total: ruangan.tt,

          terisi: semuaKamar.filter(k => k.status_text === 1).length,

          kosong: semuaKamar.filter(k => k.status_text === 0).length

        }

      }

    };

    

    res.json(response);

    

  } catch (error) {

    console.log('⚠️  Error:', error.message);

    res.json({

      success: false,

      message: 'Gagal mengambil detail ruangan'

    });

  }

});



// ========================

// API 3: DATA OKUPANSI KAMAR

// ========================

app.get('/api/okupansi-kamar', async (req, res) => {

  try {

    console.log(`✅ Data okupansi kamar`);

    

    const dataWithStatus = dataOkupansi.map((item, index) => {

      const kodeRuang = `RG${(index + 1).toString().padStart(2, '0')}`;

      const jumlahTerisi = item.jamish;

      const jumlahKosong = item.tt - item.jamish;

      

      // Status kamar: status_kamar="kosong"/"terisi", status_text=0/1

      const kamarTerisi = Array.from({ length: jumlahTerisi }, (_, i) => ({

        kode_kamar: `${kodeRuang}-${(i + 1).toString().padStart(2, '0')}`,

        // NO_BED DIHAPUS

        status_kamar: "terisi",

        status_text: 1

      }));

      

      const kamarKosong = Array.from({ length: jumlahKosong }, (_, i) => ({

        kode_kamar: `${kodeRuang}-K${(i + 1).toString().padStart(2, '0')}`,

        // NO_BED DIHAPUS

        status_kamar: "kosong",

        status_text: 0

      }));

      

      return {

        no: index + 1,

        ruangan: item.ruangan,

        kode_ruangan: kodeRuang,

        total_tempat_tidur: item.tt,

        terisi: item.jamish,

        kosong: item.tt - item.jamish,

        persentase_okupansi: item.persentase.toFixed(2) + '%',

        detail_kamar: [...kamarTerisi, ...kamarKosong],

        detail: {

          d: item.d,

          u: item.u,

          epj5: item.epj5,

          pr3h: item.pr3h,

          jamish: item.jamish,

          bor: item.bor

        }

      };

    });

    

    // Hitung totals

    const totalJamishPaster = dataOkupansi.reduce((sum, item) => sum + item.jamish, 0);

    const totalBor = dataOkupansi.reduce((sum, item) => sum + item.bor, 0);

    const totalPersentase = dataOkupansi.length > 0 

      ? dataOkupansi.reduce((sum, item) => sum + item.persentase, 0) / dataOkupansi.length 

      : 0;

    

    const response = {

      success: true,

      message: `✅ Data okupansi ${dataOkupansi.length} ruangan ditemukan`,

      data: dataWithStatus,

      summary: {

        total_tt: dataOkupansi.reduce((sum, item) => sum + item.tt, 0),

        total_kosong: dataOkupansi.reduce((sum, item) => sum + (item.tt - item.jamish), 0),

        total_terisi: dataOkupansi.reduce((sum, item) => sum + item.jamish, 0),

        total_pasien: totalBor,

        persentase_okupansi: totalPersentase.toFixed(2) + '%'

      }

    };

    

    res.json(response);

    

  } catch (error) {

    console.log('⚠️  Error:', error.message);

    res.json({

      success: false,

      message: 'Gagal mengambil data okupansi'

    });

  }

});



// ========================

// HOME PAGE

// ========================

app.get('/', (req, res) => {

  res.json({

    message: '🏥 EMIRS API - MODULE RAWAT INAP',

    version: '2.4.0',

    status: '✅ READY',

    format_status: {

      'status_kamar': 'String: "kosong" atau "terisi"',

      'status_text': 'Number: 0 atau 1'

    },

    contoh_output: {

      kamar_kosong: {

        "kode_kamar": "RG11-K10",

        "kode_ruangan": "RG11",

        "nama_ruangan": "CHANDRA",

        "kode_kelas": "KLS03",

        "nama_kelas": "Kelas 3",

        "status_kamar": "kosong",

        "status_text": 0

      },

      kamar_terisi: {

        "kode_kamar": "RG07-03",

        "kode_ruangan": "RG07",

        "nama_ruangan": "KEKICANA",

        "kode_kelas": "KLS03",

        "nama_kelas": "Kelas 3",

        "status_kamar": "terisi",

        "status_text": 1

      }

    },

    endpoints: {

      kamar_status: 'GET /api/kamar-status?status_kamar=kosong&kode_ruangan=RG11',

      detail_ruangan: 'GET /api/ruangan/RG11',

      okupansi_kamar: 'GET /api/okupansi-kamar'

    },

    contoh_url: [

      'http://localhost:3000/api/kamar-status?status_kamar=kosong',

      'http://localhost:3000/api/kamar-status?status_kamar=terisi',

      'http://localhost:3000/api/kamar-status?kode_ruangan=RG11',

      'http://localhost:3000/api/ruangan/RG11'

    ]

  });

});



// ========================

// START SERVER

// ========================

const PORT = 3000;

app.listen(PORT, () => {

  console.log(`

  🏥 EMIRS API - MODULE RAWAT INAP

  =================================

  📍 http://localhost:${PORT}

  

  ✅ FORMAT STATUS YANG BENAR:

  - Kamar KOSONG: {

      "status_kamar": "kosong",   // STRING

      "status_text": 0            // NUMBER

    }

  - Kamar TERISI: {

      "status_kamar": "terisi",   // STRING

      "status_text": 1            // NUMBER

    }

  

  ✅ CONTOH OUTPUT (TANPA NO_BED):

  

  1. Kamar KOSONG:

  {

    "kode_kamar": "RG11-K10",

    "status_kamar": "kosong",

    "status_text": 0

  }

  

  2. Kamar TERISI:

  {

    "kode_kamar": "RG07-03",

    "status_kamar": "terisi",

    "status_text": 1

  }

  

  ✅ ENDPOINTS UTAMA:

  1. GET /api/kamar-status?status_kamar=kosong

  2. GET /api/kamar-status?status_kamar=terisi

  3. GET /api/kamar-status?kode_ruangan=RG11

  4. GET /api/ruangan/RG11

  

  📋 CONTOH PENGGUNAAN:

  - Kamar kosong: http://localhost:${PORT}/api/kamar-status?status_kamar=kosong

  - Kamar terisi: http://localhost:${PORT}/api/kamar-status?status_kamar=terisi

  - Detail RG11: http://localhost:${PORT}/api/ruangan/RG11

  

  ✅ Server ready!`);

});