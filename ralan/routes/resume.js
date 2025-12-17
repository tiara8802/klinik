// routes/resume.js - VERSI FIX
const express = require('express');
const router = express.Router();

// IMPORT DENGAN BENAR
const resumeController = require('../controllers/resume');

// ROUTES
router.get('/resume-medis', resumeController.getResumeMedis);
router.get('/resume-medis/simple', resumeController.getResumeMedisSimple);
router.get('/resume-medis/check', resumeController.checkDatabaseStructure);
router.get('/resume-medis/search', resumeController.searchResume);

module.exports = router;