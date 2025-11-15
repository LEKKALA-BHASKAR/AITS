const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Section = require('../models/Section');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');

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

// Upload profile image
router.post('/upload-image', auth, roleCheck(['teacher']), uploadLimiter, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    // Delete old image from Cloudinary if exists
    if (teacher.imageURL && teacher.cloudinaryPublicId) {
      await deleteFromCloudinary(teacher.cloudinaryPublicId);
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'teachers',
      `teacher_${req.user.id}_${Date.now()}`
    );
    
    teacher.imageURL = result.secure_url;
    teacher.cloudinaryPublicId = result.public_id;
    await teacher.save();
    
    res.json({ message: 'Image uploaded successfully', imageURL: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk attendance marking
router.post('/attendance/bulk', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const { attendanceData } = req.body; // Array of { studentId, subject, status }
    
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ error: 'Invalid attendance data' });
    }
    
    const results = [];
    for (const record of attendanceData) {
      const { studentId, subject, status } = record;
      const student = await Student.findById(studentId);
      
      if (student) {
        student.attendance.push({
          subject,
          date: new Date(),
          status
        });
        await student.save();
        results.push({ studentId, success: true });
      } else {
        results.push({ studentId, success: false, error: 'Student not found' });
      }
    }
    
    res.json({ message: 'Bulk attendance marked', results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student result
router.put('/student/result/:resultId', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const { studentId, marks, grade } = req.body;
    const student = await Student.findById(studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const result = student.results.id(req.params.resultId);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    
    if (marks !== undefined) result.marks = marks;
    if (grade !== undefined) result.grade = grade;
    
    await student.save();
    res.json({ message: 'Result updated successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get section statistics
router.get('/section/:sectionId/stats', auth, roleCheck(['teacher']), async (req, res) => {
  try {
    const students = await Student.find({ sectionId: req.params.sectionId, isActive: true });
    
    const totalStudents = students.length;
    const atRiskStudents = students.filter(s => s.atRisk).length;
    const studentsWithBacklogs = students.filter(s => s.backlogCount > 0).length;
    
    // Calculate average attendance
    let totalAttendancePercentage = 0;
    students.forEach(student => {
      if (student.attendance.length > 0) {
        const presentCount = student.attendance.filter(a => a.status === 'present').length;
        const percentage = (presentCount / student.attendance.length) * 100;
        totalAttendancePercentage += percentage;
      }
    });
    const avgAttendance = totalStudents > 0 ? (totalAttendancePercentage / totalStudents).toFixed(2) : 0;
    
    res.json({
      totalStudents,
      atRiskStudents,
      studentsWithBacklogs,
      avgAttendance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
