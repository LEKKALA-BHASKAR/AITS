const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTeacherNote,
  getStudentNotes,
  getMyNotes,
  getSharedNotes,
  addNoteResponse,
  shareNote,
  updateNoteStatus,
  getPendingFollowUps,
  getHighPriorityNotes
} = require('../controllers/teacherNoteController');

// Teacher Note Routes
router.post('/create', auth, createTeacherNote);
router.get('/student/:studentId', auth, getStudentNotes);
router.get('/my-notes', auth, getMyNotes);
router.get('/shared', auth, getSharedNotes);
router.post('/response/:noteId', auth, addNoteResponse);
router.post('/share/:noteId', auth, shareNote);
router.put('/status/:noteId', auth, updateNoteStatus);
router.get('/pending-followups', auth, getPendingFollowUps);
router.get('/high-priority', auth, getHighPriorityNotes);

module.exports = router;
