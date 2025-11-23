const mongoose = require('mongoose');

/**
 * StudentActivity Model - Comprehensive activity tracking
 * Tracks all student interactions and activities for monitoring
 */
const StudentActivitySchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  
  // Activity details
  activityType: {
    type: String,
    enum: [
      'login',
      'profile_update',
      'certificate_upload',
      'assignment_submission',
      'doubt_asked',
      'participation',
      'event_participation',
      'seminar_attendance',
      'competition_participation',
      'library_visit',
      'sports_participation',
      'club_activity',
      'workshop_attendance',
      'interaction_with_teacher',
      'peer_help',
      'study_group',
      'lab_work',
      'project_update',
      'exam_attempt',
      'resource_access',
      'forum_post',
      'quiz_attempt',
      'other'
    ],
    required: true
  },
  
  // Activity metadata
  activityName: { type: String },
  description: { type: String },
  
  // Context
  relatedTo: {
    type: String,
    enum: ['academic', 'extracurricular', 'administrative', 'social', 'skill_development']
  },
  
  // Points/Score for this activity
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Date and time
  date: { 
    type: Date, 
    required: true,
    default: Date.now,
    index: true
  },
  duration: { type: Number }, // in minutes
  
  // Location/context
  location: { type: String },
  platform: { type: String, enum: ['web', 'mobile', 'physical', 'other'], default: 'web' },
  
  // Achievement/outcome
  outcome: {
    type: String,
    enum: ['completed', 'in_progress', 'pending', 'failed', 'cancelled'],
    default: 'completed'
  },
  
  // Verification
  verifiedBy: { type: mongoose.Schema.Types.ObjectId },
  verifiedByModel: {
    type: String,
    enum: ['Teacher', 'Admin']
  },
  isVerified: { type: Boolean, default: false },
  
  // Attachments/proof
  attachments: [{
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Metadata
  tags: [String],
  academicYear: { type: String },
  semester: { type: Number },
  
  createdAt: { type: Date, default: Date.now }
});

// Indexes
StudentActivitySchema.index({ studentId: 1, date: -1 });
StudentActivitySchema.index({ studentId: 1, activityType: 1 });
StudentActivitySchema.index({ date: 1, activityType: 1 });

// Static method to get activity summary
StudentActivitySchema.statics.getActivitySummary = async function(studentId, startDate, endDate) {
  const activities = await this.find({
    studentId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  const summary = {
    total: activities.length,
    totalPoints: activities.reduce((sum, a) => sum + a.points, 0),
    byType: {},
    byCategory: {},
    verified: activities.filter(a => a.isVerified).length,
    recentActivities: activities.slice(-10).reverse()
  };
  
  activities.forEach(activity => {
    // By type
    summary.byType[activity.activityType] = 
      (summary.byType[activity.activityType] || 0) + 1;
    
    // By category
    if (activity.relatedTo) {
      summary.byCategory[activity.relatedTo] = 
        (summary.byCategory[activity.relatedTo] || 0) + 1;
    }
  });
  
  return summary;
};

// Static method to detect silent students (low activity)
StudentActivitySchema.statics.detectSilentStudents = async function(sectionId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  // Get all students and their activity counts
  const students = await mongoose.model('Student').find({ sectionId, isActive: true });
  const silentStudents = [];
  
  for (const student of students) {
    const activityCount = await this.countDocuments({
      studentId: student._id,
      date: { $gte: startDate, $lte: endDate },
      activityType: { $in: ['doubt_asked', 'participation', 'interaction_with_teacher'] }
    });
    
    if (activityCount === 0) {
      silentStudents.push({
        studentId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        activityCount,
        lastActivity: await this.findOne({ studentId: student._id })
          .sort({ date: -1 })
          .select('date activityType')
      });
    }
  }
  
  return silentStudents;
};

// Static method to get activity streak
StudentActivitySchema.statics.getActivityStreak = async function(studentId) {
  const activities = await this.find({ studentId })
    .sort({ date: -1 })
    .select('date');
  
  if (activities.length === 0) return { currentStreak: 0, longestStreak: 0 };
  
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < activities.length; i++) {
    const diff = Math.floor((activities[i-1].date - activities[i].date) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  // Calculate current streak from today
  const today = new Date();
  const daysSinceLastActivity = Math.floor((today - activities[0].date) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastActivity <= 1) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }
  
  return { currentStreak, longestStreak };
};

module.exports = mongoose.model('StudentActivity', StudentActivitySchema);
