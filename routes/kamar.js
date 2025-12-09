const express = require('express');
const router = express.Router();
const kamarController = require('../controllers/kamar');

// Middleware untuk kamar routes
router.use((req, res, next) => {
    console.log(`🛏️ Kamar API: ${req.method} ${req.path}`);
    next();
});

// Routes untuk kamar
router.get('/tersedia', kamarController.getKamarTersedia);
router.get('/okupansi', kamarController.getOkupansiKamar);
router.get('/status', kamarController.getKamarStatus);

module.exports = router;