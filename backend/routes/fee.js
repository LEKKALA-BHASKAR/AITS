const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

router.post('/', feeController.createFee);
router.get('/', feeController.getFees);
router.patch('/:id/paid', feeController.markFeePaid);

module.exports = router;
