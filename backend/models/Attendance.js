const mongoose = require('mongoose');

// Schema for individual student attendance in a session
const StudentAttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late'], 
    required: true 
  },
  markedAt: { type: Date, default: Date.now }
}, { _id: false });

// Main attendance schema - one document per class session
const AttendanceSchema = new mongoose.Schema({
  section: { type: String, required: true }, // e.g., "CSE-A"
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  date: { type: Date, required: true },
  day: { type: String, required: true }, // e.g., "MON"
  time: { type: String, required: true }, // e.g., "9-10"
  startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true }, // e.g., "10:00"
  students: [StudentAttendanceSchema],
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  isLocked: { type: Boolean, default: false }, // Lock after grace period
  createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate attendance for same session
AttendanceSchema.index({ section: 1, subject: 1, date: 1, time: 1 }, { unique: true });
AttendanceSchema.index({ sectionId: 1, date: 1 });
AttendanceSchema.index({ teacher: 1, date: 1 });

// Static method to check if attendance already exists
AttendanceSchema.statics.existsForSession = async function(section, subject, date, time) {
  const sessionDate = new Date(date);
  sessionDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(sessionDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const exists = await this.findOne({
    section,
    subject,
    time,
    date: {
      $gte: sessionDate,
      $lt: nextDay
    }
  });
  
  return !!exists;
};

// Static method to get student attendance by subject
AttendanceSchema.statics.getStudentAttendanceBySubject = async function(studentId, subject) {
  const records = await this.find({
    'students.studentId': studentId,
    subject
  }).select('date students subject');
  
  return records.map(record => {
    const studentRecord = record.students.find(s => s.studentId.toString() === studentId.toString());
    return {
      subject: record.subject,
      date: record.date,
      status: studentRecord ? studentRecord.status : 'absent'
    };
  });
};

// Static method to get all attendance for a student
AttendanceSchema.statics.getStudentAttendance = async function(studentId) {
  const records = await this.find({
    'students.studentId': studentId
  }).select('date students subject').sort({ date: -1 });
  
  return records.map(record => {
    const studentRecord = record.students.find(s => s.studentId.toString() === studentId.toString());
    return {
      subject: record.subject,
      date: record.date,
      status: studentRecord ? studentRecord.status : 'absent'
    };
  });
};

// Method to calculate attendance percentage for a subject
AttendanceSchema.statics.calculateSubjectPercentage = async function(studentId, subject) {
  const records = await this.getStudentAttendanceBySubject(studentId, subject);
  
  if (records.length === 0) {
    return { percentage: 0, present: 0, total: 0 };
  }
  
  const present = records.filter(r => r.status === 'present').length;
  const total = records.length;
  const percentage = ((present / total) * 100).toFixed(2);
  
  return { percentage, present, total };
};

module.exports = mongoose.model('Attendance', AttendanceSchema);
