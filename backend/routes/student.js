const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.get('/profile', auth, roleCheck(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('departmentId', 'name code')
      .populate('sectionId', 'name')
      .select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', auth, roleCheck(['student']), async (req, res) => {
  try {
    const { phone, guardianName, guardianPhone } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { phone, guardianName, guardianPhone },
      { new: true }
    ).select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/attendance', auth, roleCheck(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('attendance');
    res.json(student.attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/results', auth, roleCheck(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('results backlogCount');
    res.json({ results: student.results, backlogCount: student.backlogCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/achievements', auth, roleCheck(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('achievements certificates');
    
    // Also fetch from Achievement model
    const Achievement = require('../models/Achievement');
    const achievements = await Achievement.find({ student: req.user.id })
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ 
      achievements: achievements, 
      certificates: student.certificates || [],
      legacyAchievements: student.achievements || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload achievement certificate
router.post('/achievements', auth, roleCheck(['student']), uploadLimiter, upload.single('certificate'), async (req, res) => {
  try {
    const { title, description, type, tags } = req.body;
    
    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    let certificateUrl = null;
    if (req.file) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        'achievements',
        `achievement_${req.user.id}_${Date.now()}`
      );
      certificateUrl = result.secure_url;
    }

    const Achievement = require('../models/Achievement');
    const achievement = await Achievement.create({
      student: req.user.id,
      title,
      description,
      type,
      tags: tags ? JSON.parse(tags) : [],
      certificateUrl,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Achievement uploaded successfully. Pending approval.',
      achievement
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/remarks', auth, roleCheck(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('remarks.teacherId', 'name')
      .select('remarks');
    res.json(student.remarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notifications', auth, roleCheck(['student']), async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { target: 'all' },
        { target: 'student' }
      ]
    }).sort({ date: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload profile image
router.post('/upload-image', auth, roleCheck(['student']), uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Delete old image from Cloudinary if exists
    if (student.imageURL && student.cloudinaryPublicId) {
      await deleteFromCloudinary(student.cloudinaryPublicId);
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'students',
      `student_${req.user.id}_${Date.now()}`
    );
    
    student.imageURL = result.secure_url;
    student.cloudinaryPublicId = result.public_id;
    await student.save();
    
    res.json({ message: 'Image uploaded successfully', imageURL: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance statistics
router.get('/attendance/stats', auth, roleCheck(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('attendance');
    
    const totalClasses = student.attendance.length;
    const presentCount = student.attendance.filter(a => a.status === 'present').length;
    const absentCount = student.attendance.filter(a => a.status === 'absent').length;
    const lateCount = student.attendance.filter(a => a.status === 'late').length;
    const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(2) : 0;
    
    res.json({
      totalClasses,
      presentCount,
      absentCount,
      lateCount,
      attendancePercentage,
      lowAttendanceWarning: attendancePercentage < 65
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
