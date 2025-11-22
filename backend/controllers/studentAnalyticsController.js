const {
  getStudentAttendanceAnalytics,
  getMonthlyAttendance,
  compareWithSectionAverage
} = require('../utils/studentAttendanceAnalytics');

/**
 * Student Analytics Controller
 * Provides enhanced attendance analytics, warnings, and suggestions
 */

/**
 * Get comprehensive attendance analytics for a student
 * GET /api/analytics/attendance/:studentId
 */
async function getAttendanceAnalytics(req, res) {
  try {
    const { studentId } = req.params;
    
    // Verify authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const analytics = await getStudentAttendanceAnalytics(studentId);
    
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get monthly attendance breakdown
 * GET /api/analytics/attendance/:studentId/monthly
 */
async function getMonthlyAttendanceBreakdown(req, res) {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ 
        error: 'Month and year are required (e.g., ?month=11&year=2025)' 
      });
    }
    
    // Verify authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const monthlyData = await getMonthlyAttendance(
      studentId,
      parseInt(month),
      parseInt(year)
    );
    
    res.json(monthlyData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Compare student attendance with section average
 * GET /api/analytics/attendance/:studentId/compare
 */
async function compareWithSection(req, res) {
  try {
    const { studentId } = req.params;
    const Student = require('../models/Student');
    
    // Verify authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const comparison = await compareWithSectionAverage(studentId, student.sectionId);
    
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get attendance warnings and suggestions
 * GET /api/analytics/attendance/:studentId/warnings
 */
async function getWarningsAndSuggestions(req, res) {
  try {
    const { studentId } = req.params;
    
    // Verify authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const analytics = await getStudentAttendanceAnalytics(studentId);
    
    res.json({
      warnings: analytics.warnings,
      suggestions: analytics.suggestions,
      atRisk: analytics.atRisk,
      needsAttention: analytics.needsAttention
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAttendanceAnalytics,
  getMonthlyAttendanceBreakdown,
  compareWithSection,
  getWarningsAndSuggestions
};
