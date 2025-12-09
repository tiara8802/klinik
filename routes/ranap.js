const express = require('express');
const router = express.Router();
const rawatInapController = require('../controllers/ranap');

// Middleware untuk rawat inap routes
router.use((req, res, next) => {
    console.log(`🏥 Rawat Inap API: ${req.method} ${req.path}`);
    next();
});

// Routes untuk rawat inap
router.get('/list', rawatInapController.listPasien);
router.get('/detail/:no_reg', rawatInapController.detailPasien);
router.get('/pasien/:no_rm', rawatInapController.riwayatPasien);
router.get('/statistik', rawatInapController.statistik);

module.exports = router;