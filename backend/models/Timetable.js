const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  day: { type: String, required: true },
  period: { type: Number, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  startTime: { type: String },
  endTime: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', TimetableSchema);
