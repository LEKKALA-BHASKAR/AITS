const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const json2csv = require('json2csv').parse;

const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Department = require('../models/Department');
const Section = require('../models/Section');
const Notification = require('../models/Notification');

// ---------------- DASHBOARD -----------------
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

// ---------------- STUDENT MANAGEMENT -----------------

// 🔍 Search / Filter students
router.get('/students/search', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { name, departmentId, sectionId, atRisk, isApproved } = req.query;
    const query = { isActive: true };

    if (name) query.name = new RegExp(name, 'i');
    if (departmentId) query.departmentId = departmentId;
    if (sectionId) query.sectionId = sectionId;
    if (atRisk !== undefined) query.atRisk = atRisk === 'true';
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    const students = await Student.find(query)
      .populate('departmentId', 'name code')
      .populate('sectionId', 'name')
      .select('-password');

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students
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

// Get single student full details (attendance + results)
router.get('/students/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('departmentId', 'name code')
      .populate('sectionId', 'name')
      .populate('remarks.teacherId', 'name')
      .select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new student
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

// Update student
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

// Add attendance for a student
router.post('/students/:id/attendance', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { subject, date, status } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.attendance.push({ subject, date, status });
    await student.save();

    res.json({ message: 'Attendance added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add results for a student
router.post('/students/:id/results', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { semester, subject, marks, grade, examType } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.results.push({ semester, subject, marks, grade, examType });
    await student.save();

    res.json({ message: 'Result added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Promote student to another section or department
router.put('/students/:id/promote', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { departmentId, sectionId } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { departmentId, sectionId },
      { new: true }
    ).select('-password');

    res.json({ message: 'Student promoted successfully', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export all student data as CSV
router.get('/students/export', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const students = await Student.find().select('-password -__v');
    const csv = json2csv(students.map(s => s.toObject()));
    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Automatically mark students "atRisk" if backlogCount > 2 or average marks < 40
router.put('/students/update-risk-status', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const students = await Student.find();
    for (const student of students) {
      const avgMarks = student.results.length
        ? student.results.reduce((sum, r) => sum + r.marks, 0) / student.results.length
        : 100;
      student.atRisk = student.backlogCount > 2 || avgMarks < 40;
      await student.save();
    }
    res.json({ message: 'At-risk students updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deactivate student (soft delete)
router.delete('/students/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Permanently delete student
router.delete('/students/:id/permanent', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- TEACHER MANAGEMENT -----------------
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

// ---------------- NOTIFICATION MANAGEMENT -----------------
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

// ---------------- USER APPROVAL MANAGEMENT -----------------
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

// ---------------- BULK APPROVAL ----------------
router.put('/approve-all/:role', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { role } = req.params;
    let Model;
    if (role === 'student') Model = Student;
    else if (role === 'teacher') Model = Teacher;
    else if (role === 'admin') Model = Admin;
    else return res.status(400).json({ error: 'Invalid role' });

    await Model.updateMany({ isApproved: false }, { isApproved: true });
    res.json({ message: `${role}s approved successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;