const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const student360Controller = require('../controllers/student360Controller');

// Get complete 360° profile for a student
router.get('/:studentId', auth, roleCheck(['admin', 'teacher', 'student']), student360Controller.getStudent360Profile);

// Get batch risk analysis for multiple students
router.get('/risk-analysis/batch', auth, roleCheck(['admin', 'teacher']), student360Controller.getBatchRiskAnalysis);

// Get subject-wise performance chart data
router.get('/:studentId/performance/subjects', auth, roleCheck(['admin', 'teacher', 'student']), student360Controller.getSubjectPerformance);

module.exports = router;
