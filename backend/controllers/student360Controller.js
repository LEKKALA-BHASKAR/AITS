const Student = require('../models/Student');
const Remark = require('../models/Remark');
const Attendance = require('../models/Attendance');
const Section = require('../models/Section');
const Department = require('../models/Department');

/**
 * Student 360° Profile Controller
 * Provides comprehensive student profile with academic, behavioral, and risk analysis
 */

// Get complete 360° profile for a student
exports.getStudent360Profile = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Authorization check
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    // Fetch student with populated references
    const student = await Student.findById(studentId)
      .populate('departmentId', 'name code')
      .populate('sectionId', 'name classTeacher')
      .lean();
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get behavior summary from Remark model
    const behaviorSummary = await Remark.getStudentSummary(studentId);
    
    // Get attendance analytics
    const attendanceAnalytics = await calculateAttendanceAnalytics(studentId);
    
    // Get academic performance
    const academicPerformance = calculateAcademicPerformance(student);
    
    // Calculate risk analysis
    const riskAnalysis = calculateRiskAnalysis({
      attendance: attendanceAnalytics,
      academic: academicPerformance,
      behavior: behaviorSummary,
      backlogCount: student.backlogCount || 0
    });
    
    // Get recent activity
    const recentActivity = await getRecentActivity(studentId);
    
    res.json({
      profile: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        phone: student.phone,
        imageURL: student.imageURL,
        department: student.departmentId,
        section: student.sectionId,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        isActive: student.isActive,
        lastLogin: student.lastLogin
      },
      academicOverview: academicPerformance,
      attendanceOverview: attendanceAnalytics,
      behaviorOverview: behaviorSummary,
      riskAnalysis,
      achievements: student.achievements || [],
      certificates: student.certificates || [],
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching 360° profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get risk analysis for multiple students (Admin/Teacher)
exports.getBatchRiskAnalysis = async (req, res) => {
  try {
    const { sectionId, departmentId } = req.query;
    
    let query = { isActive: true };
    if (sectionId) query.sectionId = sectionId;
    if (departmentId) query.departmentId = departmentId;
    
    const students = await Student.find(query)
      .select('name rollNumber email sectionId departmentId backlogCount atRisk')
      .lean();
    
    const riskProfiles = await Promise.all(
      students.map(async (student) => {
        const behaviorSummary = await Remark.getStudentSummary(student._id);
        const attendanceAnalytics = await calculateAttendanceAnalytics(student._id);
        const academicPerformance = calculateAcademicPerformance(student);
        
        const riskAnalysis = calculateRiskAnalysis({
          attendance: attendanceAnalytics,
          academic: academicPerformance,
          behavior: behaviorSummary,
          backlogCount: student.backlogCount || 0
        });
        
        return {
          studentId: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          riskLevel: riskAnalysis.riskLevel,
          riskScore: riskAnalysis.totalRiskScore,
          factors: riskAnalysis.riskFactors,
          atRisk: riskAnalysis.riskLevel === 'high' || riskAnalysis.riskLevel === 'critical'
        };
      })
    );
    
    // Sort by risk score descending
    riskProfiles.sort((a, b) => b.riskScore - a.riskScore);
    
    // Statistics
    const stats = {
      total: riskProfiles.length,
      critical: riskProfiles.filter(s => s.riskLevel === 'critical').length,
      high: riskProfiles.filter(s => s.riskLevel === 'high').length,
      medium: riskProfiles.filter(s => s.riskLevel === 'medium').length,
      low: riskProfiles.filter(s => s.riskLevel === 'low').length
    };
    
    res.json({
      students: riskProfiles,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching batch risk analysis:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get subject-wise performance chart data
exports.getSubjectPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;
    
    const student = await Student.findById(studentId).select('results');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    let results = student.results || [];
    if (semester) {
      results = results.filter(r => r.semester === parseInt(semester));
    }
    
    // Group by subject and calculate averages
    const subjectMap = new Map();
    results.forEach(result => {
      if (!subjectMap.has(result.subject)) {
        subjectMap.set(result.subject, {
          subject: result.subject,
          marks: [],
          totalMarks: 0,
          count: 0
        });
      }
      const subj = subjectMap.get(result.subject);
      subj.marks.push({ marks: result.marks, examType: result.examType, semester: result.semester });
      subj.totalMarks += result.marks;
      subj.count++;
    });
    
    const subjectPerformance = Array.from(subjectMap.values()).map(subj => ({
      subject: subj.subject,
      averageMarks: (subj.totalMarks / subj.count).toFixed(2),
      exams: subj.marks
    }));
    
    res.json({ subjectPerformance });
  } catch (error) {
    console.error('Error fetching subject performance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper Functions

async function calculateAttendanceAnalytics(studentId) {
  try {
    // Get all attendance records for the student
    const attendanceRecords = await Attendance.find({
      'students.studentId': studentId
    }).lean();
    
    if (attendanceRecords.length === 0) {
      return {
        overallPercentage: 0,
        totalClasses: 0,
        attended: 0,
        absent: 0,
        bySubject: {},
        warning: true,
        message: 'No attendance records found'
      };
    }
    
    let totalClasses = 0;
    let attended = 0;
    const subjectMap = new Map();
    
    attendanceRecords.forEach(record => {
      const studentRecord = record.students.find(
        s => s.studentId.toString() === studentId.toString()
      );
      
      if (studentRecord) {
        totalClasses++;
        if (studentRecord.status === 'present' || studentRecord.status === 'late') {
          attended++;
        }
        
        // By subject
        if (!subjectMap.has(record.subject)) {
          subjectMap.set(record.subject, { total: 0, present: 0 });
        }
        const subj = subjectMap.get(record.subject);
        subj.total++;
        if (studentRecord.status === 'present' || studentRecord.status === 'late') {
          subj.present++;
        }
      }
    });
    
    const overallPercentage = totalClasses > 0 ? ((attended / totalClasses) * 100).toFixed(2) : 0;
    
    const bySubject = {};
    subjectMap.forEach((value, key) => {
      bySubject[key] = {
        total: value.total,
        present: value.present,
        percentage: ((value.present / value.total) * 100).toFixed(2)
      };
    });
    
    return {
      overallPercentage: parseFloat(overallPercentage),
      totalClasses,
      attended,
      absent: totalClasses - attended,
      bySubject,
      warning: overallPercentage < 75,
      critical: overallPercentage < 65
    };
  } catch (error) {
    console.error('Error calculating attendance analytics:', error);
    return {
      overallPercentage: 0,
      totalClasses: 0,
      attended: 0,
      absent: 0,
      bySubject: {},
      error: error.message
    };
  }
}

function calculateAcademicPerformance(student) {
  const results = student.results || [];
  
  if (results.length === 0) {
    return {
      averageMarks: 0,
      totalExams: 0,
      bySemester: {},
      grade: 'N/A',
      backlogCount: student.backlogCount || 0
    };
  }
  
  const totalMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0);
  const averageMarks = (totalMarks / results.length).toFixed(2);
  
  // Group by semester
  const bySemester = {};
  results.forEach(result => {
    if (!bySemester[result.semester]) {
      bySemester[result.semester] = { marks: [], average: 0 };
    }
    bySemester[result.semester].marks.push(result.marks);
  });
  
  Object.keys(bySemester).forEach(sem => {
    const marks = bySemester[sem].marks;
    bySemester[sem].average = (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2);
  });
  
  // Calculate grade
  let grade = 'F';
  if (averageMarks >= 90) grade = 'A+';
  else if (averageMarks >= 80) grade = 'A';
  else if (averageMarks >= 70) grade = 'B+';
  else if (averageMarks >= 60) grade = 'B';
  else if (averageMarks >= 50) grade = 'C';
  else if (averageMarks >= 40) grade = 'D';
  
  return {
    averageMarks: parseFloat(averageMarks),
    totalExams: results.length,
    bySemester,
    grade,
    backlogCount: student.backlogCount || 0
  };
}

function calculateRiskAnalysis({ attendance, academic, behavior, backlogCount }) {
  let totalRiskScore = 0;
  const riskFactors = [];
  
  // Attendance risk (0-30 points)
  if (attendance.overallPercentage < 50) {
    totalRiskScore += 30;
    riskFactors.push({ factor: 'Critical Attendance', severity: 'critical', score: 30 });
  } else if (attendance.overallPercentage < 65) {
    totalRiskScore += 20;
    riskFactors.push({ factor: 'Low Attendance', severity: 'high', score: 20 });
  } else if (attendance.overallPercentage < 75) {
    totalRiskScore += 10;
    riskFactors.push({ factor: 'Below Target Attendance', severity: 'medium', score: 10 });
  }
  
  // Academic risk (0-25 points)
  if (academic.averageMarks < 35) {
    totalRiskScore += 25;
    riskFactors.push({ factor: 'Critical Academic Performance', severity: 'critical', score: 25 });
  } else if (academic.averageMarks < 50) {
    totalRiskScore += 15;
    riskFactors.push({ factor: 'Poor Academic Performance', severity: 'high', score: 15 });
  } else if (academic.averageMarks < 60) {
    totalRiskScore += 8;
    riskFactors.push({ factor: 'Below Average Performance', severity: 'medium', score: 8 });
  }
  
  // Backlog risk (0-20 points)
  if (backlogCount > 5) {
    totalRiskScore += 20;
    riskFactors.push({ factor: `${backlogCount} Backlogs`, severity: 'critical', score: 20 });
  } else if (backlogCount > 2) {
    totalRiskScore += 12;
    riskFactors.push({ factor: `${backlogCount} Backlogs`, severity: 'high', score: 12 });
  } else if (backlogCount > 0) {
    totalRiskScore += 5;
    riskFactors.push({ factor: `${backlogCount} Backlog(s)`, severity: 'medium', score: 5 });
  }
  
  // Behavior risk (0-25 points)
  if (behavior.riskScore > 50) {
    totalRiskScore += 25;
    riskFactors.push({ factor: 'Severe Behavior Issues', severity: 'critical', score: 25 });
  } else if (behavior.riskScore > 30) {
    totalRiskScore += 15;
    riskFactors.push({ factor: 'Behavior Concerns', severity: 'high', score: 15 });
  } else if (behavior.riskScore > 15) {
    totalRiskScore += 8;
    riskFactors.push({ factor: 'Minor Behavior Issues', severity: 'medium', score: 8 });
  }
  
  if (behavior.negative > 5) {
    totalRiskScore += 10;
    riskFactors.push({ factor: `${behavior.negative} Negative Remarks`, severity: 'high', score: 10 });
  }
  
  // Determine risk level
  let riskLevel = 'low';
  let riskColor = 'green';
  if (totalRiskScore >= 60) {
    riskLevel = 'critical';
    riskColor = 'red';
  } else if (totalRiskScore >= 40) {
    riskLevel = 'high';
    riskColor = 'orange';
  } else if (totalRiskScore >= 20) {
    riskLevel = 'medium';
    riskColor = 'yellow';
  }
  
  return {
    totalRiskScore,
    riskLevel,
    riskColor,
    riskFactors,
    recommendation: getRiskRecommendation(riskLevel, riskFactors)
  };
}

function getRiskRecommendation(riskLevel, riskFactors) {
  if (riskLevel === 'critical') {
    return 'Immediate intervention required. Schedule counseling session and notify guardian.';
  } else if (riskLevel === 'high') {
    return 'Close monitoring needed. Consider mentor assignment and academic support.';
  } else if (riskLevel === 'medium') {
    return 'Regular follow-up recommended. Encourage improvement in identified areas.';
  }
  return 'Student performing well. Continue regular monitoring.';
}

async function getRecentActivity(studentId) {
  try {
    // Get recent remarks (last 5)
    const recentRemarks = await Remark.find({ studentId, isVisible: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type category createdAt')
      .lean();
    
    // Get recent attendance (last 10)
    const recentAttendance = await Attendance.find({
      'students.studentId': studentId
    })
      .sort({ date: -1 })
      .limit(10)
      .select('subject date students')
      .lean();
    
    const attendanceActivity = recentAttendance.map(record => {
      const studentRecord = record.students.find(
        s => s.studentId.toString() === studentId.toString()
      );
      return {
        type: 'attendance',
        subject: record.subject,
        date: record.date,
        status: studentRecord?.status || 'absent'
      };
    });
    
    return {
      recentRemarks,
      recentAttendance: attendanceActivity
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      recentRemarks: [],
      recentAttendance: []
    };
  }
}

module.exports = exports;
