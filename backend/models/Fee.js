const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  paidAt: { type: Date }
});

module.exports = mongoose.model('Fee', FeeSchema);
