const mongoose = require('mongoose');

/**
 * TeacherNote Model - Private faculty collaboration notes
 * Allows teachers to share private observations about students
 */
const TeacherNoteSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  
  // Who created the note
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher',
    required: true
  },
  createdByName: { type: String, required: true },
  
  // Note details
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  // Categorization
  category: {
    type: String,
    enum: [
      'academic_observation',
      'behavior_concern',
      'strength_identified',
      'intervention_needed',
      'improvement_noted',
      'parent_contact',
      'counseling_recommendation',
      'special_attention',
      'peer_issues',
      'health_concern',
      'general_observation',
      'other'
    ],
    required: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Visibility - faculty only
  isPrivate: { type: Boolean, default: true },
  
  // Tags for filtering
  tags: [String],
  
  // Collaboration
  sharedWith: [{
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    teacherName: String,
    sharedAt: { type: Date, default: Date.now }
  }],
  
  // Follow-up
  requiresFollowUp: { type: Boolean, default: false },
  followUpDate: { type: Date },
  followUpCompleted: { type: Boolean, default: false },
  followUpNotes: { type: String },
  
  // Responses from other teachers
  responses: [{
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    teacherName: String,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Attachments
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'resolved', 'archived'],
    default: 'active'
  },
  
  // Metadata
  academicYear: { type: String },
  semester: { type: Number },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
TeacherNoteSchema.index({ studentId: 1, createdAt: -1 });
TeacherNoteSchema.index({ createdBy: 1, createdAt: -1 });
TeacherNoteSchema.index({ category: 1, priority: 1 });

// Pre-save hook
TeacherNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add response
TeacherNoteSchema.methods.addResponse = function(teacherId, teacherName, comment) {
  this.responses.push({
    teacherId,
    teacherName,
    comment,
    createdAt: new Date()
  });
  this.updatedAt = new Date();
};

// Method to share with teacher
TeacherNoteSchema.methods.shareWith = function(teacherId, teacherName) {
  // Check if already shared
  const alreadyShared = this.sharedWith.some(s => s.teacherId.equals(teacherId));
  
  if (!alreadyShared) {
    this.sharedWith.push({
      teacherId,
      teacherName,
      sharedAt: new Date()
    });
    this.updatedAt = new Date();
  }
};

// Static method to get notes for student
TeacherNoteSchema.statics.getStudentNotes = async function(studentId, teacherId) {
  return await this.find({
    studentId,
    $or: [
      { createdBy: teacherId },
      { 'sharedWith.teacherId': teacherId },
      { isPrivate: false }
    ]
  })
  .populate('createdBy', 'name email')
  .sort({ createdAt: -1 });
};

// Static method to get notes requiring follow-up
TeacherNoteSchema.statics.getPendingFollowUps = async function(teacherId) {
  const today = new Date();
  
  return await this.find({
    $or: [
      { createdBy: teacherId },
      { 'sharedWith.teacherId': teacherId }
    ],
    requiresFollowUp: true,
    followUpCompleted: false,
    followUpDate: { $lte: today }
  })
  .populate('studentId', 'name rollNumber')
  .sort({ followUpDate: 1 });
};

// Static method to get high priority notes
TeacherNoteSchema.statics.getHighPriorityNotes = async function(teacherId) {
  return await this.find({
    $or: [
      { createdBy: teacherId },
      { 'sharedWith.teacherId': teacherId }
    ],
    priority: { $in: ['high', 'urgent'] },
    status: 'active'
  })
  .populate('studentId', 'name rollNumber')
  .sort({ priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('TeacherNote', TeacherNoteSchema);
