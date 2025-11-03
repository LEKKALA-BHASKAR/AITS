const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Department = require('../models/Department');
const Section = require('../models/Section');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

router.get('/dashboard', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalDepartments = await Department.countDocuments({ isActive: true });
    const atRiskStudents = await Student.countDocuments({ atRisk: true });
    
    res.json({
      totalStudents,
      totalTeachers,
      totalDepartments,
      atRiskStudents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/students', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('departmentId', 'name code')
      .populate('sectionId', 'name')
      .select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/students/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('departmentId', 'name code')
      .populate('sectionId', 'name')
      .populate('remarks.teacherId', 'name')
      .select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/students', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { password, ...studentData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const student = new Student({
      ...studentData,
      password: hashedPassword
    });
    
    await student.save();
    
    await Section.findByIdAndUpdate(studentData.sectionId, {
      $push: { studentIds: student._id }
    });
    
    res.status(201).json({ message: 'Student created successfully', studentId: student._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/students/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/students/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/teachers', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const teachers = await Teacher.find({ isActive: true })
      .populate('departmentId', 'name code')
      .select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/teachers', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { password, ...teacherData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const teacher = new Teacher({
      ...teacherData,
      password: hashedPassword
    });
    
    await teacher.save();
    res.status(201).json({ message: 'Teacher created successfully', teacherId: teacher._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/notifications', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      postedBy: req.user.id,
      postedByModel: 'Admin'
    });
    
    await notification.save();
    res.status(201).json({ message: 'Notification created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pending-approvals', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const pendingStudents = await Student.find({ isApproved: false }).select('-password');
    const pendingTeachers = await Teacher.find({ isApproved: false }).select('-password');
    const pendingAdmins = await Admin.find({ isApproved: false }).select('-password');
    
    res.json({
      students: pendingStudents,
      teachers: pendingTeachers,
      admins: pendingAdmins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/approve-user/:role/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { role, id } = req.params;
    const { isApproved } = req.body;
    
    let Model;
    if (role === 'student') Model = Student;
    else if (role === 'teacher') Model = Teacher;
    else if (role === 'admin') Model = Admin;
    else return res.status(400).json({ error: 'Invalid role' });
    
    await Model.findByIdAndUpdate(id, { isApproved });
    res.json({ message: `User ${isApproved ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
