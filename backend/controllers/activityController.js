const StudentActivity = require('../models/StudentActivity');
const StudentTimeline = require('../models/StudentTimeline');

/**
 * Student Activity Controller
 * Track and manage student activities
 */

// Add student activity
const addActivity = async (req, res) => {
  try {
    const {
      studentId,
      activityType,
      activityName,
      description,
      relatedTo,
      points,
      date,
      duration,
      location,
      platform,
      outcome,
      tags,
      attachments
    } = req.body;
    
    const activity = await StudentActivity.create({
      studentId,
      activityType,
      activityName,
      description,
      relatedTo,
      points: points || 0,
      date: date || new Date(),
      duration,
      location,
      platform: platform || 'web',
      outcome: outcome || 'completed',
      tags: tags || [],
      attachments: attachments || []
    });
    
    // Add to timeline
    await StudentTimeline.addEvent({
      studentId,
      eventType: 'activity_recorded',
      title: `Activity: ${activityName || activityType}`,
      description: description || `${activityType} activity recorded`,
      impact: 'positive',
      severity: 'info',
      relatedTo: {
        entityType: 'StudentActivity',
        entityId: activity._id
      },
      triggeredBy: {
        userId: req.user?.id,
        userName: req.user?.name || 'System',
        userType: req.user?.role || 'system'
      },
      tags: tags || []
    });
    
    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      activity
    });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get activities for a student
const getActivities = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, activityType, limit = 50 } = req.query;
    
    const query = { studentId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (activityType) query.activityType = activityType;
    
    const activities = await StudentActivity.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get activity summary
const getActivitySummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const summary = await StudentActivity.getActivitySummary(studentId, startDate, endDate);
    
    res.json({
      success: true,
      period: { startDate, endDate, days },
      summary
    });
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get activity streak
const getActivityStreak = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const streak = await StudentActivity.getActivityStreak(studentId);
    
    res.json({
      success: true,
      streak
    });
  } catch (error) {
    console.error('Error fetching activity streak:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify activity
const verifyActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    
    const activity = await StudentActivity.findByIdAndUpdate(
      activityId,
      {
        isVerified: true,
        verifiedBy: req.user.id,
        verifiedByModel: req.user.role === 'teacher' ? 'Teacher' : 'Admin'
      },
      { new: true }
    );
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.json({
      success: true,
      message: 'Activity verified successfully',
      activity
    });
  } catch (error) {
    console.error('Error verifying activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addActivity,
  getActivities,
  getActivitySummary,
  getActivityStreak,
  verifyActivity
};
