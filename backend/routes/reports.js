const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { auth, roleCheck } = require('../middleware/auth');

// Download monthly attendance report for a section
router.get('/monthly/:sectionName', auth, roleCheck(['admin', 'teacher']), reportController.downloadMonthlyReport);

// Download comprehensive report (all subjects)
router.get('/monthly-comprehensive/:sectionName', auth, roleCheck(['admin', 'teacher']), reportController.downloadComprehensiveReport);

// Generate all section reports (Admin only)
router.post('/generate-all', auth, roleCheck(['admin']), reportController.generateAllReports);

// Get available months for reports
router.get('/available-months/:sectionName', auth, reportController.getAvailableMonths);

module.exports = router;
