const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/', assignmentController.createAssignment);
router.get('/', assignmentController.getAssignments);
router.post('/resource', assignmentController.addResource);
router.get('/resource', assignmentController.getResources);

module.exports = router;
