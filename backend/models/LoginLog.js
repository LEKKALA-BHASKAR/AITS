const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel' },
  userModel: { type: String, enum: ['Student', 'Teacher', 'Admin'], required: true },
  email: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  failureReason: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Index for faster queries
LoginLogSchema.index({ userId: 1, timestamp: -1 });
LoginLogSchema.index({ email: 1, timestamp: -1 });

module.exports = mongoose.model('LoginLog', LoginLogSchema);
