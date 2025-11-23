const mongoose = require('mongoose');

/**
 * WeeklyReport Model - Auto-generated comprehensive weekly reports
 * Stores generated reports for students with all monitoring data
 */
const WeeklyReportSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  
  // Report period
  weekStartDate: { type: Date, required: true },
  weekEndDate: { type: Date, required: true },
  weekNumber: { type: Number },
  academicYear: { type: String },
  semester: { type: Number },
  
  // Summary data
  summary: {
    overallScore: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    attendancePercentage: { type: Number },
    averageMarks: { type: Number },
    behaviorScore: { type: Number },
    activitiesCount: { type: Number },
    remarksCount: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 }
    }
  },
  
  // Detailed sections
  attendance: {
    totalClasses: { type: Number, default: 0 },
    attended: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    percentage: { type: Number },
    subjectWise: [{
      subject: String,
      total: Number,
      attended: Number,
      percentage: Number
    }]
  },
  
  academic: {
    exams: [{
      name: String,
      subject: String,
      marks: Number,
      maxMarks: Number,
      percentage: Number
    }],
    assignments: [{
      title: String,
      subject: String,
      status: String,
      submittedOn: Date
    }],
    averagePerformance: { type: Number }
  },
  
  behavior: {
    logs: [{
      date: Date,
      type: String,
      description: String,
      score: Number
    }],
    patterns: {
      lateArrivals: { type: Number, default: 0 },
      earlyExits: { type: Number, default: 0 },
      disruptiveBehavior: { type: Number, default: 0 },
      positiveParticipation: { type: Number, default: 0 }
    }
  },
  
  activities: {
    list: [{
      type: String,
      name: String,
      date: Date,
      points: Number
    }],
    totalPoints: { type: Number, default: 0 }
  },
  
  remarks: {
    all: [{
      type: String,
      category: String,
      description: String,
      date: Date,
      by: String
    }],
    summary: String
  },
  
  // Risk alerts
  alerts: [{
    type: String,
    severity: String,
    message: String,
    timestamp: Date
  }],
  
  // Improvement suggestions
  suggestions: [String],
  
  // Areas of concern
  concerns: [String],
  
  // Strengths
  strengths: [String],
  
  // PDF generation
  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },
  pdfCloudinaryId: { type: String },
  
  // Email delivery
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  emailRecipients: [String],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'generated', 'sent', 'archived'],
    default: 'draft'
  },
  
  // Generation metadata
  generatedBy: { type: String, default: 'system' },
  generatedAt: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
WeeklyReportSchema.index({ studentId: 1, weekStartDate: -1 });
WeeklyReportSchema.index({ weekStartDate: 1, weekEndDate: 1 });
WeeklyReportSchema.index({ status: 1, emailSent: 1 });

// Pre-save hook
WeeklyReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to generate suggestions based on data
WeeklyReportSchema.methods.generateSuggestions = function() {
  const suggestions = [];
  
  // Attendance-based suggestions
  if (this.summary.attendancePercentage < 75) {
    suggestions.push('Focus on improving attendance. Current attendance is below the required 75%.');
  }
  
  // Academic suggestions
  if (this.summary.averageMarks < 50) {
    suggestions.push('Academic performance needs improvement. Consider seeking help from teachers or peers.');
  }
  
  // Behavior suggestions
  if (this.summary.remarksCount.negative > 3) {
    suggestions.push('Multiple negative remarks this week. Please meet with your mentor or counselor.');
  }
  
  // Activity suggestions
  if (this.summary.activitiesCount === 0) {
    suggestions.push('No extracurricular activities recorded. Consider participating in events or clubs.');
  }
  
  // Risk level suggestions
  if (this.summary.riskLevel === 'critical' || this.summary.riskLevel === 'high') {
    suggestions.push('You are flagged as at-risk. Please contact your counselor immediately.');
  }
  
  this.suggestions = suggestions;
  return suggestions;
};

// Method to identify concerns
WeeklyReportSchema.methods.identifyConcerns = function() {
  const concerns = [];
  
  if (this.behavior.patterns.lateArrivals > 2) {
    concerns.push('Consistent late arrivals to classes');
  }
  
  if (this.behavior.patterns.disruptiveBehavior > 0) {
    concerns.push('Disruptive behavior reported in class');
  }
  
  if (this.attendance.percentage < 65) {
    concerns.push('Critically low attendance percentage');
  }
  
  if (this.summary.remarksCount.negative > this.summary.remarksCount.positive) {
    concerns.push('More negative remarks than positive ones');
  }
  
  this.concerns = concerns;
  return concerns;
};

// Method to identify strengths
WeeklyReportSchema.methods.identifyStrengths = function() {
  const strengths = [];
  
  if (this.summary.attendancePercentage >= 90) {
    strengths.push('Excellent attendance record');
  }
  
  if (this.summary.averageMarks >= 70) {
    strengths.push('Strong academic performance');
  }
  
  if (this.summary.activitiesCount >= 3) {
    strengths.push('Active participation in extracurricular activities');
  }
  
  if (this.summary.remarksCount.positive >= 3) {
    strengths.push('Positive feedback from multiple teachers');
  }
  
  if (this.behavior.patterns.positiveParticipation >= 3) {
    strengths.push('Active classroom participation');
  }
  
  this.strengths = strengths;
  return strengths;
};

// Static method to get pending reports for email
WeeklyReportSchema.statics.getPendingEmails = async function() {
  return await this.find({
    status: 'generated',
    emailSent: false,
    pdfUrl: { $exists: true, $ne: null }
  })
  .populate('studentId', 'name email guardianName guardianPhone')
  .limit(50);
};

module.exports = mongoose.model('WeeklyReport', WeeklyReportSchema);
