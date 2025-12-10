const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume');

// API 1: GET RESUME MEDIS PASIEN - JOIN pasien_ralan + pasien_igd
// Parameter: no_pasien, tanggal_pelayanan (opsional), jenis_pelayanan (ralan/igd)
router.get('/resume-medis', resumeController.getResumeMedis);

// API 2: GET DETAIL SOAP BY NO_REG
// Parameter: no_reg (dari Ralan atau IGD)
router.get('/detail-soap/:no_reg', resumeController.getDetailSoap);

// API 3: GET RIWAYAT SOAP PASIEN - All Time
// Parameter: no_pasien, tahun (opsional), bulan (opsional), limit (opsional)
router.get('/riwayat-soap/:no_pasien', resumeController.getRiwayatSoap);

// API 4: SEARCH RESUME MEDIS
// Parameter: keyword (opsional), tipe (ralan/igd), tanggal_awal, tanggal_akhir
router.get('/search-resume', resumeController.searchResumeMedis);

module.exports = router;