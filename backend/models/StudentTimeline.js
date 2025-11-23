const mongoose = require('mongoose');

/**
 * StudentTimeline Model - Chronological feed of all student events
 * Comprehensive timeline tracking every student event for monitoring
 */
const StudentTimelineSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  
  // Event details
  eventType: {
    type: String,
    enum: [
      'attendance_marked',
      'attendance_updated',
      'marks_added',
      'marks_updated',
      'remark_added',
      'behavior_logged',
      'certificate_uploaded',
      'certificate_approved',
      'certificate_rejected',
      'activity_recorded',
      'assignment_submitted',
      'assignment_late',
      'exam_attempted',
      'warning_issued',
      'counseling_scheduled',
      'counseling_completed',
      'section_transferred',
      'achievement_earned',
      'event_participated',
      'seminar_attended',
      'competition_participated',
      'teacher_note_added',
      'weekly_report_generated',
      'alert_triggered',
      'risk_level_changed',
      'monitoring_score_updated',
      'leave_requested',
      'leave_approved',
      'leave_rejected',
      'profile_updated',
      'other'
    ],
    required: true,
    index: true
  },
  
  // Event metadata
  title: { type: String, required: true },
  description: { type: String },
  
  // Timestamp
  timestamp: { 
    type: Date, 
    required: true,
    default: Date.now,
    index: true
  },
  
  // Context
  context: {
    subject: String,
    section: String,
    course: String,
    semester: Number,
    academicYear: String
  },
  
  // Related entity
  relatedTo: {
    entityType: String, // e.g., 'Attendance', 'Remark', 'Certificate'
    entityId: mongoose.Schema.Types.ObjectId,
    entityData: mongoose.Schema.Types.Mixed
  },
  
  // Who triggered this event
  triggeredBy: {
    userId: { type: mongoose.Schema.Types.ObjectId },
    userName: String,
    userType: { type: String, enum: ['student', 'teacher', 'admin', 'system'] },
  },
  
  // Impact on student
  impact: {
    type: String,
    enum: ['positive', 'negative', 'neutral', 'critical'],
    default: 'neutral'
  },
  
  // Severity/Priority
  severity: {
    type: String,
    enum: ['info', 'warning', 'alert', 'critical'],
    default: 'info'
  },
  
  // Visual indicator
  icon: { type: String }, // Icon name for UI
  color: { type: String }, // Color code for UI
  
  // Visibility
  isVisible: { type: Boolean, default: true },
  visibleTo: [{
    type: String,
    enum: ['student', 'teacher', 'admin', 'parent']
  }],
  
  // Tags for filtering
  tags: [String],
  
  // Attachments
  attachments: [{
    url: String,
    type: String,
    filename: String
  }],
  
  // Additional data
  metadata: mongoose.Schema.Types.Mixed,
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes for efficient querying
StudentTimelineSchema.index({ studentId: 1, timestamp: -1 });
StudentTimelineSchema.index({ studentId: 1, eventType: 1, timestamp: -1 });
StudentTimelineSchema.index({ eventType: 1, timestamp: -1 });
StudentTimelineSchema.index({ 'triggeredBy.userId': 1, timestamp: -1 });
StudentTimelineSchema.index({ tags: 1 });

// Static method to add timeline event
StudentTimelineSchema.statics.addEvent = async function(eventData) {
  try {
    // Set default visibility based on event type
    if (!eventData.visibleTo) {
      switch (eventData.eventType) {
        case 'teacher_note_added':
          eventData.visibleTo = ['teacher', 'admin'];
          break;
        case 'counseling_scheduled':
        case 'counseling_completed':
          eventData.visibleTo = ['teacher', 'admin', 'student'];
          break;
        case 'warning_issued':
        case 'alert_triggered':
          eventData.visibleTo = ['teacher', 'admin', 'student', 'parent'];
          break;
        default:
          eventData.visibleTo = ['teacher', 'admin', 'student'];
      }
    }
    
    // Set icon and color based on event type
    if (!eventData.icon || !eventData.color) {
      const eventConfig = this.getEventConfig(eventData.eventType);
      eventData.icon = eventData.icon || eventConfig.icon;
      eventData.color = eventData.color || eventConfig.color;
    }
    
    return await this.create(eventData);
  } catch (error) {
    console.error('Timeline event creation failed:', error.message);
    return null;
  }
};

// Static method to get event configuration
StudentTimelineSchema.statics.getEventConfig = function(eventType) {
  const configs = {
    attendance_marked: { icon: 'check-circle', color: 'green' },
    attendance_updated: { icon: 'edit', color: 'blue' },
    marks_added: { icon: 'award', color: 'purple' },
    marks_updated: { icon: 'edit', color: 'blue' },
    remark_added: { icon: 'message-square', color: 'orange' },
    behavior_logged: { icon: 'activity', color: 'yellow' },
    certificate_uploaded: { icon: 'upload', color: 'blue' },
    certificate_approved: { icon: 'check-circle', color: 'green' },
    certificate_rejected: { icon: 'x-circle', color: 'red' },
    warning_issued: { icon: 'alert-triangle', color: 'red' },
    achievement_earned: { icon: 'trophy', color: 'gold' },
    risk_level_changed: { icon: 'alert-octagon', color: 'red' },
    monitoring_score_updated: { icon: 'trending-up', color: 'blue' }
  };
  
  return configs[eventType] || { icon: 'circle', color: 'gray' };
};

// Static method to get student timeline with filters
StudentTimelineSchema.statics.getTimeline = async function(studentId, options = {}) {
  const query = { studentId, isVisible: true };
  
  // Apply filters
  if (options.eventType) {
    if (Array.isArray(options.eventType)) {
      query.eventType = { $in: options.eventType };
    } else {
      query.eventType = options.eventType;
    }
  }
  
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    if (options.startDate) query.timestamp.$gte = new Date(options.startDate);
    if (options.endDate) query.timestamp.$lte = new Date(options.endDate);
  }
  
  if (options.impact) query.impact = options.impact;
  if (options.severity) query.severity = options.severity;
  if (options.tags && options.tags.length > 0) query.tags = { $in: options.tags };
  
  // Visibility filter
  if (options.viewerRole) {
    query.visibleTo = options.viewerRole;
  }
  
  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .skip(options.skip || 0);
};

// Static method to get timeline summary
StudentTimelineSchema.statics.getTimelineSummary = async function(studentId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const events = await this.find({
    studentId,
    timestamp: { $gte: startDate, $lte: endDate }
  });
  
  const summary = {
    total: events.length,
    byType: {},
    byImpact: { positive: 0, negative: 0, neutral: 0, critical: 0 },
    bySeverity: { info: 0, warning: 0, alert: 0, critical: 0 },
    recentEvents: events.slice(0, 10)
  };
  
  events.forEach(event => {
    summary.byType[event.eventType] = (summary.byType[event.eventType] || 0) + 1;
    summary.byImpact[event.impact]++;
    summary.bySeverity[event.severity]++;
  });
  
  return summary;
};

module.exports = mongoose.model('StudentTimeline', StudentTimelineSchema);
