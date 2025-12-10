const express = require('express');
const router = express.Router();
const apotekController = require('../controllers/apotek');

// API 1: GET RESEP PASIEN (parameter: no_pasien, tanggal_pelayanan)
router.get('/resep-pasien', apotekController.getResepPasien);

// API 2: LIST RESEP BY TANGGAL (parameter: tanggal)
router.get('/list-resep', apotekController.listResepByTanggal);

// API 3: DETAIL RESEP BY NO_RESEP (parameter: no_resep)
router.get('/detail-resep/:no_resep', apotekController.detailResep);

// API 4: GET OBAT BY NO_REG (parameter: no_reg)
router.get('/obat-reg/:no_reg', apotekController.getObatByNoReg);

module.exports = router;