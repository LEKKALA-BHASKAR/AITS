const mongoose = require('mongoose');

const CertificateApprovalSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['academic', 'sports', 'cultural', 'technical', 'other'], 
    default: 'other' 
  },
  certificateURL: { type: String, required: true },
  publicId: { type: String }, // Cloudinary public ID for deletion
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'reviewerModel' },
  reviewerModel: { type: String, enum: ['Admin', 'Teacher'] },
  reviewDate: { type: Date },
  reviewComments: { type: String },
  approvalLevel: { 
    type: String, 
    enum: ['teacher', 'admin'], 
    default: 'teacher' 
  }
});

// Index for faster queries
CertificateApprovalSchema.index({ studentId: 1, status: 1 });
CertificateApprovalSchema.index({ status: 1, uploadDate: -1 });

module.exports = mongoose.model('CertificateApproval', CertificateApprovalSchema);
