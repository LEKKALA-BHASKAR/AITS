const mongoose = require('mongoose');

const PlacementRoundSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementCompany', required: true },
  type: { type: String, enum: ['test', 'technical', 'hr'], required: true },
  date: Date,
  resultUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlacementRound', PlacementRoundSchema);
