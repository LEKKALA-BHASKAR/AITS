const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  adminId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  departmentAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  role: { type: String, enum: ['super_admin', 'department_admin'], default: 'department_admin' },
  imageURL: { type: String, default: '' },
  cloudinaryPublicId: { type: String },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', AdminSchema);
