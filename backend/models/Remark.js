const mongoose = require('mongoose');

/**
 * Enhanced Remark Model for Student Behavior & Performance Tracking
 * Supports comprehensive behavior management with severity levels and categories
 */
const RemarkSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true,
    index: true 
  },
  
  // Who added the remark
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    required: true,
    enum: ['Teacher', 'Admin']
  },
  createdByName: { type: String, required: true },
  
  // Remark details
  title: { type: String, required: true }, // Brief summary
  description: { type: String, required: true }, // Detailed description
  
  // Categorization
  type: { 
    type: String, 
    enum: ['positive', 'negative', 'neutral'],
    required: true 
  },
  
  category: {
    type: String,
    enum: [
      'academic',           // Academic performance
      'behavior',           // General behavior
      'discipline',         // Disciplinary issues
      'attendance',         // Attendance related
      'achievement',        // Awards, competitions, achievements
      'counseling',         // Counseling notes
      'warning',            // Official warnings
      'incident',           // Specific incidents
      'improvement',        // Progress and improvements
      'participation',      // Class/event participation
      'leadership',         // Leadership qualities
      'other'
    ],
    required: true
  },
  
  // Severity for negative remarks
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: function() {
      return this.type === 'negative' ? 'medium' : 'low';
    }
  },
  
  // Impact on risk score (calculated)
  riskImpact: {
    type: Number,
    default: function() {
      if (this.type === 'positive') return -5; // Reduces risk
      if (this.type === 'negative') {
        switch(this.severity) {
          case 'critical': return 20;
          case 'high': return 15;
          case 'medium': return 10;
          case 'low': return 5;
          default: return 0;
        }
      }
      return 0; // Neutral has no impact
    }
  },
  
  // Action taken (if any)
  actionTaken: { type: String },
  
  // Follow-up required
  requiresFollowUp: { type: Boolean, default: false },
  followUpDate: { type: Date },
  followUpCompleted: { type: Boolean, default: false },
  followUpNotes: { type: String },
  
  // Visibility and status
  isVisible: { type: Boolean, default: true }, // Can be hidden
  isResolved: { type: Boolean, default: false }, // For incidents/warnings
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId },
  resolutionNotes: { type: String },
  
  // Attachments (if any)
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Metadata
  tags: [String], // Custom tags for filtering
  academicYear: { type: String }, // e.g., "2024-2025"
  semester: { type: Number },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
RemarkSchema.index({ studentId: 1, createdAt: -1 });
RemarkSchema.index({ studentId: 1, type: 1 });
RemarkSchema.index({ studentId: 1, category: 1 });
RemarkSchema.index({ createdBy: 1, createdAt: -1 });
RemarkSchema.index({ type: 1, severity: 1 });

// Pre-save hook to update timestamp
RemarkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get student's behavior summary
RemarkSchema.statics.getStudentSummary = async function(studentId) {
  const remarks = await this.find({ studentId, isVisible: true });
  
  return {
    total: remarks.length,
    positive: remarks.filter(r => r.type === 'positive').length,
    negative: remarks.filter(r => r.type === 'negative').length,
    neutral: remarks.filter(r => r.type === 'neutral').length,
    unresolved: remarks.filter(r => !r.isResolved && (r.type === 'negative' || r.requiresFollowUp)).length,
    riskScore: remarks.reduce((sum, r) => sum + (r.riskImpact || 0), 0),
    byCategory: remarks.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {}),
    bySeverity: remarks.filter(r => r.type === 'negative').reduce((acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    }, {})
  };
};

// Static method to get timeline
RemarkSchema.statics.getTimeline = async function(studentId, options = {}) {
  const query = { studentId, isVisible: true };
  
  if (options.type) query.type = options.type;
  if (options.category) query.category = options.category;
  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
    if (options.endDate) query.createdAt.$lte = new Date(options.endDate);
  }
  
  return this.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 100);
};

// Method to calculate individual remark's display color
RemarkSchema.methods.getDisplayColor = function() {
  if (this.type === 'positive') return 'green';
  if (this.type === 'neutral') return 'blue';
  if (this.type === 'negative') {
    switch(this.severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'amber';
      default: return 'gray';
    }
  }
  return 'gray';
};

module.exports = mongoose.model('Remark', RemarkSchema);
