const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Section = require('../models/Section');

router.get('/profile', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id)
      .populate('departmentId', 'name code')
      .populate('assignedSections', 'name')
      .select('-password');
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sections', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    const sections = await Section.find({ _id: { $in: teacher.assignedSections } })
      .populate('studentIds', 'name rollNumber imageURL')
      .populate('departmentId', 'name');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/students/:sectionId', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const students = await Student.find({ sectionId: req.params.sectionId, isActive: true })
      .select('-password')
      .populate('departmentId', 'name')
      .populate('sectionId', 'name');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/student/attendance', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const { studentId, subject, status } = req.body;
    const student = await Student.findById(studentId);
    
    student.attendance.push({
      subject,
      date: new Date(),
      status
    });
    
    await student.save();
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/student/result', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const { studentId, semester, subject, marks, grade, examType } = req.body;
    const student = await Student.findById(studentId);
    
    student.results.push({
      semester,
      subject,
      marks,
      grade,
      examType
    });
    
    await student.save();
    res.json({ message: 'Result added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/student/remark', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const { studentId, remark, type } = req.body;
    const student = await Student.findById(studentId);
    
    student.remarks.push({
      teacherId: req.user.id,
      remark,
      type,
      date: new Date()
    });
    
    await student.save();
    res.json({ message: 'Remark added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
