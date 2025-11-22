const mongoose = require('mongoose');

/**
 * Notification Schema - Enhanced for real-time alerts
 * Supports attendance alerts, assignment reminders, and announcements
 */
const NotificationSchema = new mongoose.Schema({
  // Recipient targeting
  targetType: {
    type: String,
    enum: ['all', 'student', 'teacher', 'admin', 'department', 'section', 'individual'],
    required: true
  },
  targetIds: [{ type: mongoose.Schema.Types.ObjectId }], // Specific user IDs
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  
  // Notification content
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Notification type
  type: {
    type: String,
    enum: [
      'announcement',      // General announcements
      'attendance_alert',  // Low attendance warning
      'attendance_period', // Period start notification
      'assignment',        // Assignment related
      'exam',             // Exam notifications
      'result',           // Result announcements
      'remark',           // New remark added
      'achievement',      // Achievement approval
      'system'            // System notifications
    ],
    default: 'announcement'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Action button (optional)
  actionUrl: { type: String },
  actionText: { type: String },
  
  // Additional data (for specific notification types)
  metadata: {
    studentId: { type: mongoose.Schema.Types.ObjectId },
    attendancePercentage: { type: Number },
    subject: { type: String },
    period: { type: String },
    dueDate: { type: Date }
  },
  
  // Creator info
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdByModel: {
    type: String,
    enum: ['Admin', 'Teacher', 'System'],
    default: 'Admin'
  },
  
  // Read tracking
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId },
    readAt: { type: Date, default: Date.now }
  }],
  
  // Scheduling
  scheduledFor: { type: Date }, // For future notifications
  expiresAt: { type: Date },    // Auto-delete after this date
  
  // Status
  isActive: { type: Boolean, default: true },
  isSent: { type: Boolean, default: false },
  sentAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
NotificationSchema.index({ targetType: 1, isActive: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ type: 1, priority: 1 });
NotificationSchema.index({ scheduledFor: 1, isSent: 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ 'readBy.userId': 1 });

// Pre-save hook
NotificationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to mark as read by a user
NotificationSchema.methods.markAsRead = function(userId) {
  const alreadyRead = this.readBy.some(r => r.userId.toString() === userId.toString());
  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() });
  }
  return this.save();
};

// Static method to get unread count for a user
NotificationSchema.statics.getUnreadCount = async function(userId, userRole) {
  const query = {
    isActive: true,
    'readBy.userId': { $ne: userId }
  };
  
  // Filter based on user role and targeting
  if (userRole === 'student') {
    query.$or = [
      { targetType: 'all' },
      { targetType: 'student' },
      { targetIds: userId }
    ];
  } else if (userRole === 'teacher') {
    query.$or = [
      { targetType: 'all' },
      { targetType: 'teacher' },
      { targetIds: userId }
    ];
  } else if (userRole === 'admin') {
    query.$or = [
      { targetType: 'all' },
      { targetType: 'admin' },
      { targetIds: userId }
    ];
  }
  
  return await this.countDocuments(query);
};

// Static method to get notifications for a user
NotificationSchema.statics.getForUser = async function(userId, userRole, options = {}) {
  const { page = 1, limit = 20, unreadOnly = false } = options;
  
  const query = {
    isActive: true,
    $or: []
  };
  
  // Build targeting query
  if (userRole === 'student') {
    query.$or = [
      { targetType: 'all' },
      { targetType: 'student' },
      { targetIds: userId }
    ];
  } else if (userRole === 'teacher') {
    query.$or = [
      { targetType: 'all' },
      { targetType: 'teacher' },
      { targetIds: userId }
    ];
  } else if (userRole === 'admin') {
    // Admins see everything
    delete query.$or;
  }
  
  // Filter unread only
  if (unreadOnly) {
    query['readBy.userId'] = { $ne: userId };
  }
  
  const skip = (page - 1) * limit;
  
  const notifications = await this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  const total = await this.countDocuments(query);
  
  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to create attendance alert
NotificationSchema.statics.createAttendanceAlert = async function(studentId, attendancePercentage, createdBy) {
  let message, priority;
  
  if (attendancePercentage < 50) {
    priority = 'urgent';
    message = `Critical: Your attendance has dropped to ${attendancePercentage.toFixed(1)}%. Immediate action required.`;
  } else if (attendancePercentage < 65) {
    priority = 'high';
    message = `Warning: Your attendance is ${attendancePercentage.toFixed(1)}%, which is below the minimum requirement of 75%.`;
  } else if (attendancePercentage < 75) {
    priority = 'medium';
    message = `Notice: Your attendance is ${attendancePercentage.toFixed(1)}%. Please maintain regular attendance.`;
  } else {
    return null; // No alert needed
  }
  
  return await this.create({
    targetType: 'individual',
    targetIds: [studentId],
    title: 'Attendance Alert',
    message,
    type: 'attendance_alert',
    priority,
    metadata: {
      studentId,
      attendancePercentage
    },
    createdBy,
    createdByModel: 'System',
    isSent: true,
    sentAt: new Date()
  });
};

// Static method to create period start notification
NotificationSchema.statics.createPeriodStartNotification = async function(teacherId, subject, period, section) {
  return await this.create({
    targetType: 'individual',
    targetIds: [teacherId],
    title: 'Class Starting Soon',
    message: `Your ${subject} class for ${section} (${period}) is starting in 5 minutes.`,
    type: 'attendance_period',
    priority: 'high',
    metadata: {
      subject,
      period
    },
    actionUrl: '/teacher/attendance',
    actionText: 'Mark Attendance',
    createdBy: teacherId,
    createdByModel: 'System',
    isSent: true,
    sentAt: new Date(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // Expires in 1 hour
  });
};

module.exports = mongoose.model('NotificationEnhanced', NotificationSchema, 'notifications');
