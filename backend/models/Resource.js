const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);
