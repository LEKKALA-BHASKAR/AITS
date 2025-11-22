const mongoose = require('mongoose');

/**
 * AuditLog Model - Tracks all attendance-related changes for compliance
 * 
 * This model ensures transparency and prevents misuse by recording:
 * - Who made the change
 * - What was changed
 * - When it was changed
 * - Why it was changed (for HOD overrides)
 * - Before and after values
 */
const AuditLogSchema = new mongoose.Schema({
  // What action was performed
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'OVERRIDE', 'LOCK', 'UNLOCK', 'CORRECTION_REQUEST', 'CORRECTION_APPROVED', 'CORRECTION_REJECTED'],
    required: true
  },
  
  // What entity was affected
  entityType: {
    type: String,
    enum: ['ATTENDANCE', 'TIMETABLE', 'LEAVE', 'SUBSTITUTE'],
    required: true,
    default: 'ATTENDANCE'
  },
  
  // Reference to the affected entity
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Who performed the action
  performedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userType: { 
      type: String, 
      enum: ['admin', 'teacher', 'student'],
      required: true 
    },
    userName: { type: String, required: true }
  },
  
  // Context information
  context: {
    section: String,
    subject: String,
    date: Date,
    time: String,
    studentId: mongoose.Schema.Types.ObjectId
  },
  
  // What changed
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  
  // Reason for change (mandatory for HOD overrides)
  reason: {
    type: String,
    default: ''
  },
  
  // IP address for security tracking
  ipAddress: String,
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient querying
AuditLogSchema.index({ entityId: 1, timestamp: -1 });
AuditLogSchema.index({ 'performedBy.userId': 1, timestamp: -1 });
AuditLogSchema.index({ 'context.section': 1, 'context.date': 1 });
AuditLogSchema.index({ entityType: 1, action: 1, timestamp: -1 });

// Static method to create audit log
AuditLogSchema.statics.log = async function(logData) {
  try {
    return await this.create(logData);
  } catch (error) {
    // Log to console but don't throw - audit logging should not break the main flow
    console.error('Audit log creation failed:', error.message);
    return null;
  }
};

// Static method to get audit trail for an entity
AuditLogSchema.statics.getTrail = async function(entityId, limit = 50) {
  return await this.find({ entityId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get user's audit history
AuditLogSchema.statics.getUserHistory = async function(userId, limit = 100) {
  return await this.find({ 'performedBy.userId': userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get section audit logs
AuditLogSchema.statics.getSectionLogs = async function(section, startDate, endDate, limit = 200) {
  const query = { 'context.section': section };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);
