const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostelController');

router.post('/', hostelController.addHostel);
router.get('/', hostelController.getHostels);

module.exports = router;
