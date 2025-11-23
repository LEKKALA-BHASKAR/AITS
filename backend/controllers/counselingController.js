const CounselingRecommendation = require('../models/CounselingRecommendation');
const StudentTimeline = require('../models/StudentTimeline');

/**
 * Counseling Recommendation Controller
 * Manage counseling recommendations and sessions
 */

// Get all counseling recommendations
const getAllRecommendations = async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    const query = {};
    if (status) query['progress.status'] = status;
    if (priority) query.priority = priority;
    
    const recommendations = await CounselingRecommendation.find(query)
      .populate('studentId', 'name rollNumber email imageURL')
      .sort({ priority: -1, createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommendations for a student
const getStudentRecommendations = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const recommendations = await CounselingRecommendation.find({ studentId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching student recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommendations by priority
const getByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    
    const recommendations = await CounselingRecommendation.getPendingByPriority(priority);
    
    res.json({
      success: true,
      priority,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations by priority:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get urgent recommendations
const getUrgentRecommendations = async (req, res) => {
  try {
    const recommendations = await CounselingRecommendation.getUrgent();
    
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching urgent recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get counselor's recommendations
const getCounselorRecommendations = async (req, res) => {
  try {
    const counselorId = req.user.id;
    
    const recommendations = await CounselingRecommendation.getForCounselor(counselorId);
    
    res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching counselor recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign counselor to recommendation
const assignCounselor = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { counselorId, counselorName } = req.body;
    
    const recommendation = await CounselingRecommendation.findById(recommendationId);
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    recommendation.assignCounselor(counselorId, counselorName);
    await recommendation.save();
    
    // Add to timeline
    await StudentTimeline.addEvent({
      studentId: recommendation.studentId,
      eventType: 'counseling_scheduled',
      title: 'Counseling Assigned',
      description: `Assigned to ${counselorName}`,
      impact: 'positive',
      severity: 'info',
      relatedTo: {
        entityType: 'CounselingRecommendation',
        entityId: recommendation._id
      },
      triggeredBy: {
        userId: req.user.id,
        userName: req.user.name,
        userType: req.user.role
      }
    });
    
    res.json({
      success: true,
      message: 'Counselor assigned successfully',
      recommendation
    });
  } catch (error) {
    console.error('Error assigning counselor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add counseling session
const addSession = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const {
      sessionDate,
      duration,
      notes,
      outcome,
      followUpRequired,
      nextSessionDate
    } = req.body;
    
    const recommendation = await CounselingRecommendation.findById(recommendationId);
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    recommendation.addSession({
      sessionDate: sessionDate || new Date(),
      duration,
      notes,
      outcome,
      followUpRequired: followUpRequired || false,
      nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
      conductedBy: {
        counselorId: req.user.id,
        counselorName: req.user.name
      }
    });
    
    await recommendation.save();
    
    // Add to timeline
    await StudentTimeline.addEvent({
      studentId: recommendation.studentId,
      eventType: 'counseling_completed',
      title: 'Counseling Session Completed',
      description: `Session conducted by ${req.user.name}`,
      impact: 'positive',
      severity: 'info',
      relatedTo: {
        entityType: 'CounselingRecommendation',
        entityId: recommendation._id
      },
      triggeredBy: {
        userId: req.user.id,
        userName: req.user.name,
        userType: req.user.role
      }
    });
    
    res.json({
      success: true,
      message: 'Session added successfully',
      recommendation
    });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark recommendation as resolved
const markResolved = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { summary, recommendations } = req.body;
    
    const recommendation = await CounselingRecommendation.findById(recommendationId);
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    recommendation.markResolved(summary, recommendations);
    await recommendation.save();
    
    res.json({
      success: true,
      message: 'Recommendation marked as resolved',
      recommendation
    });
  } catch (error) {
    console.error('Error marking resolved:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create manual recommendation
const createManualRecommendation = async (req, res) => {
  try {
    const {
      studentId,
      recommendationType,
      priority,
      reason,
      description,
      recommendedCounselor
    } = req.body;
    
    const recommendation = await CounselingRecommendation.create({
      studentId,
      recommendationType,
      priority,
      reason,
      description,
      isAutoGenerated: false,
      manuallyCreated: true,
      createdBy: {
        userId: req.user.id,
        userName: req.user.name,
        userType: req.user.role
      },
      recommendedCounselor
    });
    
    res.status(201).json({
      success: true,
      message: 'Counseling recommendation created',
      recommendation
    });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllRecommendations,
  getStudentRecommendations,
  getByPriority,
  getUrgentRecommendations,
  getCounselorRecommendations,
  assignCounselor,
  addSession,
  markResolved,
  createManualRecommendation
};
