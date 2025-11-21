const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Department = require('../models/Department');
const Section = require('../models/Section');
const LoginLog = require('../models/LoginLog');

// Get department-wise student distribution
router.get('/departments/students', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).select('name code');
    
    const data = await Promise.all(departments.map(async (dept) => {
      const count = await Student.countDocuments({ 
        departmentId: dept._id, 
        isActive: true 
      });
      return {
        department: dept.name,
        code: dept.code,
        studentCount: count
      };
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance analytics
router.get('/attendance/overview', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const students = await Student.find({ isActive: true }).select('attendance name');
    
    const attendanceData = students.map(student => {
      const total = student.attendance.length;
      const present = student.attendance.filter(a => a.status === 'present').length;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      
      return {
        studentName: student.name,
        total,
        present,
        percentage: parseFloat(percentage.toFixed(2))
      };
    });

    // Calculate ranges for chart
    const ranges = {
      'Below 65%': attendanceData.filter(d => d.percentage < 65).length,
      '65-75%': attendanceData.filter(d => d.percentage >= 65 && d.percentage < 75).length,
      '75-85%': attendanceData.filter(d => d.percentage >= 75 && d.percentage < 85).length,
      'Above 85%': attendanceData.filter(d => d.percentage >= 85).length
    };

    res.json({
      students: attendanceData,
      ranges
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top performing students
router.get('/performance/top', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const students = await Student.find({ isActive: true })
      .select('name rollNumber results departmentId sectionId')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name');
    
    const studentsWithAvg = students.map(student => {
      const totalMarks = student.results.reduce((sum, r) => sum + r.marks, 0);
      const avgMarks = student.results.length > 0 ? totalMarks / student.results.length : 0;
      
      return {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.departmentId?.name,
        section: student.sectionId?.name,
        averageMarks: parseFloat(avgMarks.toFixed(2)),
        totalSubjects: student.results.length
      };
    });

    // Sort by average marks and get top performers
    const topPerformers = studentsWithAvg
      .sort((a, b) => b.averageMarks - a.averageMarks)
      .slice(0, limit);

    res.json(topPerformers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get backlog statistics
router.get('/backlogs/stats', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .select('backlogCount departmentId')
      .populate('departmentId', 'name');
    
    const stats = {
      total: students.length,
      withBacklogs: students.filter(s => s.backlogCount > 0).length,
      withoutBacklogs: students.filter(s => s.backlogCount === 0).length,
      byDepartment: {}
    };

    // Group by department
    students.forEach(student => {
      const deptName = student.departmentId?.name || 'Unknown';
      if (!stats.byDepartment[deptName]) {
        stats.byDepartment[deptName] = {
          total: 0,
          withBacklogs: 0
        };
      }
      stats.byDepartment[deptName].total++;
      if (student.backlogCount > 0) {
        stats.byDepartment[deptName].withBacklogs++;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get at-risk students analytics
router.get('/risk/overview', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const atRiskStudents = await Student.find({ atRisk: true, isActive: true })
      .select('name rollNumber departmentId sectionId attendance results backlogCount remarks')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name');
    
    const riskData = atRiskStudents.map(student => {
      const attendance = student.attendance.length > 0 
        ? (student.attendance.filter(a => a.status === 'present').length / student.attendance.length) * 100 
        : 0;
      
      const avgMarks = student.results.length > 0
        ? student.results.reduce((sum, r) => sum + r.marks, 0) / student.results.length
        : 0;
      
      const negativeRemarks = student.remarks.filter(r => r.type === 'negative').length;
      
      return {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.departmentId?.name,
        section: student.sectionId?.name,
        attendancePercentage: parseFloat(attendance.toFixed(2)),
        averageMarks: parseFloat(avgMarks.toFixed(2)),
        backlogCount: student.backlogCount,
        negativeRemarks,
        riskFactors: []
      };
    });

    // Identify risk factors
    riskData.forEach(student => {
      if (student.attendancePercentage < 65) {
        student.riskFactors.push('Low Attendance');
      }
      if (student.backlogCount > 2) {
        student.riskFactors.push('Multiple Backlogs');
      }
      if (student.negativeRemarks > 3) {
        student.riskFactors.push('Behavioral Issues');
      }
      if (student.averageMarks < 40) {
        student.riskFactors.push('Poor Performance');
      }
    });

    res.json({
      total: atRiskStudents.length,
      students: riskData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get login activity analytics
router.get('/login/activity', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await LoginLog.find({
      timestamp: { $gte: startDate }
    }).select('role status timestamp');
    
    // Group by date and role
    const activityByDate = {};
    
    logs.forEach(log => {
      const date = log.timestamp.toISOString().split('T')[0];
      if (!activityByDate[date]) {
        activityByDate[date] = {
          date,
          student: { success: 0, failed: 0 },
          teacher: { success: 0, failed: 0 },
          admin: { success: 0, failed: 0 }
        };
      }
      
      if (log.status === 'success') {
        activityByDate[date][log.role].success++;
      } else {
        activityByDate[date][log.role].failed++;
      }
    });
    
    const result = Object.values(activityByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get behavior trends
router.get('/behavior/trends', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const students = await Student.find({ isActive: true }).select('remarks');
    
    const trends = {
      positive: 0,
      negative: 0,
      neutral: 0,
      totalStudentsWithRemarks: 0,
      studentsWithNegativeRemarks: 0
    };
    
    students.forEach(student => {
      if (student.remarks.length > 0) {
        trends.totalStudentsWithRemarks++;
        
        student.remarks.forEach(remark => {
          trends[remark.type]++;
        });
        
        if (student.remarks.some(r => r.type === 'negative')) {
          trends.studentsWithNegativeRemarks++;
        }
      }
    });
    
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get section-wise analytics (for teachers)
router.get('/section/:sectionId/overview', auth, roleCheck(['teacher', 'admin']), async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId).populate('departmentId', 'name');
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const students = await Student.find({ 
      sectionId: req.params.sectionId, 
      isActive: true 
    }).select('name attendance results backlogCount atRisk');

    const analytics = {
      section: {
        id: section._id,
        name: section.name,
        department: section.departmentId?.name
      },
      totalStudents: students.length,
      averageAttendance: 0,
      averageMarks: 0,
      studentsAtRisk: students.filter(s => s.atRisk).length,
      studentsWithBacklogs: students.filter(s => s.backlogCount > 0).length
    };

    // Calculate averages
    let totalAttendance = 0;
    let totalMarks = 0;
    let totalAttendanceRecords = 0;
    let totalResultRecords = 0;

    students.forEach(student => {
      if (student.attendance.length > 0) {
        const present = student.attendance.filter(a => a.status === 'present').length;
        totalAttendance += (present / student.attendance.length) * 100;
        totalAttendanceRecords++;
      }
      
      if (student.results.length > 0) {
        const avg = student.results.reduce((sum, r) => sum + r.marks, 0) / student.results.length;
        totalMarks += avg;
        totalResultRecords++;
      }
    });

    analytics.averageAttendance = totalAttendanceRecords > 0 
      ? parseFloat((totalAttendance / totalAttendanceRecords).toFixed(2))
      : 0;
    
    analytics.averageMarks = totalResultRecords > 0
      ? parseFloat((totalMarks / totalResultRecords).toFixed(2))
      : 0;

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
