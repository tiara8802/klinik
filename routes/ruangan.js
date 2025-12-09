const express = require('express');
const router = express.Router();
const ruanganController = require('../controllers/ruangan');

// Middleware untuk ruangan routes
router.use((req, res, next) => {
    console.log(`📊 Ruangan API: ${req.method} ${req.path}`);
    next();
});

// Routes untuk ruangan
router.get('/ketersediaan-bed', ruanganController.getKetersediaanBed);
router.get('/ketersediaan-bed/tabel', ruanganController.getKetersediaanBedTabel);
router.get('/check-db', ruanganController.checkDatabase);

module.exports = router;