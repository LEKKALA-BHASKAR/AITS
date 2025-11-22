const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Student = require('../models/Student');
const Section = require('../models/Section');

// Grace period in minutes (can be configured)
const GRACE_PERIOD_MINUTES = 15;

module.exports = {
  /**
   * Mark attendance with auto-detection of subject based on timetable
   * POST /api/attendance/mark
   */
  async markAttendance(req, res) {
    try {
      const { section, studentAttendance } = req.body;
      const teacherId = req.user.id;

      if (!section || !studentAttendance || !Array.isArray(studentAttendance)) {
        return res.status(400).json({ 
          error: 'Section and studentAttendance array are required' 
        });
      }

      // Get timetable for section
      const timetable = await Timetable.findBySection(section);
      if (!timetable) {
        return res.status(404).json({ error: 'Timetable not found for this section' });
      }

      // Get current day and time
      const now = new Date();
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const currentDay = days[now.getDay()];
      let currentSlot = timetable.getCurrentSlot(currentDay);

      if (!currentSlot) {
        // Check if we're within grace period of any slot
        const todaySchedule = timetable.getScheduleForDay(currentDay);
        let slotWithinGrace = null;

        for (const slot of todaySchedule) {
          const [endHour, endMinute] = slot.endTime.split(':').map(Number);
          const slotEnd = new Date(now);
          slotEnd.setHours(endHour, endMinute, 0, 0);
          
          const minutesSinceEnd = (now - slotEnd) / (1000 * 60);
          
          if (minutesSinceEnd >= 0 && minutesSinceEnd <= GRACE_PERIOD_MINUTES) {
            slotWithinGrace = slot;
            break;
          }
        }

        if (!slotWithinGrace) {
          return res.status(400).json({ 
            error: 'No class in session currently. Attendance can only be marked during class time or within grace period.' 
          });
        }

        // Use the slot within grace period
        currentSlot = {
          time: slotWithinGrace.time,
          startTime: slotWithinGrace.startTime,
          endTime: slotWithinGrace.endTime,
          subject: slotWithinGrace.subject,
          teacher: slotWithinGrace.teacher
        };
      }

      // Verify teacher is assigned to this slot
      if (currentSlot.teacher && currentSlot.teacher.toString() !== teacherId) {
        return res.status(403).json({ 
          error: 'You are not assigned to teach this subject at this time' 
        });
      }

      // Check if attendance already marked for this session
      const exists = await Attendance.existsForSession(
        section, 
        currentSlot.subject, 
        now, 
        currentSlot.time
      );

      if (exists) {
        return res.status(400).json({ 
          error: 'Attendance already marked for this session' 
        });
      }

      // Get section ID
      const sectionDoc = await Section.findOne({ name: section });

      // Format student attendance
      const formattedStudents = studentAttendance.map(s => ({
        studentId: s.studentId,
        status: s.status || 'present',
        markedAt: now
      }));

      // Create attendance record
      const attendance = await Attendance.create({
        section,
        sectionId: sectionDoc ? sectionDoc._id : null,
        subject: currentSlot.subject,
        teacher: currentSlot.teacher || teacherId,
        date: now,
        day: currentDay,
        time: currentSlot.time,
        startTime: currentSlot.startTime,
        endTime: currentSlot.endTime,
        students: formattedStudents,
        markedBy: teacherId,
        isLocked: false
      });

      // Update student attendance records for backward compatibility
      for (const studentAtt of formattedStudents) {
        await Student.findByIdAndUpdate(
          studentAtt.studentId,
          {
            $push: {
              attendance: {
                subject: currentSlot.subject,
                date: now,
                status: studentAtt.status
              }
            }
          }
        );
      }

      res.status(201).json({
        message: 'Attendance marked successfully',
        attendance: {
          subject: attendance.subject,
          section: attendance.section,
          time: attendance.time,
          date: attendance.date,
          totalStudents: formattedStudents.length
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get attendance for a student
   * GET /api/attendance/student/:studentId
   */
  async getStudentAttendance(req, res) {
    try {
      const { studentId } = req.params;
      const { subject } = req.query;

      let attendance;
      if (subject) {
        attendance = await Attendance.getStudentAttendanceBySubject(studentId, subject);
      } else {
        attendance = await Attendance.getStudentAttendance(studentId);
      }

      res.json(attendance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get attendance statistics for a student
   * GET /api/attendance/student/:studentId/stats
   */
  async getStudentStats(req, res) {
    try {
      const { studentId } = req.params;

      // Get all attendance records for the student
      const allAttendance = await Attendance.getStudentAttendance(studentId);

      // Group by subject
      const subjectStats = {};
      for (const record of allAttendance) {
        if (!subjectStats[record.subject]) {
          subjectStats[record.subject] = {
            subject: record.subject,
            total: 0,
            present: 0,
            absent: 0,
            late: 0
          };
        }
        
        subjectStats[record.subject].total++;
        subjectStats[record.subject][record.status]++;
      }

      // Calculate percentages
      const stats = Object.values(subjectStats).map(stat => ({
        ...stat,
        percentage: stat.total > 0 ? ((stat.present / stat.total) * 100).toFixed(2) : 0
      }));

      // Overall stats
      const totalClasses = allAttendance.length;
      const presentCount = allAttendance.filter(a => a.status === 'present').length;
      const overallPercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;

      res.json({
        overall: {
          totalClasses,
          presentCount,
          percentage: overallPercentage,
          lowAttendanceWarning: parseFloat(overallPercentage) < 75
        },
        bySubject: stats
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get attendance records for a section on a specific date
   * GET /api/attendance/section/:sectionName
   */
  async getSectionAttendance(req, res) {
    try {
      const { sectionName } = req.params;
      const { date, subject } = req.query;

      const query = { section: sectionName };
      
      if (date) {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(queryDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.date = { $gte: queryDate, $lt: nextDay };
      }

      if (subject) {
        query.subject = subject;
      }

      const attendance = await Attendance.find(query)
        .populate('students.studentId', 'name rollNumber')
        .populate('teacher', 'name')
        .sort({ date: -1, startTime: 1 });

      res.json(attendance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Get current slot information for attendance marking
   * GET /api/attendance/current-slot/:section
   */
  async getCurrentSlotForAttendance(req, res) {
    try {
      const { section } = req.params;
      const teacherId = req.user.id;

      const timetable = await Timetable.findBySection(section)
        .populate('schedule.MON.teacher schedule.TUE.teacher schedule.WED.teacher schedule.THU.teacher schedule.FRI.teacher schedule.SAT.teacher schedule.SUN.teacher', 'name teacherId');
      
      if (!timetable) {
        return res.status(404).json({ error: 'Timetable not found for this section' });
      }

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const today = days[new Date().getDay()];
      const currentSlot = timetable.getCurrentSlot(today);

      if (!currentSlot) {
        return res.json({ 
          message: 'No class in session currently',
          currentSlot: null,
          canMarkAttendance: false
        });
      }

      // Check if teacher is authorized
      const isAuthorized = !currentSlot.teacher || currentSlot.teacher._id.toString() === teacherId;

      // Check if already marked
      const alreadyMarked = await Attendance.existsForSession(
        section,
        currentSlot.subject,
        new Date(),
        currentSlot.time
      );

      res.json({
        section,
        day: today,
        currentSlot,
        canMarkAttendance: isAuthorized && !alreadyMarked,
        alreadyMarked,
        isAuthorized
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * Lock attendance after grace period (called by cron job)
   * POST /api/attendance/lock
   */
  async lockExpiredAttendance(req, res) {
    try {
      const now = new Date();
      const graceExpiry = new Date(now.getTime() - GRACE_PERIOD_MINUTES * 60 * 1000);

      const result = await Attendance.updateMany(
        {
          isLocked: false,
          date: { $lt: graceExpiry }
        },
        {
          $set: { isLocked: true }
        }
      );

      res.json({
        message: 'Expired attendance records locked',
        count: result.modifiedCount
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
