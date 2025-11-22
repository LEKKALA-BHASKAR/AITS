const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const remarkController = require('../controllers/remarkController');

// Student-specific remark routes
router.get('/student/:studentId', auth, roleCheck(['admin', 'teacher', 'student']), remarkController.getStudentRemarks);
router.get('/student/:studentId/summary', auth, roleCheck(['admin', 'teacher', 'student']), remarkController.getStudentSummary);
router.get('/student/:studentId/timeline', auth, roleCheck(['admin', 'teacher', 'student']), remarkController.getStudentTimeline);
router.post('/student/:studentId', auth, roleCheck(['admin', 'teacher']), remarkController.addRemark);

// Individual remark operations
router.put('/:remarkId', auth, roleCheck(['admin', 'teacher']), remarkController.updateRemark);
router.delete('/:remarkId', auth, roleCheck(['admin', 'teacher']), remarkController.deleteRemark);

// Follow-up and issue tracking
router.get('/follow-up', auth, roleCheck(['admin', 'teacher']), remarkController.getFollowUpRemarks);
router.get('/unresolved', auth, roleCheck(['admin', 'teacher']), remarkController.getUnresolvedIssues);

// Analytics and reporting
router.get('/by-category', auth, roleCheck(['admin']), remarkController.getRemarksByCategory);

module.exports = router;
