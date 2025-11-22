const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');

router.post('/batch', internshipController.createBatch);
router.post('/batch/:id/add-student', internshipController.addStudentToBatch);
router.post('/document/upload', internshipController.uploadDocument);
router.post('/document/:id/approve', internshipController.approveDocument);
router.get('/batches', internshipController.getBatches);
router.get('/companies', internshipController.getCompanies);
router.get('/documents', internshipController.getDocuments);

module.exports = router;
