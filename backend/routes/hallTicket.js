const express = require('express');
const router = express.Router();
const hallTicketController = require('../controllers/hallTicketController');

router.post('/', hallTicketController.issueHallTicket);
router.get('/', hallTicketController.getHallTickets);

module.exports = router;
