const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateWeeklyReport,
  getWeeklyReport,
  getStudentReports,
  getPendingEmails,
  markReportSent
} = require('../controllers/weeklyReportController');

// Weekly Report Routes
router.post('/generate/:studentId', auth, generateWeeklyReport);
router.get('/:reportId', auth, getWeeklyReport);
router.get('/student/:studentId', auth, getStudentReports);
router.get('/pending/emails', auth, getPendingEmails);
router.put('/sent/:reportId', auth, markReportSent);

module.exports = router;
