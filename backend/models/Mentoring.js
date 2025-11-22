const mongoose = require('mongoose');

const MentoringSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  mentee: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  notes: { type: String }
});

module.exports = mongoose.model('Mentoring', MentoringSchema);
