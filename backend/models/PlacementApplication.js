const mongoose = require('mongoose');

const PlacementApplicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementCompany', required: true },
  status: { type: String, enum: ['applied', 'selected', 'rejected'], default: 'applied' },
  admitCardUrl: String,
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlacementApplication', PlacementApplicationSchema);
