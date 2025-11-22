const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  capacity: { type: Number },
  warden: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  rooms: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hostel', HostelSchema);
