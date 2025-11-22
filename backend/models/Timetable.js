const mongoose = require('mongoose');

// Individual slot schema
const SlotSchema = new mongoose.Schema({
  time: { type: String, required: true }, // e.g., "9-10"
  startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true }, // e.g., "10:00"
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
}, { _id: false });

// Main timetable schema - one document per section
const TimetableSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true }, // e.g., "CSE-A"
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  department: { type: String }, // e.g., "CSE"
  schedule: {
    MON: [SlotSchema],
    TUE: [SlotSchema],
    WED: [SlotSchema],
    THU: [SlotSchema],
    FRI: [SlotSchema],
    SAT: [SlotSchema],
    SUN: [SlotSchema]
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for faster lookups
TimetableSchema.index({ section: 1, isActive: 1 });

// Update the updatedAt timestamp before saving
TimetableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get schedule for a specific day
TimetableSchema.methods.getScheduleForDay = function(day) {
  return this.schedule[day.toUpperCase()] || [];
};

// Method to get current slot based on current time
TimetableSchema.methods.getCurrentSlot = function(day) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const daySchedule = this.getScheduleForDay(day);
  
  for (const slot of daySchedule) {
    if (currentTime >= slot.startTime && currentTime < slot.endTime) {
      return slot;
    }
  }
  
  return null;
};

// Static method to get timetable by section name
TimetableSchema.statics.findBySection = function(sectionName) {
  return this.findOne({ section: sectionName, isActive: true });
};

module.exports = mongoose.model('Timetable', TimetableSchema);
