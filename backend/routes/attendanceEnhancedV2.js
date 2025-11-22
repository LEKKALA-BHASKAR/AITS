const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const attendanceEnhancedV2Controller = require('../controllers/attendanceEnhancedV2Controller');

// Get current period for teacher (real-time)
router.get('/current-period', auth, roleCheck(['teacher', 'admin']), attendanceEnhancedV2Controller.getCurrentPeriod);

// Get today's complete schedule for teacher
router.get('/today-schedule', auth, roleCheck(['teacher', 'admin']), attendanceEnhancedV2Controller.getTodaySchedule);

// Mark attendance with enhanced validation and notifications
router.post('/mark-enhanced', auth, roleCheck(['teacher', 'admin']), attendanceEnhancedV2Controller.markAttendanceEnhanced);

// Get teacher's attendance statistics
router.get('/teacher-stats', auth, roleCheck(['teacher', 'admin']), attendanceEnhancedV2Controller.getTeacherAttendanceStats);

module.exports = router;
