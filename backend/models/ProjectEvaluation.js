const mongoose = require('mongoose');

const ProjectEvaluationSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectGroup', required: true },
  stage: { type: String, enum: ['mid', 'final'], required: true },
  marks: Number,
  feedback: String,
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  evaluatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProjectEvaluation', ProjectEvaluationSchema);
