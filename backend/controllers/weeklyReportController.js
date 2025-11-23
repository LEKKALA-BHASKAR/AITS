const WeeklyReport = require('../models/WeeklyReport');
const StudentTimeline = require('../models/StudentTimeline');
const MonitoringScore = require('../models/MonitoringScore');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const BehaviorLog = require('../models/BehaviorLog');
const StudentActivity = require('../models/StudentActivity');
const Remark = require('../models/Remark');

/**
 * Weekly Report Controller
 * Auto-generate comprehensive weekly reports
 */

// Generate weekly report for a student
const generateWeeklyReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { weekStartDate, weekEndDate } = req.body;
    
    const startDate = new Date(weekStartDate);
    const endDate = new Date(weekEndDate);
    
    // Check if report already exists
    const existingReport = await WeeklyReport.findOne({
      studentId,
      weekStartDate: startDate,
      weekEndDate: endDate
    });
    
    if (existingReport) {
      return res.json({
        success: true,
        message: 'Report already exists',
        report: existingReport
      });
    }
    
    // Get monitoring score
    const monitoringScore = await MonitoringScore.findOne({ studentId });
    
    // Get attendance data
    const attendanceRecords = await Attendance.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const totalClasses = attendanceRecords.length;
    const attended = attendanceRecords.filter(a => a.status === 'present').length;
    const absent = attendanceRecords.filter(a => a.status === 'absent').length;
    const late = attendanceRecords.filter(a => a.status === 'late').length;
    const attendancePercentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 0;
    
    // Subject-wise attendance
    const subjectWise = {};
    attendanceRecords.forEach(record => {
      if (!subjectWise[record.subject]) {
        subjectWise[record.subject] = { total: 0, attended: 0 };
      }
      subjectWise[record.subject].total++;
      if (record.status === 'present') {
        subjectWise[record.subject].attended++;
      }
    });
    
    const attendanceSubjectWise = Object.entries(subjectWise).map(([subject, data]) => ({
      subject,
      total: data.total,
      attended: data.attended,
      percentage: (data.attended / data.total) * 100
    }));
    
    // Get academic data
    const results = await Result.find({
      studentId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const exams = results.map(r => ({
      name: r.examType || 'Exam',
      subject: r.subject,
      marks: r.marks,
      maxMarks: 100,
      percentage: r.marks
    }));
    
    const averagePerformance = results.length > 0
      ? results.reduce((sum, r) => sum + r.marks, 0) / results.length
      : 0;
    
    // Get behavior logs
    const behaviorLogs = await BehaviorLog.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const behaviorData = behaviorLogs.map(b => ({
      date: b.date,
      type: b.behaviorType,
      description: b.description,
      score: b.behaviorScore
    }));
    
    const patterns = {
      lateArrivals: behaviorLogs.filter(b => b.behaviorType === 'late').length,
      earlyExits: behaviorLogs.filter(b => b.behaviorType === 'early_exit').length,
      disruptiveBehavior: behaviorLogs.filter(b => b.behaviorType === 'disruptive').length,
      positiveParticipation: behaviorLogs.filter(b => b.behaviorType === 'participation').length
    };
    
    // Get activities
    const activities = await StudentActivity.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const activityList = activities.map(a => ({
      type: a.activityType,
      name: a.activityName,
      date: a.date,
      points: a.points
    }));
    
    const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
    
    // Get remarks
    const remarks = await Remark.find({
      studentId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('createdBy', 'name');
    
    const remarksList = remarks.map(r => ({
      type: r.type,
      category: r.category,
      description: r.description,
      date: r.createdAt,
      by: r.createdByName
    }));
    
    const positiveRemarks = remarks.filter(r => r.type === 'positive').length;
    const negativeRemarks = remarks.filter(r => r.type === 'negative').length;
    const neutralRemarks = remarks.filter(r => r.type === 'neutral').length;
    
    // Create report
    const report = await WeeklyReport.create({
      studentId,
      weekStartDate: startDate,
      weekEndDate: endDate,
      weekNumber: Math.ceil((endDate - startDate) / (7 * 24 * 60 * 60 * 1000)),
      summary: {
        overallScore: monitoringScore?.overallScore || 0,
        riskLevel: monitoringScore?.riskLevel || 'medium',
        attendancePercentage,
        averageMarks: averagePerformance,
        behaviorScore: monitoringScore?.components?.behaviorScore || 50,
        activitiesCount: activities.length,
        remarksCount: {
          positive: positiveRemarks,
          negative: negativeRemarks,
          neutral: neutralRemarks
        }
      },
      attendance: {
        totalClasses,
        attended,
        absent,
        late,
        percentage: attendancePercentage,
        subjectWise: attendanceSubjectWise
      },
      academic: {
        exams,
        assignments: [],
        averagePerformance
      },
      behavior: {
        logs: behaviorData,
        patterns
      },
      activities: {
        list: activityList,
        totalPoints
      },
      remarks: {
        all: remarksList,
        summary: `${positiveRemarks} positive, ${negativeRemarks} negative, ${neutralRemarks} neutral remarks`
      },
      status: 'generated',
      generatedBy: req.user?.name || 'system',
      generatedAt: new Date()
    });
    
    // Generate suggestions and concerns
    report.generateSuggestions();
    report.identifyConcerns();
    report.identifyStrengths();
    await report.save();
    
    // Add to timeline
    await StudentTimeline.addEvent({
      studentId,
      eventType: 'weekly_report_generated',
      title: 'Weekly Report Generated',
      description: `Report for week ${report.weekNumber}`,
      impact: 'neutral',
      severity: 'info',
      relatedTo: {
        entityType: 'WeeklyReport',
        entityId: report._id
      },
      triggeredBy: {
        userId: req.user?.id,
        userName: req.user?.name || 'System',
        userType: req.user?.role || 'system'
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Weekly report generated successfully',
      report
    });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get weekly report by ID
const getWeeklyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await WeeklyReport.findById(reportId)
      .populate('studentId', 'name rollNumber email imageURL');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reports for a student
const getStudentReports = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 10 } = req.query;
    
    const reports = await WeeklyReport.find({ studentId })
      .sort({ weekStartDate: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error fetching student reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending email reports
const getPendingEmails = async (req, res) => {
  try {
    const reports = await WeeklyReport.getPendingEmails();
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Error fetching pending emails:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark report as sent
const markReportSent = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { emailRecipients } = req.body;
    
    const report = await WeeklyReport.findByIdAndUpdate(
      reportId,
      {
        emailSent: true,
        emailSentAt: new Date(),
        emailRecipients: emailRecipients || [],
        status: 'sent'
      },
      { new: true }
    );
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({
      success: true,
      message: 'Report marked as sent',
      report
    });
  } catch (error) {
    console.error('Error marking report sent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  generateWeeklyReport,
  getWeeklyReport,
  getStudentReports,
  getPendingEmails,
  markReportSent
};
