const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/group', projectController.createGroup);
router.post('/document/upload', projectController.uploadDocument);
router.post('/evaluate', projectController.evaluateProject);
router.get('/groups', projectController.getGroups);
router.get('/documents', projectController.getDocuments);
router.get('/evaluations', projectController.getEvaluations);

module.exports = router;
