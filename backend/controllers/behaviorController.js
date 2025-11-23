const BehaviorLog = require('../models/BehaviorLog');
const StudentTimeline = require('../models/StudentTimeline');

/**
 * Behavior Tracking Controller
 * Manages behavior logs and tracking
 */

// Add behavior log
const addBehaviorLog = async (req, res) => {
  try {
    const {
      studentId,
      date,
      dayOfWeek,
      timeSlot,
      subjectId,
      subjectName,
      teacherId,
      teacherName,
      sectionId,
      behaviorType,
      behaviorScore,
      description,
      severity,
      engagementLevel,
      actionTaken
    } = req.body;
    
    const behaviorLog = await BehaviorLog.create({
      studentId,
      date: date || new Date(),
      dayOfWeek: dayOfWeek || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      timeSlot,
      subjectId,
      subjectName,
      teacherId,
      teacherName,
      sectionId,
      behaviorType,
      behaviorScore: behaviorScore || 0,
      description,
      severity: severity || 'medium',
      engagementLevel: engagementLevel || 'medium',
      actionTaken,
      createdBy: req.user?.id,
      createdByModel: req.user?.role === 'teacher' ? 'Teacher' : 'Admin'
    });
    
    // Add to timeline
    await StudentTimeline.addEvent({
      studentId,
      eventType: 'behavior_logged',
      title: `Behavior Logged: ${behaviorType}`,
      description: description || `Behavior type: ${behaviorType}, Score: ${behaviorScore}`,
      impact: behaviorScore >= 0 ? 'positive' : 'negative',
      severity: severity === 'critical' ? 'critical' : severity === 'high' ? 'alert' : 'info',
      context: {
        subject: subjectName,
        section: sectionId
      },
      relatedTo: {
        entityType: 'BehaviorLog',
        entityId: behaviorLog._id
      },
      triggeredBy: {
        userId: req.user?.id,
        userName: req.user?.name || 'Unknown',
        userType: req.user?.role || 'teacher'
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Behavior log added successfully',
      behaviorLog
    });
  } catch (error) {
    console.error('Error adding behavior log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get behavior logs for a student
const getBehaviorLogs = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;
    
    const query = { studentId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const behaviorLogs = await BehaviorLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
    
    res.json({
      success: true,
      count: behaviorLogs.length,
      behaviorLogs
    });
  } catch (error) {
    console.error('Error fetching behavior logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update engagement level
const updateEngagementLevel = async (req, res) => {
  try {
    const { logId } = req.params;
    const { engagementLevel } = req.body;
    
    const behaviorLog = await BehaviorLog.findByIdAndUpdate(
      logId,
      { engagementLevel },
      { new: true }
    );
    
    if (!behaviorLog) {
      return res.status(404).json({ message: 'Behavior log not found' });
    }
    
    res.json({
      success: true,
      message: 'Engagement level updated',
      behaviorLog
    });
  } catch (error) {
    console.error('Error updating engagement level:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Batch add engagement levels for a session
const batchAddEngagement = async (req, res) => {
  try {
    const { sessionDate, sectionId, timeSlot, subjectName, engagementData } = req.body;
    
    // engagementData should be array of { studentId, engagementLevel }
    const behaviorLogs = [];
    
    for (const data of engagementData) {
      const log = await BehaviorLog.create({
        studentId: data.studentId,
        date: sessionDate || new Date(),
        dayOfWeek: new Date(sessionDate || new Date()).toLocaleDateString('en-US', { weekday: 'long' }),
        timeSlot,
        subjectName,
        sectionId,
        behaviorType: 'participation',
        behaviorScore: data.engagementLevel === 'high' ? 5 : data.engagementLevel === 'medium' ? 3 : data.engagementLevel === 'low' ? 1 : -3,
        engagementLevel: data.engagementLevel,
        teacherId: req.user?.id,
        teacherName: req.user?.name,
        createdBy: req.user?.id,
        createdByModel: 'Teacher'
      });
      
      behaviorLogs.push(log);
    }
    
    res.status(201).json({
      success: true,
      message: `Engagement levels recorded for ${behaviorLogs.length} students`,
      count: behaviorLogs.length
    });
  } catch (error) {
    console.error('Error batch adding engagement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addBehaviorLog,
  getBehaviorLogs,
  updateEngagementLevel,
  batchAddEngagement
};
