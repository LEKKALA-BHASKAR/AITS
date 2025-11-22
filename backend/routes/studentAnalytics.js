const express = require('express');
const router = express.Router();
const studentAnalyticsController = require('../controllers/studentAnalyticsController');
const { auth } = require('../middleware/auth');

// Get comprehensive attendance analytics for a student
router.get('/attendance/:studentId', auth, studentAnalyticsController.getAttendanceAnalytics);

// Get monthly attendance breakdown
router.get('/attendance/:studentId/monthly', auth, studentAnalyticsController.getMonthlyAttendanceBreakdown);

// Compare with section average
router.get('/attendance/:studentId/compare', auth, studentAnalyticsController.compareWithSection);

// Get warnings and suggestions
router.get('/attendance/:studentId/warnings', auth, studentAnalyticsController.getWarningsAndSuggestions);

module.exports = router;
