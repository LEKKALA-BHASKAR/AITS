const express = require('express');
const router = express.Router();
const mentoringController = require('../controllers/mentoringController');

router.post('/', mentoringController.createMentoring);
router.get('/', mentoringController.getMentorings);

module.exports = router;
