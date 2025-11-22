const Library = require('../models/Library');

module.exports = {
  async addBook(req, res) {
    try {
      const book = await Library.create(req.body);
      res.status(201).json(book);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getBooks(req, res) {
    try {
      const books = await Library.find();
      res.json(books);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async updateBookCopies(req, res) {
    try {
      const { id } = req.params;
      const { availableCopies, totalCopies } = req.body;
      const book = await Library.findByIdAndUpdate(id, { availableCopies, totalCopies }, { new: true });
      res.json(book);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
