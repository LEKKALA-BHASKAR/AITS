const mongoose = require('mongoose');

const PlacementCompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  jd: String,
  ctc: String,
  eligibility: String,
  rounds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlacementRound' }],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlacementCompany', PlacementCompanySchema);
