const mongoose = require('mongoose');

const InternshipBatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InternshipBatch', InternshipBatchSchema);
