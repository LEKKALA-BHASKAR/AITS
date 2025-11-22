const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

router.post('/', libraryController.addBook);
router.get('/', libraryController.getBooks);
router.patch('/:id/copies', libraryController.updateBookCopies);

module.exports = router;
