const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/group', chatController.createGroup);
router.post('/message', chatController.sendMessage);
router.get('/messages/:groupId', chatController.getMessages);
router.delete('/message/:id', chatController.deleteMessage);

module.exports = router;
