const mongoose = require('mongoose');

const IDCardSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  cardNumber: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive', 'Lost'], default: 'Active' },
  photoUrl: { type: String }
});

module.exports = mongoose.model('IDCard', IDCardSchema);
