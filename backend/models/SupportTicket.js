const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['attendance', 'marks', 'profile', 'technical', 'other'], 
    default: 'other' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'], 
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  responses: [{
    responderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'responderModel' },
    responderModel: { type: String, enum: ['Admin', 'Teacher'] },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

// Update timestamp on save
SupportTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
SupportTicketSchema.index({ studentId: 1, status: 1 });
SupportTicketSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);
