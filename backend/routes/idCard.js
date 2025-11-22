const express = require('express');
const router = express.Router();
const idCardController = require('../controllers/idCardController');

router.post('/', idCardController.issueIDCard);
router.get('/', idCardController.getIDCards);
router.patch('/:id/status', idCardController.updateIDCardStatus);

module.exports = router;
