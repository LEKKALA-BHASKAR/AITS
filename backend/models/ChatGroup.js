const mongoose = require('mongoose');

const ChatGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['class', 'department', 'faculty', 'individual'], required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatGroup', ChatGroupSchema);
