const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');
const AttendanceCorrectionRequest = require('../models/AttendanceCorrectionRequest');
const Leave = require('../models/Leave');
const SubstituteTeacher = require('../models/SubstituteTeacher');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

/**
 * Enhanced Attendance Controller
 * Handles HOD overrides, audit logging, corrections, and advanced features
 */

/**
 * HOD Override - Mark or Edit Attendance Anytime
 * POST /api/attendance/hod-override
 */
async function hodOverrideAttendance(req, res) {
  try {
    const { attendanceId, studentAttendance, reason, section, subject, date, time, day, startTime, endTime } = req.body;
    const userId = req.user.id;
    const userType = req.user.role;
    
    // Verify user is admin/HOD
    if (userType !== 'admin') {
      return res.status(403).json({ error: 'Only HOD/Admin can override attendance' });
    }
    
    const admin = await Admin.findById(userId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    let attendance;
    let auditAction;
    let beforeData = null;
    
    // Case 1: Update existing attendance
    if (attendanceId) {
      attendance = await Attendance.findById(attendanceId);
      if (!attendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      
      // Store before state for audit
      beforeData = {
        students: attendance.students.map(s => ({
          studentId: s.studentId,
          status: s.status
        })),
        isLocked: attendance.isLocked
      };
      
      // Update attendance
      attendance.students = studentAttendance.map(s => ({
        studentId: s.studentId,
        status: s.status,
        markedAt: s.markedAt || new Date()
      }));
      
      attendance.lastModifiedBy = {
        userId: userId,
        userType: 'admin',
        userName: admin.name
      };
      attendance.lastModifiedAt = new Date();
      attendance.overrideReason = reason || 'HOD override';
      
      await attendance.save();
      auditAction = 'OVERRIDE';
    } 
    // Case 2: Create new attendance (retroactive)
    else {
      if (!section || !subject || !date || !time) {
        return res.status(400).json({ 
          error: 'Section, subject, date, and time are required for creating attendance' 
        });
      }
      
      // Check if attendance already exists
      const exists = await Attendance.existsForSession(section, subject, date, time);
      if (exists) {
        return res.status(400).json({ error: 'Attendance already exists for this session' });
      }
      
      attendance = await Attendance.create({
        section,
        subject,
        teacher: req.body.teacherId || userId,
        date: new Date(date),
        day: day || ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date(date).getDay()],
        time,
        startTime: startTime || time.split('-')[0] + ':00',
        endTime: endTime || time.split('-')[1] + ':00',
        students: studentAttendance.map(s => ({
          studentId: s.studentId,
          status: s.status,
          markedAt: new Date()
        })),
        markedBy: userId,
        isLocked: false,
        lastModifiedBy: {
          userId: userId,
          userType: 'admin',
          userName: admin.name
        },
        lastModifiedAt: new Date(),
        overrideReason: reason || 'HOD retroactive entry'
      });
      
      auditAction = 'CREATE';
    }
    
    // Update student records for backward compatibility
    for (const studentAtt of studentAttendance) {
      await Student.findByIdAndUpdate(
        studentAtt.studentId,
        {
          $push: {
            attendance: {
              subject: attendance.subject,
              date: attendance.date,
              status: studentAtt.status
            }
          }
        }
      );
    }
    
    // Create audit log
    await AuditLog.log({
      action: auditAction,
      entityType: 'ATTENDANCE',
      entityId: attendance._id,
      performedBy: {
        userId: userId,
        userType: 'admin',
        userName: admin.name
      },
      context: {
        section: attendance.section,
        subject: attendance.subject,
        date: attendance.date,
        time: attendance.time
      },
      changes: {
        before: beforeData,
        after: {
          students: attendance.students.map(s => ({
            studentId: s.studentId,
            status: s.status
          }))
        }
      },
      reason: reason || 'HOD override',
      ipAddress: req.ip
    });
    
    res.json({
      message: 'Attendance override successful',
      attendance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Lock Attendance After Grace Period
 * POST /api/attendance/lock/:attendanceId
 */
async function lockAttendance(req, res) {
  try {
    const { attendanceId } = req.params;
    const userId = req.user.id;
    
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance not found' });
    }
    
    if (attendance.isLocked) {
      return res.status(400).json({ error: 'Attendance already locked' });
    }
    
    attendance.isLocked = true;
    attendance.lockedAt = new Date();
    await attendance.save();
    
    // Create audit log
    await AuditLog.log({
      action: 'LOCK',
      entityType: 'ATTENDANCE',
      entityId: attendance._id,
      performedBy: {
        userId: userId,
        userType: req.user.role,
        userName: req.user.name || 'System'
      },
      context: {
        section: attendance.section,
        subject: attendance.subject,
        date: attendance.date,
        time: attendance.time
      },
      reason: 'Grace period expired',
      ipAddress: req.ip
    });
    
    res.json({ message: 'Attendance locked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Unlock Attendance (HOD only)
 * POST /api/attendance/unlock/:attendanceId
 */
async function unlockAttendance(req, res) {
  try {
    const { attendanceId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only HOD/Admin can unlock attendance' });
    }
    
    const admin = await Admin.findById(userId);
    const attendance = await Attendance.findById(attendanceId);
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance not found' });
    }
    
    attendance.isLocked = false;
    attendance.lockedAt = null;
    attendance.overrideReason = reason || 'Unlocked by HOD';
    await attendance.save();
    
    // Create audit log
    await AuditLog.log({
      action: 'UNLOCK',
      entityType: 'ATTENDANCE',
      entityId: attendance._id,
      performedBy: {
        userId: userId,
        userType: 'admin',
        userName: admin?.name || 'Admin'
      },
      context: {
        section: attendance.section,
        subject: attendance.subject,
        date: attendance.date,
        time: attendance.time
      },
      reason: reason || 'Unlocked by HOD',
      ipAddress: req.ip
    });
    
    res.json({ message: 'Attendance unlocked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get Audit Trail for Attendance
 * GET /api/attendance/audit/:attendanceId
 */
async function getAuditTrail(req, res) {
  try {
    const { attendanceId } = req.params;
    const { limit = 50 } = req.query;
    
    const auditLogs = await AuditLog.getTrail(attendanceId, parseInt(limit));
    
    res.json(auditLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get Section Audit Logs
 * GET /api/attendance/audit/section/:sectionName
 */
async function getSectionAuditLogs(req, res) {
  try {
    const { sectionName } = req.params;
    const { startDate, endDate, limit = 200 } = req.query;
    
    const auditLogs = await AuditLog.getSectionLogs(
      sectionName,
      startDate,
      endDate,
      parseInt(limit)
    );
    
    res.json(auditLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Submit Attendance Correction Request (Student)
 * POST /api/attendance/correction-request
 */
async function submitCorrectionRequest(req, res) {
  try {
    const { attendanceId, requestedStatus, reason, proofUrl } = req.body;
    const studentId = req.user.id;
    
    if (!attendanceId || !requestedStatus || !reason) {
      return res.status(400).json({
        error: 'Attendance ID, requested status, and reason are required'
      });
    }
    
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    // Find student's current status in this attendance
    const studentRecord = attendance.students.find(
      s => s.studentId.toString() === studentId
    );
    
    if (!studentRecord) {
      return res.status(404).json({ 
        error: 'You are not in this attendance record' 
      });
    }
    
    const correctionRequest = await AttendanceCorrectionRequest.create({
      studentId,
      attendanceId,
      section: attendance.section,
      subject: attendance.subject,
      date: attendance.date,
      time: attendance.time,
      currentStatus: studentRecord.status,
      requestedStatus,
      reason,
      proofUrl: proofUrl || '',
      status: 'PENDING'
    });
    
    res.status(201).json({
      message: 'Correction request submitted successfully',
      request: correctionRequest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get Pending Correction Requests (Teacher/Admin)
 * GET /api/attendance/correction-requests/pending
 */
async function getPendingCorrectionRequests(req, res) {
  try {
    const { section, limit = 50 } = req.query;
    
    let requests;
    if (section) {
      requests = await AttendanceCorrectionRequest.getPendingForSection(
        section,
        parseInt(limit)
      );
    } else {
      requests = await AttendanceCorrectionRequest.find({ status: 'PENDING' })
        .populate('studentId', 'name rollNumber imageURL')
        .populate('attendanceId')
        .sort({ requestedAt: -1 })
        .limit(parseInt(limit));
    }
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Approve/Reject Correction Request
 * PUT /api/attendance/correction-request/:requestId
 */
async function reviewCorrectionRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { status, reviewComments } = req.body;
    const userId = req.user.id;
    const userType = req.user.role;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const request = await AttendanceCorrectionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Correction request not found' });
    }
    
    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request already reviewed' });
    }
    
    // Get user name
    let userName = '';
    if (userType === 'admin') {
      const admin = await Admin.findById(userId);
      userName = admin?.name || 'Admin';
    } else if (userType === 'teacher') {
      const teacher = await Teacher.findById(userId);
      userName = teacher?.name || 'Teacher';
    }
    
    request.status = status;
    request.reviewedBy = {
      userId,
      userType,
      userName
    };
    request.reviewDate = new Date();
    request.reviewComments = reviewComments || '';
    
    await request.save();
    
    // If approved, update the attendance record
    if (status === 'APPROVED') {
      const attendance = await Attendance.findById(request.attendanceId);
      if (attendance) {
        const studentIndex = attendance.students.findIndex(
          s => s.studentId.toString() === request.studentId.toString()
        );
        
        if (studentIndex !== -1) {
          const beforeStatus = attendance.students[studentIndex].status;
          attendance.students[studentIndex].status = request.requestedStatus;
          
          attendance.lastModifiedBy = {
            userId,
            userType,
            userName
          };
          attendance.lastModifiedAt = new Date();
          attendance.overrideReason = `Correction request approved: ${request.reason}`;
          
          await attendance.save();
          
          // Update student model
          await Student.findOneAndUpdate(
            {
              _id: request.studentId,
              'attendance.subject': attendance.subject,
              'attendance.date': attendance.date
            },
            {
              $set: { 'attendance.$.status': request.requestedStatus }
            }
          );
          
          // Create audit log
          await AuditLog.log({
            action: 'CORRECTION_APPROVED',
            entityType: 'ATTENDANCE',
            entityId: attendance._id,
            performedBy: {
              userId,
              userType,
              userName
            },
            context: {
              section: attendance.section,
              subject: attendance.subject,
              date: attendance.date,
              time: attendance.time,
              studentId: request.studentId
            },
            changes: {
              before: { status: beforeStatus },
              after: { status: request.requestedStatus }
            },
            reason: `Correction request: ${request.reason}`,
            ipAddress: req.ip
          });
        }
      }
    } else {
      // Log rejection
      await AuditLog.log({
        action: 'CORRECTION_REJECTED',
        entityType: 'ATTENDANCE',
        entityId: request.attendanceId,
        performedBy: {
          userId,
          userType,
          userName
        },
        context: {
          studentId: request.studentId
        },
        reason: reviewComments || 'Correction request rejected',
        ipAddress: req.ip
      });
    }
    
    res.json({
      message: `Correction request ${status.toLowerCase()}`,
      request
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Check if student is on leave for attendance calculation
 * GET /api/attendance/leave-status/:studentId/:date
 */
async function getLeaveStatus(req, res) {
  try {
    const { studentId, date } = req.params;
    
    const isOnLeave = await Leave.isOnLeave(studentId, new Date(date));
    
    res.json({ isOnLeave });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  hodOverrideAttendance,
  lockAttendance,
  unlockAttendance,
  getAuditTrail,
  getSectionAuditLogs,
  submitCorrectionRequest,
  getPendingCorrectionRequests,
  reviewCorrectionRequest,
  getLeaveStatus
};
