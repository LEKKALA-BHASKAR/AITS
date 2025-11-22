const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Get all notifications for the current user (Student/Teacher/Admin)
router.get('/', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === 'student') {
      const student = await Student.findById(id).populate('departmentId sectionId');
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      query = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'students' },
          { departmentId: student.departmentId._id },
          { sectionId: student.sectionId._id }
        ]
      };
    } else if (role === 'teacher') {
      const teacher = await Teacher.findById(id).populate('departmentId');
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      query = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'teachers' },
          { departmentId: teacher.departmentId._id }
        ]
      };
    } else if (role === 'admin') {
      query = { targetAudience: 'all' };
    }

    const notifications = await Notification.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification (Admin only)
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { title, message, targetAudience, departmentId, sectionId, priority } = req.body;

    if (!title || !message || !targetAudience) {
      return res.status(400).json({ error: 'Title, message, and target audience are required' });
    }

    // Validate targetAudience-specific requirements
    if (targetAudience === 'department' && !departmentId) {
      return res.status(400).json({ error: 'Department ID is required when target audience is department' });
    }

    if (targetAudience === 'section' && !sectionId) {
      return res.status(400).json({ error: 'Section ID is required when target audience is section' });
    }

    const notification = new Notification({
      title,
      message,
      targetAudience,
      departmentId: departmentId || null,
      sectionId: sectionId || null,
      priority: priority || 'normal',
      createdBy: req.user.id
    });

    await notification.save();
    await notification.populate('createdBy', 'name email');

    // Emit real-time notification event via Socket.IO
    if (req.app.get('io')) {
      req.app.get('io').emit('newNotification', notification);
    }

    res.status(201).json({ 
      message: 'Notification created successfully', 
      notification 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update notification (Admin only)
router.put('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { title, message, targetAudience, departmentId, sectionId, priority } = req.body;

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (targetAudience !== undefined) notification.targetAudience = targetAudience;
    if (departmentId !== undefined) notification.departmentId = departmentId;
    if (sectionId !== undefined) notification.sectionId = sectionId;
    if (priority !== undefined) notification.priority = priority;

    await notification.save();
    await notification.populate('createdBy', 'name email');

    res.json({ message: 'Notification updated successfully', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification (Admin only)
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count (for badge)
router.get('/unread/count', auth, async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === 'student') {
      const student = await Student.findById(id).populate('departmentId sectionId');
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      query = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'students' },
          { departmentId: student.departmentId._id },
          { sectionId: student.sectionId._id }
        ]
      };
    } else if (role === 'teacher') {
      const teacher = await Teacher.findById(id).populate('departmentId');
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      query = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'teachers' },
          { departmentId: teacher.departmentId._id }
        ]
      };
    } else if (role === 'admin') {
      // Admins see all notifications
      query = {};
    }

    // Count notifications from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    query.createdAt = { $gte: sevenDaysAgo };

    const count = await Notification.countDocuments(query);

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
