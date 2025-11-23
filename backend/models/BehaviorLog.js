const mongoose = require('mongoose');

/**
 * BehaviorLog Model - Detailed behavior tracking for heatmap visualization
 * Tracks day-wise, subject-wise, and teacher-wise behavior patterns
 */
const BehaviorLogSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  
  // When did this behavior occur
  date: { 
    type: Date, 
    required: true,
    index: true 
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  timeSlot: { type: String }, // e.g., "09:00-10:00"
  
  // Context
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  subjectName: { type: String },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  teacherName: { type: String },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  
  // Behavior details
  behaviorType: {
    type: String,
    enum: [
      'excellent',
      'good',
      'average',
      'poor',
      'disruptive',
      'absent',
      'late',
      'early_exit',
      'bathroom_break',
      'distracted',
      'sleeping',
      'using_phone',
      'talking',
      'participation',
      'helping_others',
      'asking_doubts',
      'attentive',
      'inattentive'
    ],
    required: true
  },
  
  // Behavior score (-10 to +10)
  behaviorScore: {
    type: Number,
    min: -10,
    max: 10,
    default: 0
  },
  
  // Additional details
  description: { type: String },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Pattern flags
  isPattern: { type: Boolean, default: false }, // Set to true if part of a detected pattern
  patternType: { type: String }, // e.g., "consistent_late_arrival", "friday_absences"
  
  // Engagement level
  engagementLevel: {
    type: String,
    enum: ['high', 'medium', 'low', 'disruptive', 'none'],
    default: 'medium'
  },
  
  // Action taken
  actionTaken: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    enum: ['Teacher', 'Admin']
  }
});

// Indexes for efficient querying
BehaviorLogSchema.index({ studentId: 1, date: -1 });
BehaviorLogSchema.index({ studentId: 1, dayOfWeek: 1 });
BehaviorLogSchema.index({ studentId: 1, subjectName: 1 });
BehaviorLogSchema.index({ studentId: 1, teacherId: 1 });
BehaviorLogSchema.index({ date: 1, sectionId: 1 });

// Static method to get behavior heatmap data
BehaviorLogSchema.statics.getHeatmapData = async function(studentId, startDate, endDate) {
  const logs = await this.find({
    studentId,
    date: { $gte: startDate, $lte: endDate }
  });
  
  // Day-wise aggregation
  const dayWise = {};
  const subjectWise = {};
  const teacherWise = {};
  
  logs.forEach(log => {
    // Day-wise
    if (!dayWise[log.dayOfWeek]) {
      dayWise[log.dayOfWeek] = { count: 0, totalScore: 0, issues: 0 };
    }
    dayWise[log.dayOfWeek].count++;
    dayWise[log.dayOfWeek].totalScore += log.behaviorScore;
    if (log.behaviorScore < 0) dayWise[log.dayOfWeek].issues++;
    
    // Subject-wise
    if (log.subjectName) {
      if (!subjectWise[log.subjectName]) {
        subjectWise[log.subjectName] = { count: 0, totalScore: 0, issues: 0 };
      }
      subjectWise[log.subjectName].count++;
      subjectWise[log.subjectName].totalScore += log.behaviorScore;
      if (log.behaviorScore < 0) subjectWise[log.subjectName].issues++;
    }
    
    // Teacher-wise
    if (log.teacherName) {
      if (!teacherWise[log.teacherName]) {
        teacherWise[log.teacherName] = { count: 0, totalScore: 0, issues: 0 };
      }
      teacherWise[log.teacherName].count++;
      teacherWise[log.teacherName].totalScore += log.behaviorScore;
      if (log.behaviorScore < 0) teacherWise[log.teacherName].issues++;
    }
  });
  
  return { dayWise, subjectWise, teacherWise, totalLogs: logs.length };
};

// Static method to detect patterns
BehaviorLogSchema.statics.detectPatterns = async function(studentId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const logs = await this.find({
    studentId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  const patterns = {
    consistentLateArrival: 0,
    fridayAbsences: 0,
    earlyExits: 0,
    bathroomBreakFrequency: 0,
    subjectSpecificIssues: {},
    daySpecificIssues: {}
  };
  
  logs.forEach(log => {
    if (log.behaviorType === 'late') patterns.consistentLateArrival++;
    if (log.behaviorType === 'absent' && log.dayOfWeek === 'Friday') patterns.fridayAbsences++;
    if (log.behaviorType === 'early_exit') patterns.earlyExits++;
    if (log.behaviorType === 'bathroom_break') patterns.bathroomBreakFrequency++;
    
    if (log.behaviorScore < 0) {
      if (log.subjectName) {
        patterns.subjectSpecificIssues[log.subjectName] = 
          (patterns.subjectSpecificIssues[log.subjectName] || 0) + 1;
      }
      if (log.dayOfWeek) {
        patterns.daySpecificIssues[log.dayOfWeek] = 
          (patterns.daySpecificIssues[log.dayOfWeek] || 0) + 1;
      }
    }
  });
  
  return patterns;
};

module.exports = mongoose.model('BehaviorLog', BehaviorLogSchema);
