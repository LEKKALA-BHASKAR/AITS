const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { auth, roleCheck } = require('../middleware/auth');

// Upload timetable (HOD/Admin only)
router.post('/upload', auth, roleCheck(['admin']), timetableController.uploadTimetable);

// Get timetable by section
router.get('/section/:sectionName', auth, timetableController.getTimetableBySection);

// Get today's schedule for a section
router.get('/today/:sectionName', auth, timetableController.getTodaySchedule);

// Get teacher's today's schedule
router.get('/teacher/today', auth, roleCheck(['teacher']), timetableController.getTeacherTodaySchedule);

// Get current slot for a section
router.get('/current-slot/:sectionName', auth, timetableController.getCurrentSlot);

// Get all timetables
router.get('/', auth, timetableController.getTimetables);

// Delete timetable
router.delete('/:sectionName', auth, roleCheck(['admin']), timetableController.deleteTimetable);

// Legacy endpoint
router.post('/', auth, roleCheck(['admin', 'teacher']), timetableController.createTimetable);

module.exports = router;
