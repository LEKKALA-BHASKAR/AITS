const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTimeline,
  getTimelineSummary,
  addTimelineEvent,
  getTimelineByType,
  getCriticalEvents
} = require('../controllers/timelineController');

// Timeline Routes
router.get('/student/:studentId', auth, getTimeline);
router.get('/summary/:studentId', auth, getTimelineSummary);
router.post('/add', auth, addTimelineEvent);
router.get('/type/:studentId/:eventType', auth, getTimelineByType);
router.get('/critical/:studentId', auth, getCriticalEvents);

module.exports = router;
