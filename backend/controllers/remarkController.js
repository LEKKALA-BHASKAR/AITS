const Remark = require('../models/Remark');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

/**
 * Enhanced Remark Controller
 * Handles comprehensive student behavior and performance tracking
 */

// Get all remarks for a student with filtering and pagination
exports.getStudentRemarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type, category, severity, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    // Verify student exists
    const student = await Student.findById(studentId).select('name rollNumber');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Build query
    const query = { studentId, isVisible: true };
    if (type) query.type = type;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const remarks = await Remark.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Remark.countDocuments(query);
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber
      },
      remarks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching student remarks:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student behavior summary and statistics
exports.getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findById(studentId).select('name rollNumber atRisk');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const summary = await Remark.getStudentSummary(studentId);
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        atRisk: student.atRisk
      },
      summary
    });
  } catch (error) {
    console.error('Error fetching student summary:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get student behavior timeline
exports.getStudentTimeline = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type, category, startDate, endDate, limit = 100 } = req.query;
    
    const student = await Student.findById(studentId).select('name rollNumber');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const timeline = await Remark.getTimeline(studentId, {
      type,
      category,
      startDate,
      endDate,
      limit: parseInt(limit)
    });
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber
      },
      timeline
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a new remark (Teacher/Admin)
exports.addRemark = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      title,
      description,
      type,
      category,
      severity,
      actionTaken,
      requiresFollowUp,
      followUpDate,
      tags,
      academicYear,
      semester
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !type || !category) {
      return res.status(400).json({ 
        error: 'Title, description, type, and category are required' 
      });
    }
    
    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get creator details
    let creatorName;
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findById(req.user.id);
      creatorName = teacher?.name || 'Unknown Teacher';
    } else {
      const admin = await Admin.findById(req.user.id);
      creatorName = admin?.name || 'Admin';
    }
    
    // Create remark
    const remark = new Remark({
      studentId,
      createdBy: req.user.id,
      createdByModel: req.user.role === 'teacher' ? 'Teacher' : 'Admin',
      createdByName: creatorName,
      title,
      description,
      type,
      category,
      severity: severity || (type === 'negative' ? 'medium' : 'low'),
      actionTaken,
      requiresFollowUp: requiresFollowUp || false,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      tags: tags || [],
      academicYear,
      semester
    });
    
    await remark.save();
    await remark.populate('createdBy', 'name email');
    
    // Update student's risk status if needed
    const summary = await Remark.getStudentSummary(studentId);
    const shouldBeAtRisk = summary.riskScore > 30 || summary.negative > 5;
    if (student.atRisk !== shouldBeAtRisk) {
      student.atRisk = shouldBeAtRisk;
      await student.save();
    }
    
    res.status(201).json({
      message: 'Remark added successfully',
      remark,
      studentRiskStatus: {
        atRisk: student.atRisk,
        riskScore: summary.riskScore
      }
    });
  } catch (error) {
    console.error('Error adding remark:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a remark
exports.updateRemark = async (req, res) => {
  try {
    const { remarkId } = req.params;
    const {
      title,
      description,
      type,
      category,
      severity,
      actionTaken,
      requiresFollowUp,
      followUpDate,
      followUpCompleted,
      followUpNotes,
      isResolved,
      resolutionNotes,
      tags
    } = req.body;
    
    const remark = await Remark.findById(remarkId);
    if (!remark) {
      return res.status(404).json({ error: 'Remark not found' });
    }
    
    // Check permissions: creator or admin can edit
    if (req.user.role !== 'admin' && remark.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own remarks' });
    }
    
    // Update fields
    if (title !== undefined) remark.title = title;
    if (description !== undefined) remark.description = description;
    if (type !== undefined) remark.type = type;
    if (category !== undefined) remark.category = category;
    if (severity !== undefined) remark.severity = severity;
    if (actionTaken !== undefined) remark.actionTaken = actionTaken;
    if (requiresFollowUp !== undefined) remark.requiresFollowUp = requiresFollowUp;
    if (followUpDate !== undefined) remark.followUpDate = followUpDate ? new Date(followUpDate) : null;
    if (followUpCompleted !== undefined) remark.followUpCompleted = followUpCompleted;
    if (followUpNotes !== undefined) remark.followUpNotes = followUpNotes;
    if (tags !== undefined) remark.tags = tags;
    
    // Handle resolution
    if (isResolved !== undefined && isResolved !== remark.isResolved) {
      remark.isResolved = isResolved;
      if (isResolved) {
        remark.resolvedAt = new Date();
        remark.resolvedBy = req.user.id;
        remark.resolutionNotes = resolutionNotes || '';
      }
    }
    
    await remark.save();
    await remark.populate('createdBy', 'name email');
    
    res.json({
      message: 'Remark updated successfully',
      remark
    });
  } catch (error) {
    console.error('Error updating remark:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a remark (hide it)
exports.deleteRemark = async (req, res) => {
  try {
    const { remarkId } = req.params;
    
    const remark = await Remark.findById(remarkId);
    if (!remark) {
      return res.status(404).json({ error: 'Remark not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && remark.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own remarks' });
    }
    
    // Soft delete by hiding
    remark.isVisible = false;
    await remark.save();
    
    res.json({ message: 'Remark deleted successfully' });
  } catch (error) {
    console.error('Error deleting remark:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get remarks requiring follow-up
exports.getFollowUpRemarks = async (req, res) => {
  try {
    const { completed = 'false' } = req.query;
    
    const query = {
      requiresFollowUp: true,
      followUpCompleted: completed === 'true',
      isVisible: true
    };
    
    // If teacher, only show their remarks
    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    }
    
    const remarks = await Remark.find(query)
      .populate('studentId', 'name rollNumber')
      .populate('createdBy', 'name email')
      .sort({ followUpDate: 1 });
    
    res.json({ remarks });
  } catch (error) {
    console.error('Error fetching follow-up remarks:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unresolved incidents/warnings
exports.getUnresolvedIssues = async (req, res) => {
  try {
    const query = {
      type: 'negative',
      category: { $in: ['incident', 'warning', 'discipline'] },
      isResolved: false,
      isVisible: true
    };
    
    // If teacher, only show their remarks
    if (req.user.role === 'teacher') {
      query.createdBy = req.user.id;
    }
    
    const remarks = await Remark.find(query)
      .populate('studentId', 'name rollNumber section')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ remarks });
  } catch (error) {
    console.error('Error fetching unresolved issues:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get remarks by category across all students (for analytics)
exports.getRemarksByCategory = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    
    const query = { isVisible: true };
    if (category) query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const remarks = await Remark.find(query)
      .populate('studentId', 'name rollNumber section')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Aggregate statistics
    const stats = {
      total: remarks.length,
      byType: remarks.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {}),
      byCategory: remarks.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: remarks.filter(r => r.type === 'negative').reduce((acc, r) => {
        acc[r.severity] = (acc[r.severity] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({ remarks, stats });
  } catch (error) {
    console.error('Error fetching remarks by category:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
