const mongoose = require('mongoose');

const ProjectGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  coGuide: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  batch: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProjectGroup', ProjectGroupSchema);
