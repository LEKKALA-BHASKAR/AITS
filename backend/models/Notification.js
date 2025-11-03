const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'postedByModel' },
  postedByModel: { type: String, enum: ['Admin', 'Teacher'] },
  target: { type: String, enum: ['all', 'student', 'teacher', 'section', 'department'], default: 'all' },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
