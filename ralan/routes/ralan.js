const express = require('express');
const router = express.Router();

const ralanController = require('../controllers/ralan');

// ========== API EMIRS ROUTES ==========

// Poliklinik
router.get('/poliklinik', (req, res) => ralanController.getAllPoliklinik(req, res));
router.get('/poliklinik/:tujuan_poli/pasien', (req, res) => ralanController.getPasienByPoliklinik(req, res));

// Pasien
router.get('/detail-pasien/:no_reg', (req, res) => ralanController.getDetailPasien(req, res));
router.get('/pasien/:no_pasien', (req, res) => ralanController.getPasienByNo(req, res));
router.get('/search-pasien', (req, res) => ralanController.searchPasien(req, res));

// Pelayanan
router.get('/pelayanan-pasien/:no_pasien', (req, res) => ralanController.getPelayananByPasien(req, res));
router.get('/pelayanan-tanggal', (req, res) => ralanController.getPelayananByDate(req, res));
router.get('/pelayanan-detail/:no_reg', (req, res) => ralanController.getPelayananDetail(req, res));

// Laporan
router.get('/laporan-pasien-bulanan', (req, res) => ralanController.getLaporanPasienPerBulan(req, res));
router.get('/laporan-detail-pasien', (req, res) => ralanController.getDetailPasienLaporan(req, res));
router.get('/rekap-poliklinik', (req, res) => ralanController.getRekapPoliklinik(req, res));

// Rekap
router.get('/rekap-bulanan', (req, res) => ralanController.rekapBulanan(req, res));

// Health check
router.get('/health', (req, res) => ralanController.getHealth(req, res));;

module.exports = router;