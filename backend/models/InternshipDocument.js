const mongoose = require('mongoose');

const InternshipDocumentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'InternshipBatch' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'InternshipCompany' },
  type: { type: String, enum: ['offerLetter', 'noc'], required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
});

module.exports = mongoose.model('InternshipDocument', InternshipDocumentSchema);
