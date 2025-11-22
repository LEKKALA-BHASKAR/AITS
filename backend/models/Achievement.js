const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['olympiad', 'hackathon', 'publication', 'patent', 'course', 'other'], required: true },
  tags: [{ type: String }],
  certificateUrl: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Achievement', AchievementSchema);
