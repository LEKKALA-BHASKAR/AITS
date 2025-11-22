const mongoose = require('mongoose');

const InternshipCompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: String,
  stipend: String,
  status: { type: String, enum: ['active', 'completed', 'pending'], default: 'pending' },
  offerLetter: { type: String }, // URL to uploaded file
  noc: { type: String }, // URL to uploaded file
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InternshipCompany', InternshipCompanySchema);
