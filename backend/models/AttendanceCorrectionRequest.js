const mongoose = require('mongoose');

/**
 * AttendanceCorrectionRequest Model
 * 
 * Allows students to request corrections to their attendance records
 * Provides a formal workflow for handling attendance disputes
 */
const AttendanceCorrectionRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  
  // The attendance record being disputed
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    required: true
  },
  
  // Class details
  section: {
    type: String,
    required: true
  },
  
  subject: {
    type: String,
    required: true
  },
  
  date: {
    type: Date,
    required: true
  },
  
  time: {
    type: String,
    required: true
  },
  
  // Current status in attendance record
  currentStatus: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  
  // Requested status
  requestedStatus: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  
  // Student's explanation
  reason: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Supporting proof (optional)
  proofUrl: {
    type: String,
    default: ''
  },
  
  cloudinaryPublicId: {
    type: String
  },
  
  // Request status
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'],
    default: 'PENDING',
    index: true
  },
  
  // Review information
  reviewedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    userType: {
      type: String,
      enum: ['admin', 'teacher']
    },
    userName: String
  },
  
  reviewDate: Date,
  
  reviewComments: {
    type: String,
    maxlength: 500
  },
  
  // Request metadata
  requestedAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
AttendanceCorrectionRequestSchema.index({ studentId: 1, status: 1, requestedAt: -1 });
AttendanceCorrectionRequestSchema.index({ section: 1, subject: 1, date: 1 });

// Update timestamp before save
AttendanceCorrectionRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get pending requests for a teacher/section
AttendanceCorrectionRequestSchema.statics.getPendingForSection = async function(section, limit = 50) {
  return await this.find({
    section,
    status: 'PENDING'
  })
    .populate('studentId', 'name rollNumber imageURL')
    .sort({ requestedAt: -1 })
    .limit(limit);
};

// Static method to get student's correction history
AttendanceCorrectionRequestSchema.statics.getStudentHistory = async function(studentId, limit = 20) {
  return await this.find({ studentId })
    .sort({ requestedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('AttendanceCorrectionRequest', AttendanceCorrectionRequestSchema);
