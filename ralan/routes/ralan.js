const express = require('express');
const router = express.Router();
const raianController = require('../controllers/ralan');

// API 1: GET PELAYANAN PASIEN
router.get('/getpelayanan', raianController.getPelayanan);

// API 2: LIST PASIEN
router.get('/list-pasien', raianController.listPasien);

// API 3: DETAIL PASIEN BY NO_REG
router.get('/detail-pasien/:no_reg', raianController.detailPasien);

// API 4: RIWAYAT PASIEN BY NO_PASIEN
router.get('/pasien/:no_pasien', raianController.riwayatPasien);

// API 5: LIST POLI
router.get('/list-poli', raianController.listPoli);

// API 6: SEARCH PASIEN
router.get('/search-pasien', raianController.searchPasien);

// API 7: REKAP BULANAN
router.get('/rekap-bulanan', raianController.rekapBulanan);

module.exports = router;