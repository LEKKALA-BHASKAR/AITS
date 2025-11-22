const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');

/**
 * Attendance Notification Service
 * Handles all attendance-related notifications and alerts
 */

// Configuration constants
const MIN_UNMARKED_THRESHOLD = 10; // Minutes after class end to start alerting
const MAX_UNMARKED_THRESHOLD = 70; // Minutes after class end to stop alerting

/**
 * Send notification to teacher at period start
 * @param {String} teacherId - Teacher ID
 * @param {String} section - Section name
 * @param {String} subject - Subject name
 * @param {String} time - Time slot (e.g., "9-10")
 */
async function notifyTeacherPeriodStart(teacherId, section, subject, time) {
  try {
    const notification = await Notification.create({
      title: 'Time to Take Attendance',
      message: `It's time to take attendance for ${subject} (${section}) ${time}`,
      postedBy: null,
      postedByModel: 'Admin',
      target: 'teacher',
      targetId: teacherId
    });
    
    // If Socket.IO is available, emit real-time notification
    // This will be handled by the controller that has access to io
    
    return notification;
  } catch (error) {
    console.error('Failed to send period start notification:', error.message);
    return null;
  }
}

/**
 * Alert teacher if attendance not marked within 10 minutes
 * @param {String} teacherId - Teacher ID
 * @param {String} section - Section name
 * @param {String} subject - Subject name
 * @param {String} time - Time slot
 */
async function alertAttendanceUnmarked(teacherId, section, subject, time) {
  try {
    const notification = await Notification.create({
      title: 'Attendance Not Marked',
      message: `⚠️ Attendance for ${subject} (${section}) ${time} has not been marked yet. Please mark it soon.`,
      postedBy: null,
      postedByModel: 'Admin',
      target: 'teacher',
      targetId: teacherId
    });
    
    return notification;
  } catch (error) {
    console.error('Failed to send unmarked attendance alert:', error.message);
    return null;
  }
}

/**
 * Send weekly low attendance alert to student
 * @param {String} studentId - Student ID
 * @param {Object} attendanceStats - Attendance statistics
 */
async function alertStudentLowAttendance(studentId, attendanceStats) {
  try {
    const { subject, percentage, total, attended } = attendanceStats;
    
    let message = '';
    if (percentage < 65) {
      message = `🔴 CRITICAL: Your attendance in ${subject} is ${percentage}% (${attended}/${total}). You are below 65%. Please attend upcoming classes.`;
    } else if (percentage < 75) {
      message = `🟡 WARNING: Your attendance in ${subject} is ${percentage}% (${attended}/${total}). You need ${Math.ceil((0.75 * total) - attended)} more classes to reach 75%.`;
    }
    
    if (message) {
      const notification = await Notification.create({
        title: 'Low Attendance Alert',
        message,
        postedBy: null,
        postedByModel: 'Admin',
        target: 'student',
        targetId: studentId
      });
      
      return notification;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to send low attendance alert:', error.message);
    return null;
  }
}

/**
 * Alert HOD about student with critically low attendance
 * @param {String} studentId - Student ID
 * @param {String} studentName - Student name
 * @param {String} section - Section name
 * @param {String} subject - Subject name
 * @param {Number} percentage - Attendance percentage
 */
async function alertHODCriticalAttendance(studentId, studentName, section, subject, percentage) {
  try {
    // Find all admins (HODs)
    const admins = await Admin.find({ isActive: true });
    
    for (const admin of admins) {
      await Notification.create({
        title: 'Critical Attendance Alert',
        message: `🚨 Student ${studentName} (${section}) has ${percentage}% attendance in ${subject}. Immediate attention required.`,
        postedBy: null,
        postedByModel: 'Admin',
        target: 'all',
        targetId: admin._id
      });
    }
  } catch (error) {
    console.error('Failed to send HOD critical attendance alert:', error.message);
  }
}

/**
 * Send improvement suggestion to student
 * @param {String} studentId - Student ID
 * @param {String} subject - Subject name
 * @param {Number} currentPercentage - Current percentage
 * @param {Number} classesNeeded - Classes needed to reach threshold
 */
async function sendImprovementSuggestion(studentId, subject, currentPercentage, classesNeeded) {
  try {
    const notification = await Notification.create({
      title: 'Attendance Improvement Suggestion',
      message: `💡 To reach 75% in ${subject}, attend the next ${classesNeeded} classes without missing. Current: ${currentPercentage}%`,
      postedBy: null,
      postedByModel: 'Admin',
      target: 'student',
      targetId: studentId
    });
    
    return notification;
  } catch (error) {
    console.error('Failed to send improvement suggestion:', error.message);
    return null;
  }
}

/**
 * Check and send weekly attendance alerts to all students
 */
async function sendWeeklyAttendanceAlerts() {
  try {
    console.log('Running weekly attendance alerts...');
    
    const students = await Student.find({ isActive: true });
    let alertsSent = 0;
    
    for (const student of students) {
      // Get all attendance records for the student
      const attendanceRecords = await Attendance.find({
        'students.studentId': student._id
      });
      
      // Group by subject
      const subjectStats = {};
      
      for (const record of attendanceRecords) {
        const studentAtt = record.students.find(
          s => s.studentId.toString() === student._id.toString()
        );
        
        if (studentAtt) {
          if (!subjectStats[record.subject]) {
            subjectStats[record.subject] = { total: 0, attended: 0 };
          }
          
          subjectStats[record.subject].total++;
          if (studentAtt.status === 'present') {
            subjectStats[record.subject].attended++;
          }
        }
      }
      
      // Check each subject
      for (const [subject, stats] of Object.entries(subjectStats)) {
        const percentage = ((stats.attended / stats.total) * 100).toFixed(2);
        
        if (percentage < 75) {
          await alertStudentLowAttendance(student._id, {
            subject,
            percentage,
            total: stats.total,
            attended: stats.attended
          });
          alertsSent++;
          
          // If critical, alert HOD
          if (percentage < 65) {
            await alertHODCriticalAttendance(
              student._id,
              student.name,
              student.section || 'Unknown',
              subject,
              percentage
            );
          }
        }
      }
    }
    
    console.log(`Weekly attendance alerts completed: ${alertsSent} alerts sent`);
    return alertsSent;
  } catch (error) {
    console.error('Failed to send weekly attendance alerts:', error.message);
    return 0;
  }
}

/**
 * Check unmarked attendance and send alerts
 * Runs periodically to check if teachers marked attendance
 */
async function checkUnmarkedAttendance() {
  try {
    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = days[now.getDay()];
    
    // Get all active timetables
    const timetables = await Timetable.find({ isActive: true });
    
    let alertsSent = 0;
    
    for (const timetable of timetables) {
      const todaySchedule = timetable.getScheduleForDay(today);
      
      for (const slot of todaySchedule) {
        // Check if slot ended more than 10 minutes ago
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        const slotEnd = new Date();
        slotEnd.setHours(endHour, endMinute, 0, 0);
        
        const minutesSinceEnd = (now - slotEnd) / (1000 * 60);
        
        if (minutesSinceEnd >= MIN_UNMARKED_THRESHOLD && minutesSinceEnd <= MAX_UNMARKED_THRESHOLD) {
          // Check if attendance was marked
          const exists = await Attendance.existsForSession(
            timetable.section,
            slot.subject,
            now,
            slot.time
          );
          
          if (!exists && slot.teacher) {
            await alertAttendanceUnmarked(
              slot.teacher,
              timetable.section,
              slot.subject,
              slot.time
            );
            alertsSent++;
          }
        }
      }
    }
    
    if (alertsSent > 0) {
      console.log(`Unmarked attendance check: ${alertsSent} alerts sent`);
    }
    
    return alertsSent;
  } catch (error) {
    console.error('Failed to check unmarked attendance:', error.message);
    return 0;
  }
}

module.exports = {
  notifyTeacherPeriodStart,
  alertAttendanceUnmarked,
  alertStudentLowAttendance,
  alertHODCriticalAttendance,
  sendImprovementSuggestion,
  sendWeeklyAttendanceAlerts,
  checkUnmarkedAttendance
};
