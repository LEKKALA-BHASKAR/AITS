const Student = require('../models/Student');
const MonitoringScore = require('../models/MonitoringScore');
const BehaviorLog = require('../models/BehaviorLog');
const StudentActivity = require('../models/StudentActivity');
const Remark = require('../models/Remark');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const StudentTimeline = require('../models/StudentTimeline');
const CounselingRecommendation = require('../models/CounselingRecommendation');

/**
 * Student Monitoring Controller
 * Comprehensive monitoring and analytics for student tracking
 */

// Calculate and update monitoring score for a student
const calculateMonitoringScore = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get or create monitoring score
    let monitoringScore = await MonitoringScore.findOne({ studentId });
    if (!monitoringScore) {
      monitoringScore = new MonitoringScore({ studentId });
    }
    
    // Calculate attendance score
    const attendanceRecords = await Attendance.find({ studentId });
    let attendancePercentage = 0;
    if (attendanceRecords.length > 0) {
      const totalClasses = attendanceRecords.length;
      const attended = attendanceRecords.filter(a => a.status === 'present').length;
      attendancePercentage = (attended / totalClasses) * 100;
    }
    monitoringScore.components.attendanceScore = Math.min(100, attendancePercentage);
    
    // Calculate academic score
    const results = await Result.find({ studentId }).sort({ createdAt: -1 }).limit(10);
    if (results.length > 0) {
      const avgMarks = results.reduce((sum, r) => sum + (r.marks || 0), 0) / results.length;
      monitoringScore.components.academicScore = Math.min(100, (avgMarks / 100) * 100);
    }
    
    // Calculate behavior score
    const behaviorLogs = await BehaviorLog.find({ studentId }).sort({ date: -1 }).limit(30);
    if (behaviorLogs.length > 0) {
      const avgBehaviorScore = behaviorLogs.reduce((sum, b) => sum + (b.behaviorScore || 0), 0) / behaviorLogs.length;
      // Convert from -10 to +10 scale to 0-100 scale
      monitoringScore.components.behaviorScore = Math.max(0, Math.min(100, ((avgBehaviorScore + 10) / 20) * 100));
    }
    
    // Calculate activity score
    const activities = await StudentActivity.find({ studentId }).sort({ date: -1 }).limit(30);
    const activityPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);
    monitoringScore.components.activityScore = Math.min(100, activityPoints / 2);
    
    // Calculate engagement score from remarks
    const remarks = await Remark.find({ studentId }).sort({ createdAt: -1 }).limit(20);
    const positiveRemarks = remarks.filter(r => r.type === 'positive').length;
    const negativeRemarks = remarks.filter(r => r.type === 'negative').length;
    const engagementScore = Math.max(0, Math.min(100, 50 + (positiveRemarks * 5) - (negativeRemarks * 5)));
    monitoringScore.components.engagementScore = engagementScore;
    
    // Calculate punctuality score
    const lateCount = behaviorLogs.filter(b => b.behaviorType === 'late').length;
    monitoringScore.components.punctualityScore = Math.max(0, 100 - (lateCount * 10));
    
    // Calculate overall score
    monitoringScore.calculateScore();
    
    // Generate alerts based on scores
    if (monitoringScore.components.attendanceScore < 65) {
      monitoringScore.addAlert('low_attendance', 'critical', 'Attendance below 65%');
    }
    if (monitoringScore.components.academicScore < 40) {
      monitoringScore.addAlert('poor_performance', 'high', 'Academic performance needs improvement');
    }
    if (monitoringScore.components.behaviorScore < 50) {
      monitoringScore.addAlert('behavior_concern', 'high', 'Behavior issues detected');
    }
    
    await monitoringScore.save();
    
    // Add timeline event
    await StudentTimeline.addEvent({
      studentId,
      eventType: 'monitoring_score_updated',
      title: 'Monitoring Score Updated',
      description: `Overall score: ${monitoringScore.overallScore}/100`,
      impact: monitoringScore.overallScore >= 75 ? 'positive' : monitoringScore.overallScore >= 50 ? 'neutral' : 'negative',
      severity: monitoringScore.riskLevel === 'critical' ? 'critical' : monitoringScore.riskLevel === 'high' ? 'alert' : 'info',
      triggeredBy: {
        userId: req.user?.id,
        userName: req.user?.name || 'System',
        userType: req.user?.role || 'system'
      }
    });
    
    res.json({
      success: true,
      monitoringScore
    });
  } catch (error) {
    console.error('Error calculating monitoring score:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get monitoring score for a student
const getMonitoringScore = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const monitoringScore = await MonitoringScore.findOne({ studentId })
      .populate('studentId', 'name rollNumber email imageURL');
    
    if (!monitoringScore) {
      return res.status(404).json({ message: 'Monitoring score not found. Please calculate first.' });
    }
    
    res.json({ success: true, monitoringScore });
  } catch (error) {
    console.error('Error fetching monitoring score:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get students by risk level
const getStudentsByRiskLevel = async (req, res) => {
  try {
    const { riskLevel } = req.params;
    const { limit = 50 } = req.query;
    
    const students = await MonitoringScore.getByRiskLevel(riskLevel, parseInt(limit));
    
    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Error fetching students by risk level:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get most improved students
const getMostImprovedStudents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const students = await MonitoringScore.getMostImproved(parseInt(limit));
    
    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Error fetching most improved students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get declining students
const getDecliningStudents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const students = await MonitoringScore.getDeclining(parseInt(limit));
    
    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Error fetching declining students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Detect early warnings for a student
const detectEarlyWarnings = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const warnings = [];
    
    // Check attendance
    const attendanceRecords = await Attendance.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    if (attendanceRecords.length > 0) {
      const attended = attendanceRecords.filter(a => a.status === 'present').length;
      const attendancePercentage = (attended / attendanceRecords.length) * 100;
      
      if (attendancePercentage < 65) {
        warnings.push({
          type: 'critical_attendance',
          severity: 'critical',
          message: `Attendance is critically low at ${attendancePercentage.toFixed(1)}%`,
          value: attendancePercentage
        });
      } else if (attendancePercentage < 75) {
        warnings.push({
          type: 'low_attendance',
          severity: 'high',
          message: `Attendance below required 75% (currently ${attendancePercentage.toFixed(1)}%)`,
          value: attendancePercentage
        });
      }
    }
    
    // Check negative remarks
    const negativeRemarks = await Remark.find({
      studentId,
      type: 'negative',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    if (negativeRemarks.length >= 5) {
      warnings.push({
        type: 'negative_remark_spike',
        severity: 'high',
        message: `${negativeRemarks.length} negative remarks in the last ${days} days`,
        value: negativeRemarks.length
      });
    }
    
    // Check behavior patterns
    const patterns = await BehaviorLog.detectPatterns(studentId, days);
    
    if (patterns.consistentLateArrival >= 3) {
      warnings.push({
        type: 'late_arrival_pattern',
        severity: 'medium',
        message: `Consistent late arrivals detected (${patterns.consistentLateArrival} times)`,
        value: patterns.consistentLateArrival
      });
    }
    
    if (patterns.fridayAbsences >= 2) {
      warnings.push({
        type: 'friday_absence_pattern',
        severity: 'medium',
        message: 'Pattern of Friday absences detected',
        value: patterns.fridayAbsences
      });
    }
    
    // Check activity level
    const activities = await StudentActivity.find({
      studentId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    if (activities.length === 0) {
      warnings.push({
        type: 'zero_activity',
        severity: 'medium',
        message: `No activities recorded in the last ${days} days`,
        value: 0
      });
    }
    
    // Check academic performance
    const recentResults = await Result.find({ studentId }).sort({ createdAt: -1 }).limit(5);
    if (recentResults.length >= 3) {
      const avgMarks = recentResults.reduce((sum, r) => sum + (r.marks || 0), 0) / recentResults.length;
      
      if (avgMarks < 40) {
        warnings.push({
          type: 'poor_academic_performance',
          severity: 'high',
          message: `Average marks below 40% (currently ${avgMarks.toFixed(1)}%)`,
          value: avgMarks
        });
      }
    }
    
    res.json({
      success: true,
      studentId,
      period: { startDate, endDate, days },
      warningCount: warnings.length,
      warnings
    });
  } catch (error) {
    console.error('Error detecting early warnings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get behavior heatmap data
const getBehaviorHeatmap = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const heatmapData = await BehaviorLog.getHeatmapData(studentId, startDate, endDate);
    
    res.json({
      success: true,
      studentId,
      period: { startDate, endDate, days },
      heatmapData
    });
  } catch (error) {
    console.error('Error fetching behavior heatmap:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Detect silent students in a section
const detectSilentStudents = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { days = 30 } = req.query;
    
    const silentStudents = await StudentActivity.detectSilentStudents(sectionId, parseInt(days));
    
    res.json({
      success: true,
      sectionId,
      days,
      count: silentStudents.length,
      silentStudents
    });
  } catch (error) {
    console.error('Error detecting silent students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Auto-generate counseling recommendations
const generateCounselingRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const monitoringScore = await MonitoringScore.findOne({ studentId });
    const recommendations = [];
    
    if (!monitoringScore) {
      return res.json({ success: true, recommendations: [] });
    }
    
    // Generate recommendations based on scores
    if (monitoringScore.components.attendanceScore < 65) {
      const existing = await CounselingRecommendation.findOne({
        studentId,
        recommendationType: 'attendance_improvement',
        'progress.status': { $in: ['pending', 'in_progress'] }
      });
      
      if (!existing) {
        const recommendation = await CounselingRecommendation.create({
          studentId,
          recommendationType: 'attendance_improvement',
          priority: 'urgent',
          reason: 'Critically low attendance percentage',
          description: `Student attendance is ${monitoringScore.components.attendanceScore.toFixed(1)}%, below required 75%`,
          triggerMetrics: {
            attendancePercentage: monitoringScore.components.attendanceScore,
            monitoringScore: monitoringScore.overallScore
          },
          patterns: [
            {
              type: 'low_attendance',
              severity: 'critical',
              description: 'Attendance below minimum threshold'
            }
          ]
        });
        recommendations.push(recommendation);
      }
    }
    
    if (monitoringScore.components.academicScore < 40) {
      const existing = await CounselingRecommendation.findOne({
        studentId,
        recommendationType: 'academic_support',
        'progress.status': { $in: ['pending', 'in_progress'] }
      });
      
      if (!existing) {
        const recommendation = await CounselingRecommendation.create({
          studentId,
          recommendationType: 'academic_support',
          priority: 'high',
          reason: 'Poor academic performance',
          description: `Academic score is ${monitoringScore.components.academicScore.toFixed(1)}%, needs immediate support`,
          triggerMetrics: {
            averageMarks: monitoringScore.components.academicScore,
            monitoringScore: monitoringScore.overallScore
          }
        });
        recommendations.push(recommendation);
      }
    }
    
    if (monitoringScore.components.behaviorScore < 50) {
      const existing = await CounselingRecommendation.findOne({
        studentId,
        recommendationType: 'behavioral_counseling',
        'progress.status': { $in: ['pending', 'in_progress'] }
      });
      
      if (!existing) {
        const recommendation = await CounselingRecommendation.create({
          studentId,
          recommendationType: 'behavioral_counseling',
          priority: 'high',
          reason: 'Behavior issues detected',
          description: 'Multiple negative behavior patterns identified',
          triggerMetrics: {
            behaviorScore: monitoringScore.components.behaviorScore,
            monitoringScore: monitoringScore.overallScore
          }
        });
        recommendations.push(recommendation);
      }
    }
    
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error generating counseling recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  calculateMonitoringScore,
  getMonitoringScore,
  getStudentsByRiskLevel,
  getMostImprovedStudents,
  getDecliningStudents,
  detectEarlyWarnings,
  getBehaviorHeatmap,
  detectSilentStudents,
  generateCounselingRecommendations
};
