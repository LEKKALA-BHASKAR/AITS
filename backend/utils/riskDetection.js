const Student = require('../models/Student');

/**
 * Auto-update at-risk status for all students
 * This should be run periodically (e.g., daily via cron job)
 */
async function updateStudentRiskStatus() {
  try {
    console.log('Starting student risk status update...');
    
    const students = await Student.find({ isActive: true });
    let updatedCount = 0;
    
    for (const student of students) {
      let atRisk = false;
      const reasons = [];
      
      // Check attendance percentage
      if (student.attendance.length > 0) {
        const presentCount = student.attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = (presentCount / student.attendance.length) * 100;
        
        if (attendancePercentage < 65) {
          atRisk = true;
          reasons.push(`Low attendance: ${attendancePercentage.toFixed(2)}%`);
        }
      }
      
      // Check backlog count
      if (student.backlogCount > 2) {
        atRisk = true;
        reasons.push(`High backlog count: ${student.backlogCount}`);
      }
      
      // Check negative remarks
      const negativeRemarks = student.remarks.filter(r => r.type === 'negative').length;
      if (negativeRemarks > 3) {
        atRisk = true;
        reasons.push(`Multiple negative remarks: ${negativeRemarks}`);
      }
      
      // Check average marks
      if (student.results.length > 0) {
        const avgMarks = student.results.reduce((sum, r) => sum + r.marks, 0) / student.results.length;
        if (avgMarks < 40) {
          atRisk = true;
          reasons.push(`Low average marks: ${avgMarks.toFixed(2)}`);
        }
      }
      
      // Update student if status changed
      if (student.atRisk !== atRisk) {
        student.atRisk = atRisk;
        await student.save();
        updatedCount++;
        
        if (atRisk) {
          console.log(`Student ${student.name} (${student.rollNumber}) marked at-risk: ${reasons.join(', ')}`);
        } else {
          console.log(`Student ${student.name} (${student.rollNumber}) no longer at-risk`);
        }
      }
    }
    
    console.log(`Risk status update complete. ${updatedCount} students updated.`);
    return { success: true, updatedCount, totalStudents: students.length };
  } catch (error) {
    console.error('Error updating student risk status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get at-risk students with detailed reasons
 */
async function getAtRiskStudentsWithReasons() {
  try {
    const students = await Student.find({ atRisk: true, isActive: true })
      .populate('departmentId', 'name code')
      .populate('sectionId', 'name')
      .select('-password');
    
    const detailedStudents = students.map(student => {
      const reasons = [];
      
      // Calculate attendance
      if (student.attendance.length > 0) {
        const presentCount = student.attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = (presentCount / student.attendance.length) * 100;
        
        if (attendancePercentage < 65) {
          reasons.push({
            type: 'attendance',
            message: `Low attendance: ${attendancePercentage.toFixed(2)}%`,
            severity: attendancePercentage < 50 ? 'critical' : 'warning'
          });
        }
      }
      
      // Check backlogs
      if (student.backlogCount > 2) {
        reasons.push({
          type: 'backlogs',
          message: `${student.backlogCount} backlogs`,
          severity: student.backlogCount > 5 ? 'critical' : 'warning'
        });
      }
      
      // Check remarks
      const negativeRemarks = student.remarks.filter(r => r.type === 'negative').length;
      if (negativeRemarks > 3) {
        reasons.push({
          type: 'behavior',
          message: `${negativeRemarks} negative remarks`,
          severity: negativeRemarks > 5 ? 'critical' : 'warning'
        });
      }
      
      // Check marks
      if (student.results.length > 0) {
        const avgMarks = student.results.reduce((sum, r) => sum + r.marks, 0) / student.results.length;
        if (avgMarks < 40) {
          reasons.push({
            type: 'performance',
            message: `Low average marks: ${avgMarks.toFixed(2)}`,
            severity: avgMarks < 30 ? 'critical' : 'warning'
          });
        }
      }
      
      return {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        department: student.departmentId?.name,
        section: student.sectionId?.name,
        imageURL: student.imageURL,
        reasons,
        overallSeverity: reasons.some(r => r.severity === 'critical') ? 'critical' : 'warning'
      };
    });
    
    return detailedStudents;
  } catch (error) {
    console.error('Error getting at-risk students:', error);
    throw error;
  }
}

module.exports = {
  updateStudentRiskStatus,
  getAtRiskStudentsWithReasons
};
