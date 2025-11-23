const TeacherNote = require('../models/TeacherNote');
const StudentTimeline = require('../models/StudentTimeline');

/**
 * Teacher Notes Controller
 * Private collaboration notes for faculty
 */

// Create teacher note
const createTeacherNote = async (req, res) => {
  try {
    const {
      studentId,
      title,
      content,
      category,
      priority,
      tags,
      requiresFollowUp,
      followUpDate,
      sharedWith
    } = req.body;
    
    const teacherNote = await TeacherNote.create({
      studentId,
      createdBy: req.user.id,
      createdByName: req.user.name,
      title,
      content,
      category,
      priority: priority || 'medium',
      tags: tags || [],
      requiresFollowUp: requiresFollowUp || false,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      sharedWith: sharedWith || []
    });
    
    // Add to timeline (visible only to teachers and admins)
    await StudentTimeline.addEvent({
      studentId,
      eventType: 'teacher_note_added',
      title: 'Teacher Note Added',
      description: title,
      impact: 'neutral',
      severity: priority === 'urgent' ? 'alert' : priority === 'high' ? 'warning' : 'info',
      relatedTo: {
        entityType: 'TeacherNote',
        entityId: teacherNote._id
      },
      triggeredBy: {
        userId: req.user.id,
        userName: req.user.name,
        userType: 'teacher'
      },
      visibleTo: ['teacher', 'admin']
    });
    
    res.status(201).json({
      success: true,
      message: 'Teacher note created successfully',
      teacherNote
    });
  } catch (error) {
    console.error('Error creating teacher note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notes for a student
const getStudentNotes = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { category, priority, status } = req.query;
    
    const notes = await TeacherNote.getStudentNotes(studentId, req.user.id);
    
    // Apply additional filters
    let filteredNotes = notes;
    
    if (category) {
      filteredNotes = filteredNotes.filter(n => n.category === category);
    }
    
    if (priority) {
      filteredNotes = filteredNotes.filter(n => n.priority === priority);
    }
    
    if (status) {
      filteredNotes = filteredNotes.filter(n => n.status === status);
    }
    
    res.json({
      success: true,
      count: filteredNotes.length,
      notes: filteredNotes
    });
  } catch (error) {
    console.error('Error fetching student notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my notes (created by current teacher)
const getMyNotes = async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    const query = { createdBy: req.user.id };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const notes = await TeacherNote.find(query)
      .populate('studentId', 'name rollNumber email imageURL')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Error fetching my notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notes shared with me
const getSharedNotes = async (req, res) => {
  try {
    const notes = await TeacherNote.find({
      'sharedWith.teacherId': req.user.id,
      status: 'active'
    })
      .populate('studentId', 'name rollNumber email imageURL')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Error fetching shared notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add response to note
const addNoteResponse = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { comment } = req.body;
    
    const note = await TeacherNote.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if user has access to this note
    const hasAccess = note.createdBy.equals(req.user.id) || 
                     note.sharedWith.some(s => s.teacherId.equals(req.user.id));
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    note.addResponse(req.user.id, req.user.name, comment);
    await note.save();
    
    res.json({
      success: true,
      message: 'Response added successfully',
      note
    });
  } catch (error) {
    console.error('Error adding note response:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Share note with teacher
const shareNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { teacherId, teacherName } = req.body;
    
    const note = await TeacherNote.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Only creator can share
    if (!note.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only note creator can share' });
    }
    
    note.shareWith(teacherId, teacherName);
    await note.save();
    
    res.json({
      success: true,
      message: 'Note shared successfully',
      note
    });
  } catch (error) {
    console.error('Error sharing note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update note status
const updateNoteStatus = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { status, resolutionNotes } = req.body;
    
    const note = await TeacherNote.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Only creator can update status
    if (!note.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Only note creator can update status' });
    }
    
    note.status = status;
    if (status === 'resolved') {
      note.isResolved = true;
      note.resolvedAt = new Date();
      note.resolvedBy = req.user.id;
      note.resolutionNotes = resolutionNotes;
    }
    
    await note.save();
    
    res.json({
      success: true,
      message: 'Note status updated',
      note
    });
  } catch (error) {
    console.error('Error updating note status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending follow-ups
const getPendingFollowUps = async (req, res) => {
  try {
    const notes = await TeacherNote.getPendingFollowUps(req.user.id);
    
    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Error fetching pending follow-ups:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get high priority notes
const getHighPriorityNotes = async (req, res) => {
  try {
    const notes = await TeacherNote.getHighPriorityNotes(req.user.id);
    
    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Error fetching high priority notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTeacherNote,
  getStudentNotes,
  getMyNotes,
  getSharedNotes,
  addNoteResponse,
  shareNote,
  updateNoteStatus,
  getPendingFollowUps,
  getHighPriorityNotes
};
