const Result = require('../models/Result');
const Student = require('../models/Student');

module.exports = {
  // Create or update result for a student
  async createOrUpdateResult(req, res) {
    try {
      const { studentId, semester, academicYear, subjects } = req.body;

      if (!studentId || !semester || !academicYear || !subjects) {
        return res.status(400).json({ 
          error: 'Student ID, semester, academic year, and subjects are required' 
        });
      }

      // Verify student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Find existing result or create new
      let result = await Result.findOne({ 
        student: studentId, 
        semester, 
        academicYear 
      });

      if (result) {
        // Update existing result
        result.subjects = subjects;
        result.publishedBy = req.user.id;
        await result.save();
      } else {
        // Create new result
        result = await Result.create({
          student: studentId,
          semester,
          academicYear,
          subjects,
          publishedBy: req.user.id,
          status: 'draft'
        });
      }

      res.status(result.isNew ? 201 : 200).json({
        message: result.isNew ? 'Result created successfully' : 'Result updated successfully',
        result
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get results for a student
  async getStudentResults(req, res) {
    try {
      const { studentId } = req.params;

      const results = await Result.find({ student: studentId })
        .populate('publishedBy', 'name')
        .sort({ semester: 1 });

      // Calculate overall CGPA
      let totalGradePoints = 0;
      let totalCredits = 0;

      const gradePoints = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0
      };

      results.forEach(result => {
        if (result.status === 'published' || result.status === 'locked') {
          result.subjects.forEach(subject => {
            const credits = subject.credits || 3;
            totalGradePoints += gradePoints[subject.grade] * credits;
            totalCredits += credits;
          });
        }
      });

      const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

      res.json({
        results,
        cgpa,
        totalCredits,
        backlogs: results.reduce((count, r) => 
          count + r.subjects.filter(s => s.grade === 'F').length, 0
        )
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get results for current student (authenticated)
  async getMyResults(req, res) {
    try {
      const studentId = req.user.id;

      const results = await Result.find({ 
        student: studentId,
        status: { $in: ['published', 'locked'] }
      }).sort({ semester: 1 });

      // Calculate overall CGPA
      let totalGradePoints = 0;
      let totalCredits = 0;

      const gradePoints = {
        'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0
      };

      results.forEach(result => {
        result.subjects.forEach(subject => {
          const credits = subject.credits || 3;
          totalGradePoints += gradePoints[subject.grade] * credits;
          totalCredits += credits;
        });
      });

      const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

      res.json({
        results,
        cgpa,
        totalCredits,
        backlogs: results.reduce((count, r) => 
          count + r.subjects.filter(s => s.grade === 'F').length, 0
        )
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Publish result (make it visible to student)
  async publishResult(req, res) {
    try {
      const { resultId } = req.params;

      const result = await Result.findById(resultId);
      if (!result) {
        return res.status(404).json({ error: 'Result not found' });
      }

      result.status = 'published';
      result.publishedAt = Date.now();
      result.publishedBy = req.user.id;
      await result.save();

      res.json({ message: 'Result published successfully', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Lock result (prevent further edits)
  async lockResult(req, res) {
    try {
      const { resultId } = req.params;

      const result = await Result.findById(resultId);
      if (!result) {
        return res.status(404).json({ error: 'Result not found' });
      }

      result.status = 'locked';
      await result.save();

      res.json({ message: 'Result locked successfully', result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete result
  async deleteResult(req, res) {
    try {
      const { resultId } = req.params;

      const result = await Result.findByIdAndDelete(resultId);
      if (!result) {
        return res.status(404).json({ error: 'Result not found' });
      }

      res.json({ message: 'Result deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Get results by section
  async getSectionResults(req, res) {
    try {
      const { sectionId } = req.params;
      const { semester } = req.query;

      // Get all students in section
      const students = await Student.find({ sectionId, isActive: true })
        .select('name rollNumber');

      const studentIds = students.map(s => s._id);

      const query = { student: { $in: studentIds } };
      if (semester) {
        query.semester = parseInt(semester);
      }

      const results = await Result.find(query)
        .populate('student', 'name rollNumber')
        .sort({ semester: 1 });

      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
