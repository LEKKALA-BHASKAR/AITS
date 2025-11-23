const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllRecommendations,
  getStudentRecommendations,
  getByPriority,
  getUrgentRecommendations,
  getCounselorRecommendations,
  assignCounselor,
  addSession,
  markResolved,
  createManualRecommendation
} = require('../controllers/counselingController');

// Counseling Recommendation Routes
router.get('/all', auth, getAllRecommendations);
router.get('/student/:studentId', auth, getStudentRecommendations);
router.get('/priority/:priority', auth, getByPriority);
router.get('/urgent', auth, getUrgentRecommendations);
router.get('/counselor/my', auth, getCounselorRecommendations);
router.post('/assign/:recommendationId', auth, assignCounselor);
router.post('/session/:recommendationId', auth, addSession);
router.put('/resolve/:recommendationId', auth, markResolved);
router.post('/create', auth, createManualRecommendation);

module.exports = router;
