const express = require('express');
const router = express.Router();
const attendanceEnhancedController = require('../controllers/attendanceEnhancedController');
const { auth, roleCheck } = require('../middleware/auth');

// HOD Override - Mark or edit attendance anytime
router.post('/hod-override', auth, roleCheck(['admin']), attendanceEnhancedController.hodOverrideAttendance);

// Lock/Unlock attendance
router.post('/lock/:attendanceId', auth, roleCheck(['admin', 'teacher']), attendanceEnhancedController.lockAttendance);
router.post('/unlock/:attendanceId', auth, roleCheck(['admin']), attendanceEnhancedController.unlockAttendance);

// Audit trail
router.get('/audit/:attendanceId', auth, roleCheck(['admin', 'teacher']), attendanceEnhancedController.getAuditTrail);
router.get('/audit/section/:sectionName', auth, roleCheck(['admin', 'teacher']), attendanceEnhancedController.getSectionAuditLogs);

// Attendance correction requests (Student)
router.post('/correction-request', auth, roleCheck(['student']), attendanceEnhancedController.submitCorrectionRequest);
router.get('/correction-requests/pending', auth, roleCheck(['admin', 'teacher']), attendanceEnhancedController.getPendingCorrectionRequests);
router.put('/correction-request/:requestId', auth, roleCheck(['admin', 'teacher']), attendanceEnhancedController.reviewCorrectionRequest);

// Leave status check
router.get('/leave-status/:studentId/:date', auth, attendanceEnhancedController.getLeaveStatus);

module.exports = router;
