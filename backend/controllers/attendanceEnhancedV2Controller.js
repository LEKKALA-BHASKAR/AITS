const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Section = require('../models/Section');
const Student = require('../models/Student');
const NotificationEnhanced = require('../models/NotificationEnhanced');

/**
 * Enhanced Attendance Controller
 * With real-time period detection, countdown timers, and notifications
 */

// Get current period for a teacher
exports.getCurrentPeriod = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const now = new Date();
    const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Find all timetables where this teacher teaches
    const timetables = await Timetable.find({
      [`schedule.${dayName}.teacher`]: teacherId,
      isActive: true
    }).populate('sectionId', 'name');
    
    const currentPeriods = [];
    const upcomingPeriods = [];
    
    for (const timetable of timetables) {
      const daySchedule = timetable.schedule[dayName] || [];
      
      for (const slot of daySchedule) {
        if (slot.teacher && slot.teacher.toString() === teacherId.toString()) {
          // Check if current period
          if (currentTime >= slot.startTime && currentTime < slot.endTime) {
            // Calculate time remaining
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);
            const endTimeMs = new Date(now);
            endTimeMs.setHours(endHour, endMinute, 0, 0);
            const minutesRemaining = Math.floor((endTimeMs - now) / (1000 * 60));
            
            currentPeriods.push({
              section: timetable.section,
              sectionId: timetable.sectionId,
              subject: slot.subject,
              time: slot.time,
              startTime: slot.startTime,
              endTime: slot.endTime,
              minutesRemaining,
              canMarkAttendance: minutesRemaining > -15 // 15 min grace period
            });
          }
          
          // Check if upcoming (within next 30 minutes)
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const slotStartMs = new Date(now);
          slotStartMs.setHours(startHour, startMinute, 0, 0);
          const minutesUntilStart = Math.floor((slotStartMs - now) / (1000 * 60));
          
          if (minutesUntilStart > 0 && minutesUntilStart <= 30) {
            upcomingPeriods.push({
              section: timetable.section,
              sectionId: timetable.sectionId,
              subject: slot.subject,
              time: slot.time,
              startTime: slot.startTime,
              endTime: slot.endTime,
              minutesUntilStart
            });
          }
        }
      }
    }
    
    res.json({
      current: currentPeriods,
      upcoming: upcomingPeriods,
      currentDay: dayName,
      currentTime
    });
  } catch (error) {
    console.error('Error fetching current period:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get today's schedule for a teacher
exports.getTodaySchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const now = new Date();
    const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];
    
    const timetables = await Timetable.find({
      [`schedule.${dayName}.teacher`]: teacherId,
      isActive: true
    }).populate('sectionId', 'name');
    
    const schedule = [];
    
    for (const timetable of timetables) {
      const daySchedule = timetable.schedule[dayName] || [];
      
      for (const slot of daySchedule) {
        if (slot.teacher && slot.teacher.toString() === teacherId.toString()) {
          // Check if attendance is already marked
          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date(todayStart);
          todayEnd.setDate(todayEnd.getDate() + 1);
          
          const attendanceRecord = await Attendance.findOne({
            section: timetable.section,
            subject: slot.subject,
            time: slot.time,
            date: { $gte: todayStart, $lt: todayEnd }
          });
          
          schedule.push({
            section: timetable.section,
            sectionId: timetable.sectionId,
            subject: slot.subject,
            time: slot.time,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isMarked: !!attendanceRecord,
            attendanceId: attendanceRecord?._id
          });
        }
      }
    }
    
    // Sort by start time
    schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    res.json({
      day: dayName,
      schedule
    });
  } catch (error) {
    console.error('Error fetching today schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark attendance with enhanced validation and notifications
exports.markAttendanceEnhanced = async (req, res) => {
  try {
    const { sectionId, subject, time, students } = req.body;
    const teacherId = req.user.id;
    const now = new Date();
    const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][now.getDay()];
    
    // Validate required fields
    if (!sectionId || !subject || !time || !students) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get section details
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    // Verify timetable and time window
    const timetable = await Timetable.findOne({
      sectionId,
      isActive: true
    });
    
    if (!timetable) {
      return res.status(404).json({ error: 'Timetable not found for this section' });
    }
    
    const daySchedule = timetable.schedule[dayName] || [];
    const slot = daySchedule.find(s => s.time === time && s.subject === subject);
    
    if (!slot) {
      return res.status(400).json({ error: 'No class scheduled for this time and subject' });
    }
    
    // Check if teacher is authorized (unless admin)
    if (req.user.role !== 'admin' && slot.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({ error: 'You are not assigned to teach this subject' });
    }
    
    // Check time window (only for teachers, not admins)
    if (req.user.role === 'teacher') {
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);
      const endTimeWithGrace = new Date(now);
      endTimeWithGrace.setHours(endHour, endMinute + 15, 0, 0); // 15 min grace
      
      if (currentTime < slot.startTime || now > endTimeWithGrace) {
        return res.status(400).json({ 
          error: 'Attendance can only be marked during the period time (with 15-minute grace period)',
          allowedWindow: {
            start: slot.startTime,
            end: `${String(endHour).padStart(2, '0')}:${String(endMinute + 15).padStart(2, '0')}`
          }
        });
      }
    }
    
    // Check for duplicate
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    
    const existing = await Attendance.findOne({
      section: section.name,
      subject,
      time,
      date: { $gte: todayStart, $lt: todayEnd }
    });
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Attendance already marked for this session',
        existingRecord: existing._id
      });
    }
    
    // Create attendance record
    const attendance = new Attendance({
      section: section.name,
      sectionId,
      subject,
      teacher: teacherId,
      date: now,
      day: dayName,
      time,
      startTime: slot.startTime,
      endTime: slot.endTime,
      students: students.map(s => ({
        studentId: s.studentId,
        status: s.status || 'present',
        markedAt: new Date()
      })),
      markedBy: teacherId,
      lastModifiedBy: {
        userId: teacherId,
        userType: req.user.role,
        userName: req.user.name || 'Teacher'
      },
      lastModifiedAt: now
    });
    
    await attendance.save();
    
    // Send low attendance notifications
    for (const studentRecord of students) {
      if (studentRecord.status === 'absent') {
        // Calculate student's overall attendance
        const totalRecords = await Attendance.countDocuments({
          'students.studentId': studentRecord.studentId
        });
        
        const presentRecords = await Attendance.countDocuments({
          'students': {
            $elemMatch: {
              studentId: studentRecord.studentId,
              status: { $in: ['present', 'late'] }
            }
          }
        });
        
        const attendancePercentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 100;
        
        // Create alert if below threshold
        if (attendancePercentage < 75) {
          await NotificationEnhanced.createAttendanceAlert(
            studentRecord.studentId,
            attendancePercentage,
            teacherId
          );
        }
      }
    }
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
      alertsSent: students.filter(s => s.status === 'absent').length
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get attendance statistics for a teacher
exports.getTeacherAttendanceStats = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const query = { teacher: teacherId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const records = await Attendance.find(query);
    
    const stats = {
      totalSessions: records.length,
      totalStudentsMarked: records.reduce((sum, r) => sum + r.students.length, 0),
      bySubject: {},
      bySection: {},
      recentSessions: records.slice(-10).map(r => ({
        subject: r.subject,
        section: r.section,
        date: r.date,
        studentsMarked: r.students.length
      }))
    };
    
    // Group by subject
    records.forEach(record => {
      if (!stats.bySubject[record.subject]) {
        stats.bySubject[record.subject] = {
          sessions: 0,
          totalStudents: 0
        };
      }
      stats.bySubject[record.subject].sessions++;
      stats.bySubject[record.subject].totalStudents += record.students.length;
    });
    
    // Group by section
    records.forEach(record => {
      if (!stats.bySection[record.section]) {
        stats.bySection[record.section] = {
          sessions: 0,
          totalStudents: 0
        };
      }
      stats.bySection[record.section].sessions++;
      stats.bySection[record.section].totalStudents += record.students.length;
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCurrentPeriod: exports.getCurrentPeriod,
  getTodaySchedule: exports.getTodaySchedule,
  markAttendanceEnhanced: exports.markAttendanceEnhanced,
  getTeacherAttendanceStats: exports.getTeacherAttendanceStats
};
