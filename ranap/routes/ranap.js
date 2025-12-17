// routes/ranap.js
const express = require('express');
const router = express.Router();
const ranapController = require('../controllers/ranapController'); // Pastikan path ini benar!

// Debug log
console.log('🔄 Loading ranap routes...');
console.log('🔄 Controller loaded:', ranapController ? 'Yes' : 'No');
console.log('🔄 Controller methods:', Object.keys(ranapController || {}));

// ====================
// ROUTES DEFINITION
// ====================

// 1. LIST PASIEN RANAP
router.get('/list', ranapController.list);  // Pastikan ranapController.list adalah function

// 2. DETAIL PASIEN BY NO_REG
router.get('/detail/:no_reg', ranapController.detail);

// 3. RIWAYAT PASIEN BY NO_RM
router.get('/riwayat/:no_rm', ranapController.riwayat);

// 4. STATISTIK
router.get('/statistik', ranapController.statistik);

// 5. SEARCH PASIEN
router.get('/search', ranapController.search);

// 6. UPDATE STATUS
router.post('/update-status', ranapController.updateStatus);

// 7. GET KAMAR LIST
router.get('/kamar-list', ranapController.getKamarList);

// 8. CHECK TABLES
router.get('/check-tables', ranapController.checkTables);

// 9. DEBUG ENDPOINT
router.get('/debug/:no_rm', ranapController.debugRiwayat || ((req, res) => {
    res.json({ message: 'Debug endpoint not available' });
}));

// Export router
module.exports = router;