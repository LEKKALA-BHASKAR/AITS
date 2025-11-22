const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { auth, roleCheck } = require('../middleware/auth');

// Student routes
router.get('/my-results', auth, roleCheck(['student']), resultController.getMyResults);

// Teacher/Admin routes
router.post('/', auth, roleCheck(['teacher', 'admin']), resultController.createOrUpdateResult);
router.get('/student/:studentId', auth, roleCheck(['teacher', 'admin', 'student']), resultController.getStudentResults);
router.get('/section/:sectionId', auth, roleCheck(['teacher', 'admin']), resultController.getSectionResults);
router.put('/publish/:resultId', auth, roleCheck(['teacher', 'admin']), resultController.publishResult);
router.put('/lock/:resultId', auth, roleCheck(['admin']), resultController.lockResult);
router.delete('/:resultId', auth, roleCheck(['admin']), resultController.deleteResult);

module.exports = router;
