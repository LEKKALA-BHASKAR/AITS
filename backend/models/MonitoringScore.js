const mongoose = require('mongoose');

/**
 * MonitoringScore Model - Comprehensive 0-100 student monitoring score
 * Calculates composite score based on multiple factors
 */
const MonitoringScoreSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    unique: true,
    index: true 
  },
  
  // Overall monitoring score (0-100)
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
    required: true
  },
  
  // Component scores (each 0-100)
  components: {
    attendanceScore: { type: Number, min: 0, max: 100, default: 50 },
    academicScore: { type: Number, min: 0, max: 100, default: 50 },
    behaviorScore: { type: Number, min: 0, max: 100, default: 50 },
    activityScore: { type: Number, min: 0, max: 100, default: 50 },
    engagementScore: { type: Number, min: 0, max: 100, default: 50 },
    punctualityScore: { type: Number, min: 0, max: 100, default: 50 }
  },
  
  // Weights for each component (should sum to 1)
  weights: {
    attendance: { type: Number, default: 0.25 },
    academic: { type: Number, default: 0.30 },
    behavior: { type: Number, default: 0.20 },
    activity: { type: Number, default: 0.10 },
    engagement: { type: Number, default: 0.10 },
    punctuality: { type: Number, default: 0.05 }
  },
  
  // Risk level based on score
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Color coding
  colorCode: {
    type: String,
    enum: ['green', 'yellow', 'orange', 'red'],
    default: 'yellow'
  },
  
  // Trend analysis
  trend: {
    direction: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    change: { type: Number, default: 0 }, // Change from last calculation
    lastScore: { type: Number },
    improvement: { type: Boolean, default: false }
  },
  
  // Historical scores (last 10 calculations)
  history: [{
    score: Number,
    calculatedAt: Date,
    components: {
      attendanceScore: Number,
      academicScore: Number,
      behaviorScore: Number,
      activityScore: Number,
      engagementScore: Number,
      punctualityScore: Number
    }
  }],
  
  // Alerts and flags
  alerts: [{
    type: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Last calculation details
  lastCalculatedAt: { type: Date, default: Date.now },
  calculatedBy: { type: String, default: 'system' },
  
  // Metadata
  academicYear: { type: String },
  semester: { type: Number },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate risk level and color code
MonitoringScoreSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Determine risk level based on score
  if (this.overallScore >= 75) {
    this.riskLevel = 'low';
    this.colorCode = 'green';
  } else if (this.overallScore >= 60) {
    this.riskLevel = 'medium';
    this.colorCode = 'yellow';
  } else if (this.overallScore >= 40) {
    this.riskLevel = 'high';
    this.colorCode = 'orange';
  } else {
    this.riskLevel = 'critical';
    this.colorCode = 'red';
  }
  
  // Calculate trend
  if (this.history.length > 0) {
    const lastScore = this.history[this.history.length - 1].score;
    this.trend.change = this.overallScore - lastScore;
    this.trend.lastScore = lastScore;
    
    if (this.trend.change > 2) {
      this.trend.direction = 'up';
      this.trend.improvement = true;
    } else if (this.trend.change < -2) {
      this.trend.direction = 'down';
      this.trend.improvement = false;
    } else {
      this.trend.direction = 'stable';
      this.trend.improvement = this.trend.change >= 0;
    }
  }
  
  next();
});

// Method to calculate overall score
MonitoringScoreSchema.methods.calculateScore = function() {
  const { components, weights } = this;
  
  this.overallScore = Math.round(
    components.attendanceScore * weights.attendance +
    components.academicScore * weights.academic +
    components.behaviorScore * weights.behavior +
    components.activityScore * weights.activity +
    components.engagementScore * weights.engagement +
    components.punctualityScore * weights.punctuality
  );
  
  // Add to history (keep last 10)
  this.history.push({
    score: this.overallScore,
    calculatedAt: new Date(),
    components: { ...components }
  });
  
  if (this.history.length > 10) {
    this.history.shift();
  }
  
  this.lastCalculatedAt = new Date();
  
  return this.overallScore;
};

// Method to add alert
MonitoringScoreSchema.methods.addAlert = function(type, severity, message) {
  this.alerts.push({ type, severity, message, createdAt: new Date() });
  
  // Keep only last 20 alerts
  if (this.alerts.length > 20) {
    this.alerts.shift();
  }
};

// Static method to get students by risk level
MonitoringScoreSchema.statics.getByRiskLevel = async function(riskLevel, limit = 50) {
  return await this.find({ riskLevel })
    .populate('studentId', 'name rollNumber email imageURL')
    .sort({ overallScore: 1 })
    .limit(limit);
};

// Static method to get most improved students
MonitoringScoreSchema.statics.getMostImproved = async function(limit = 10) {
  return await this.find({ 'trend.improvement': true })
    .populate('studentId', 'name rollNumber email imageURL')
    .sort({ 'trend.change': -1 })
    .limit(limit);
};

// Static method to get declining students
MonitoringScoreSchema.statics.getDeclining = async function(limit = 10) {
  return await this.find({ 'trend.improvement': false, 'trend.change': { $lt: -5 } })
    .populate('studentId', 'name rollNumber email imageURL')
    .sort({ 'trend.change': 1 })
    .limit(limit);
};

module.exports = mongoose.model('MonitoringScore', MonitoringScoreSchema);
