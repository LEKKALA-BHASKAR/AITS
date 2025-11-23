const StudentTimeline = require('../models/StudentTimeline');

/**
 * Student Timeline Controller
 * Chronological feed of all student events
 */

// Get student timeline
const getTimeline = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      eventType,
      startDate,
      endDate,
      impact,
      severity,
      tags,
      limit = 100,
      skip = 0
    } = req.query;
    
    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      viewerRole: req.user?.role
    };
    
    if (eventType) options.eventType = eventType.split(',');
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (impact) options.impact = impact;
    if (severity) options.severity = severity;
    if (tags) options.tags = tags.split(',');
    
    const timeline = await StudentTimeline.getTimeline(studentId, options);
    
    res.json({
      success: true,
      count: timeline.length,
      timeline
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get timeline summary
const getTimelineSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;
    
    const summary = await StudentTimeline.getTimelineSummary(studentId, parseInt(days));
    
    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching timeline summary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add timeline event manually
const addTimelineEvent = async (req, res) => {
  try {
    const {
      studentId,
      eventType,
      title,
      description,
      impact,
      severity,
      context,
      tags
    } = req.body;
    
    const event = await StudentTimeline.addEvent({
      studentId,
      eventType,
      title,
      description,
      impact: impact || 'neutral',
      severity: severity || 'info',
      context,
      tags,
      triggeredBy: {
        userId: req.user.id,
        userName: req.user.name,
        userType: req.user.role
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Timeline event added',
      event
    });
  } catch (error) {
    console.error('Error adding timeline event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get timeline by event type
const getTimelineByType = async (req, res) => {
  try {
    const { studentId, eventType } = req.params;
    const { limit = 50 } = req.query;
    
    const timeline = await StudentTimeline.getTimeline(studentId, {
      eventType: [eventType],
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      eventType,
      count: timeline.length,
      timeline
    });
  } catch (error) {
    console.error('Error fetching timeline by type:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get critical events
const getCriticalEvents = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const criticalEvents = await StudentTimeline.find({
      studentId,
      severity: 'critical',
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });
    
    res.json({
      success: true,
      count: criticalEvents.length,
      events: criticalEvents
    });
  } catch (error) {
    console.error('Error fetching critical events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTimeline,
  getTimelineSummary,
  addTimelineEvent,
  getTimelineByType,
  getCriticalEvents
};
