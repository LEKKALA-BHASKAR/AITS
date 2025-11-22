const mongoose = require('mongoose');

const ProjectDocumentSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectGroup', required: true },
  type: { type: String, enum: ['abstract', 'srs', 'ppt', 'report', 'plagiarism'], required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
  feedback: String,
  marks: Number,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
});

module.exports = mongoose.model('ProjectDocument', ProjectDocumentSchema);
