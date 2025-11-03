const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

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
    res.json({ achievements: student.achievements, certificates: student.certificates });
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

module.exports = router;
