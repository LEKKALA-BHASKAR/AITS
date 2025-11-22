const mongoose = require('mongoose');

const SubjectResultSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  internalMarks: { 
    type: Number, 
    required: true,
    min: 0,
    max: 30
  },
  externalMarks: { 
    type: Number, 
    required: true,
    min: 0,
    max: 70
  },
  totalMarks: { 
    type: Number,
    required: true
  },
  grade: { 
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'],
    required: true
  },
  credits: { type: Number, default: 3 }
}, { _id: false });

const ResultSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  semester: { 
    type: Number, 
    required: true,
    min: 1,
    max: 8
  },
  academicYear: { type: String, required: true }, // e.g., "2023-24"
  subjects: [SubjectResultSchema],
  sgpa: { type: Number, min: 0, max: 10 },
  cgpa: { type: Number, min: 0, max: 10 },
  totalCredits: { type: Number, default: 0 },
  earnedCredits: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'locked'],
    default: 'draft'
  },
  publishedAt: { type: Date },
  publishedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate semester results
ResultSchema.index({ student: 1, semester: 1, academicYear: 1 }, { unique: true });

// Calculate grades based on marks
ResultSchema.methods.calculateGrade = function(totalMarks) {
  if (totalMarks >= 90) return 'O';
  if (totalMarks >= 80) return 'A+';
  if (totalMarks >= 70) return 'A';
  if (totalMarks >= 60) return 'B+';
  if (totalMarks >= 50) return 'B';
  if (totalMarks >= 40) return 'C';
  return 'F';
};

// Calculate SGPA
ResultSchema.methods.calculateSGPA = function() {
  let totalGradePoints = 0;
  let totalCredits = 0;
  
  const gradePoints = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0
  };
  
  this.subjects.forEach(subject => {
    const credits = subject.credits || 3;
    totalGradePoints += gradePoints[subject.grade] * credits;
    totalCredits += credits;
  });
  
  this.sgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
  this.totalCredits = totalCredits;
  this.earnedCredits = this.subjects.filter(s => s.grade !== 'F').reduce((sum, s) => sum + (s.credits || 3), 0);
};

// Pre-save hook to update timestamp and calculations
ResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate total marks and grades
  this.subjects.forEach(subject => {
    subject.totalMarks = subject.internalMarks + subject.externalMarks;
    subject.grade = this.calculateGrade(subject.totalMarks);
  });
  
  // Calculate SGPA
  this.calculateSGPA();
  
  next();
});

module.exports = mongoose.model('Result', ResultSchema);
