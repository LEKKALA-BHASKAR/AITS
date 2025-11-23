const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addBehaviorLog,
  getBehaviorLogs,
  updateEngagementLevel,
  batchAddEngagement
} = require('../controllers/behaviorController');

// Behavior Log Routes
router.post('/log', auth, addBehaviorLog);
router.get('/logs/:studentId', auth, getBehaviorLogs);
router.put('/engagement/:logId', auth, updateEngagementLevel);
router.post('/engagement/batch', auth, batchAddEngagement);

module.exports = router;
