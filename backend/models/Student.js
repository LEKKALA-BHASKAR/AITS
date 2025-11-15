const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  imageURL: { type: String, default: '' },
  cloudinaryPublicId: { type: String },
  phone: { type: String },
  guardianName: { type: String },
  guardianPhone: { type: String },
  attendance: [{
    subject: String,
    date: Date,
    status: { type: String, enum: ['present', 'absent', 'late'] }
  }],
  results: [{
    semester: Number,
    subject: String,
    marks: Number,
    grade: String,
    examType: String
  }],
  remarks: [{
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    remark: String,
    type: { type: String, enum: ['positive', 'negative', 'neutral'] },
    date: { type: Date, default: Date.now }
  }],
  achievements: [{
    title: String,
    description: String,
    certificateURL: String,
    date: Date
  }],
  certificates: [{
    title: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  backlogCount: { type: Number, default: 0 },
  atRisk: { type: Boolean, default: false },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', StudentSchema);
