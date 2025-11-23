const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addActivity,
  getActivities,
  getActivitySummary,
  getActivityStreak,
  verifyActivity
} = require('../controllers/activityController');

// Activity Routes
router.post('/add', auth, addActivity);
router.get('/student/:studentId', auth, getActivities);
router.get('/summary/:studentId', auth, getActivitySummary);
router.get('/streak/:studentId', auth, getActivityStreak);
router.put('/verify/:activityId', auth, verifyActivity);

module.exports = router;
