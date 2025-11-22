const mongoose = require('mongoose');

/**
 * SubstituteTeacher Model - Manages substitute teacher assignments
 * 
 * When a teacher is absent, this tracks who takes their classes
 */
const SubstituteTeacherSchema = new mongoose.Schema({
  // Original teacher who is absent
  originalTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    index: true
  },
  
  // Substitute teacher taking the class
  substituteTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  
  // Class details
  section: {
    type: String,
    required: true
  },
  
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  
  subject: {
    type: String,
    required: true
  },
  
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  time: {
    type: String,
    required: true
  },
  
  startTime: {
    type: String,
    required: true
  },
  
  endTime: {
    type: String,
    required: true
  },
  
  day: {
    type: String,
    required: true
  },
  
  reason: {
    type: String,
    default: ''
  },
  
  // Who assigned the substitute
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Was attendance marked?
  attendanceMarked: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
SubstituteTeacherSchema.index({ section: 1, date: 1, time: 1 });
SubstituteTeacherSchema.index({ substituteTeacherId: 1, date: 1 });

// Static method to get substitute for a specific slot
SubstituteTeacherSchema.statics.getSubstituteForSlot = async function(section, date, time) {
  const substituteDate = new Date(date);
  substituteDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(substituteDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return await this.findOne({
    section,
    time,
    date: { $gte: substituteDate, $lt: nextDay },
    status: { $in: ['CONFIRMED', 'PENDING'] }
  })
  .populate('originalTeacherId', 'name')
  .populate('substituteTeacherId', 'name');
};

// Static method to get substitute teacher's assignments
SubstituteTeacherSchema.statics.getTeacherSubstitutions = async function(teacherId, date) {
  const queryDate = new Date(date || new Date());
  queryDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(queryDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  return await this.find({
    substituteTeacherId: teacherId,
    date: { $gte: queryDate, $lt: nextDay },
    status: { $ne: 'CANCELLED' }
  })
  .populate('originalTeacherId', 'name')
  .populate('sectionId', 'name')
  .sort({ startTime: 1 });
};

module.exports = mongoose.model('SubstituteTeacher', SubstituteTeacherSchema);
