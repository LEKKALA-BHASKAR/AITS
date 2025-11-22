const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, roleCheck } = require('../middleware/auth');

// Mark attendance (Teacher only)
router.post('/mark', auth, roleCheck(['teacher']), attendanceController.markAttendance);

// Get current slot for attendance marking
router.get('/current-slot/:section', auth, roleCheck(['teacher']), attendanceController.getCurrentSlotForAttendance);

// Get student attendance
router.get('/student/:studentId', auth, attendanceController.getStudentAttendance);

// Get student attendance statistics
router.get('/student/:studentId/stats', auth, attendanceController.getStudentStats);

// Get section attendance
router.get('/section/:sectionName', auth, roleCheck(['teacher', 'admin']), attendanceController.getSectionAttendance);

// Lock expired attendance (Internal/Cron job)
router.post('/lock', attendanceController.lockExpiredAttendance);

module.exports = router;
