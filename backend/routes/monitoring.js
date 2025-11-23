const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  calculateMonitoringScore,
  getMonitoringScore,
  getStudentsByRiskLevel,
  getMostImprovedStudents,
  getDecliningStudents,
  detectEarlyWarnings,
  getBehaviorHeatmap,
  detectSilentStudents,
  generateCounselingRecommendations
} = require('../controllers/monitoringController');

// Monitoring Score Routes
router.post('/score/calculate/:studentId', auth, calculateMonitoringScore);
router.get('/score/:studentId', auth, getMonitoringScore);
router.get('/risk-level/:riskLevel', auth, getStudentsByRiskLevel);
router.get('/most-improved', auth, getMostImprovedStudents);
router.get('/declining', auth, getDecliningStudents);

// Early Warning System
router.get('/early-warnings/:studentId', auth, detectEarlyWarnings);

// Behavior Analysis
router.get('/behavior-heatmap/:studentId', auth, getBehaviorHeatmap);

// Silent Student Detection
router.get('/silent-students/section/:sectionId', auth, detectSilentStudents);

// Counseling Recommendations
router.post('/counseling/generate/:studentId', auth, generateCounselingRecommendations);

module.exports = router;
