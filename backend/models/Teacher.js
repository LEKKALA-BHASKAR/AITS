const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  imageURL: { type: String, default: '' },
  subjects: [String],
  assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  experience: { type: Number, default: 0 },
  designation: String,
  phone: String,
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teacher', TeacherSchema);
