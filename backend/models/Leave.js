const mongoose = require('mongoose');

/**
 * Leave Model - Enhanced for attendance calculation
 * Manages student duty leave and medical leave to ensure
 * attendance percentage is calculated correctly
 */
const LeaveSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['MEDICAL', 'DUTY', 'PERSONAL', 'EMERGENCY', 'Pending', 'Approved', 'Rejected'] // Keep old values for backward compatibility
  },
  reason: { type: String },
  startDate: { 
    type: Date, 
    required: true,
    index: true
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'PENDING', 'APPROVED', 'REJECTED'], 
    default: 'Pending',
    index: true
  },
  appliedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher' 
  },
  // New fields for enhanced functionality
  documentUrl: {
    type: String,
    default: ''
  },
  cloudinaryPublicId: {
    type: String
  },
  approvalDate: Date,
  rejectionReason: String,
  affectedSubjects: [{
    subject: String,
    date: Date,
    slot: String
  }]
});

// Compound index for date range queries
LeaveSchema.index({ student: 1, startDate: 1, endDate: 1 });

// Static method to check if student is on approved leave on a specific date
LeaveSchema.statics.isOnLeave = async function(studentId, date) {
  const leave = await this.findOne({
    student: studentId,
    status: { $in: ['Approved', 'APPROVED'] },
    startDate: { $lte: date },
    endDate: { $gte: date }
  });
  
  return !!leave;
};

// Static method to get pending leave requests
LeaveSchema.statics.getPendingRequests = async function(limit = 50) {
  return await this.find({ 
    status: { $in: ['Pending', 'PENDING'] } 
  })
    .populate('student', 'name rollNumber section')
    .sort({ appliedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Leave', LeaveSchema);
