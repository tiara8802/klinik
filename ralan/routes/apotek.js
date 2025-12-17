const express = require('express');
const router = express.Router();
const apotek = require('../controllers/apotek'); // GANTI disini

// Route untuk mendapatkan list obat berdasarkan no_rm dan tanggal
router.get('/obat', apotek.getObatByPasien);

// Route untuk mendapatkan info pasien
router.get('/pasien/:no_rm', apotek.getPasienInfo);

module.exports = router;