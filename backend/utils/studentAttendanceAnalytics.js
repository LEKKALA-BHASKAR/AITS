const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

/**
 * Student Attendance Analytics
 * Provides detailed analytics, warnings, and improvement suggestions
 */

/**
 * Get comprehensive attendance statistics for a student
 * @param {String} studentId - Student ID
 * @returns {Object} Detailed attendance analytics
 */
async function getStudentAttendanceAnalytics(studentId) {
  try {
    // Get all attendance records for the student
    const records = await Attendance.find({
      'students.studentId': studentId
    }).sort({ date: -1 });
    
    if (records.length === 0) {
      return {
        overall: {
          totalClasses: 0,
          attended: 0,
          percentage: 0,
          status: 'NO_DATA'
        },
        bySubject: [],
        warnings: [],
        suggestions: [],
        trends: {
          lastWeek: { percentage: 0, classes: 0 },
          lastMonth: { percentage: 0, classes: 0 }
        }
      };
    }
    
    // Calculate overall statistics
    let totalClasses = 0;
    let totalAttended = 0;
    const subjectStats = {};
    
    // Track weekly and monthly trends
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let weekClasses = 0;
    let weekAttended = 0;
    let monthClasses = 0;
    let monthAttended = 0;
    
    for (const record of records) {
      const studentRecord = record.students.find(
        s => s.studentId.toString() === studentId.toString()
      );
      
      if (studentRecord) {
        totalClasses++;
        const isPresent = studentRecord.status === 'present';
        
        if (isPresent) {
          totalAttended++;
        }
        
        // Subject-wise stats
        if (!subjectStats[record.subject]) {
          subjectStats[record.subject] = {
            subject: record.subject,
            total: 0,
            attended: 0,
            absent: 0,
            late: 0,
            lastClass: record.date,
            recentAttendance: []
          };
        }
        
        subjectStats[record.subject].total++;
        if (isPresent) {
          subjectStats[record.subject].attended++;
        } else if (studentRecord.status === 'absent') {
          subjectStats[record.subject].absent++;
        } else if (studentRecord.status === 'late') {
          subjectStats[record.subject].late++;
        }
        
        // Track recent attendance for trend
        if (subjectStats[record.subject].recentAttendance.length < 5) {
          subjectStats[record.subject].recentAttendance.push({
            date: record.date,
            status: studentRecord.status
          });
        }
        
        // Weekly trend
        if (record.date >= oneWeekAgo) {
          weekClasses++;
          if (isPresent) weekAttended++;
        }
        
        // Monthly trend
        if (record.date >= oneMonthAgo) {
          monthClasses++;
          if (isPresent) monthAttended++;
        }
      }
    }
    
    const overallPercentage = totalClasses > 0 
      ? ((totalAttended / totalClasses) * 100).toFixed(2)
      : 0;
    
    // Determine status
    let status = 'EXCELLENT';
    if (overallPercentage < 65) status = 'CRITICAL';
    else if (overallPercentage < 75) status = 'WARNING';
    else if (overallPercentage < 85) status = 'GOOD';
    
    // Generate warnings
    const warnings = [];
    const suggestions = [];
    
    // Overall warnings
    if (overallPercentage < 65) {
      warnings.push({
        type: 'CRITICAL',
        message: `Your overall attendance is ${overallPercentage}%, which is below 65%. This is critically low.`,
        severity: 'high'
      });
    } else if (overallPercentage < 75) {
      warnings.push({
        type: 'WARNING',
        message: `Your overall attendance is ${overallPercentage}%, which is below 75%. You need to improve.`,
        severity: 'medium'
      });
    }
    
    // Subject-wise analysis
    const subjectArray = [];
    for (const [subject, stats] of Object.entries(subjectStats)) {
      const percentage = ((stats.attended / stats.total) * 100).toFixed(2);
      
      stats.percentage = parseFloat(percentage);
      
      // Calculate classes needed to reach 75%
      const classesNeeded = Math.ceil((0.75 * stats.total - stats.attended) / 0.25);
      
      // Subject-specific warnings
      if (percentage < 65) {
        warnings.push({
          type: 'CRITICAL',
          subject: subject,
          message: `Your attendance in ${subject} is ${percentage}%. This is critically low.`,
          severity: 'high'
        });
        
        suggestions.push({
          subject: subject,
          message: `To improve ${subject} attendance: You need to attend approximately ${Math.max(classesNeeded, 3)} consecutive classes without missing.`,
          classesNeeded: Math.max(classesNeeded, 3)
        });
      } else if (percentage < 75) {
        warnings.push({
          type: 'WARNING',
          subject: subject,
          message: `Your attendance in ${subject} is ${percentage}%. You are ${classesNeeded} classes away from 75%.`,
          severity: 'medium'
        });
        
        suggestions.push({
          subject: subject,
          message: `Please attend the next ${classesNeeded} classes in ${subject} to reach 75% threshold.`,
          classesNeeded: classesNeeded
        });
      }
      
      // Check for declining trend
      if (stats.recentAttendance.length >= 3) {
        const recentAbsences = stats.recentAttendance.filter(a => a.status === 'absent').length;
        if (recentAbsences >= 2) {
          warnings.push({
            type: 'TREND',
            subject: subject,
            message: `You have ${recentAbsences} absences in your last ${stats.recentAttendance.length} classes in ${subject}.`,
            severity: 'medium'
          });
        }
      }
      
      subjectArray.push(stats);
    }
    
    // Sort subjects by percentage (lowest first for attention)
    subjectArray.sort((a, b) => a.percentage - b.percentage);
    
    return {
      overall: {
        totalClasses,
        attended: totalAttended,
        absent: totalClasses - totalAttended,
        percentage: parseFloat(overallPercentage),
        status
      },
      bySubject: subjectArray,
      warnings,
      suggestions,
      trends: {
        lastWeek: {
          percentage: weekClasses > 0 ? ((weekAttended / weekClasses) * 100).toFixed(2) : 0,
          classes: weekClasses,
          attended: weekAttended
        },
        lastMonth: {
          percentage: monthClasses > 0 ? ((monthAttended / monthClasses) * 100).toFixed(2) : 0,
          classes: monthClasses,
          attended: monthAttended
        }
      },
      atRisk: overallPercentage < 75,
      needsAttention: warnings.filter(w => w.severity === 'high').length > 0
    };
  } catch (error) {
    throw new Error(`Failed to calculate attendance analytics: ${error.message}`);
  }
}

/**
 * Get monthly attendance breakdown for a student
 * @param {String} studentId - Student ID
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @returns {Object} Monthly attendance data
 */
async function getMonthlyAttendance(studentId, month, year) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const records = await Attendance.find({
      'students.studentId': studentId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    const dailyAttendance = [];
    const subjectStats = {};
    
    for (const record of records) {
      const studentRecord = record.students.find(
        s => s.studentId.toString() === studentId.toString()
      );
      
      if (studentRecord) {
        dailyAttendance.push({
          date: record.date,
          day: record.day,
          subject: record.subject,
          time: record.time,
          status: studentRecord.status
        });
        
        if (!subjectStats[record.subject]) {
          subjectStats[record.subject] = { total: 0, attended: 0 };
        }
        
        subjectStats[record.subject].total++;
        if (studentRecord.status === 'present') {
          subjectStats[record.subject].attended++;
        }
      }
    }
    
    // Calculate percentages
    const subjects = Object.keys(subjectStats).map(subject => ({
      subject,
      total: subjectStats[subject].total,
      attended: subjectStats[subject].attended,
      percentage: ((subjectStats[subject].attended / subjectStats[subject].total) * 100).toFixed(2)
    }));
    
    return {
      month,
      year,
      dailyAttendance,
      subjects,
      totalClasses: dailyAttendance.length,
      totalAttended: dailyAttendance.filter(a => a.status === 'present').length
    };
  } catch (error) {
    throw new Error(`Failed to get monthly attendance: ${error.message}`);
  }
}

/**
 * Get attendance comparison with section average
 * @param {String} studentId - Student ID
 * @param {String} sectionId - Section ID
 * @returns {Object} Comparison data
 */
async function compareWithSectionAverage(studentId, sectionId) {
  try {
    const Student = require('../models/Student');
    
    // Get all students in section
    const students = await Student.find({ sectionId, isActive: true });
    
    // Calculate section average
    let sectionTotal = 0;
    let sectionAttended = 0;
    let studentPercentage = 0;
    
    for (const student of students) {
      const records = await Attendance.find({
        'students.studentId': student._id
      });
      
      for (const record of records) {
        const studentRecord = record.students.find(
          s => s.studentId.toString() === student._id.toString()
        );
        
        if (studentRecord) {
          sectionTotal++;
          if (studentRecord.status === 'present') {
            sectionAttended++;
          }
          
          // Track current student
          if (student._id.toString() === studentId.toString()) {
            if (studentRecord.status === 'present') {
              studentPercentage++;
            }
          }
        }
      }
    }
    
    const sectionAverage = sectionTotal > 0 
      ? ((sectionAttended / sectionTotal) * 100).toFixed(2)
      : 0;
    
    const studentRecords = await Attendance.find({
      'students.studentId': studentId
    });
    
    let studentTotal = 0;
    let studentAttendedCount = 0;
    
    for (const record of studentRecords) {
      const studentRecord = record.students.find(
        s => s.studentId.toString() === studentId.toString()
      );
      
      if (studentRecord) {
        studentTotal++;
        if (studentRecord.status === 'present') {
          studentAttendedCount++;
        }
      }
    }
    
    const studentPct = studentTotal > 0 
      ? ((studentAttendedCount / studentTotal) * 100).toFixed(2)
      : 0;
    
    return {
      studentPercentage: parseFloat(studentPct),
      sectionAverage: parseFloat(sectionAverage),
      difference: (parseFloat(studentPct) - parseFloat(sectionAverage)).toFixed(2),
      aboveAverage: parseFloat(studentPct) > parseFloat(sectionAverage),
      studentsInSection: students.length
    };
  } catch (error) {
    throw new Error(`Failed to compare with section average: ${error.message}`);
  }
}

module.exports = {
  getStudentAttendanceAnalytics,
  getMonthlyAttendance,
  compareWithSectionAverage
};
