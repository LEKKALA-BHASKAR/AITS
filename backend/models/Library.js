const mongoose = require('mongoose');

const LibrarySchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String },
  isbn: { type: String, unique: true },
  category: { type: String },
  availableCopies: { type: Number, default: 1 },
  totalCopies: { type: Number, default: 1 },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Library', LibrarySchema);
