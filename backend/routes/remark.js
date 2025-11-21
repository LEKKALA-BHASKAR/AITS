const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Get all remarks for a specific student (Admin/Teacher)
router.get('/student/:studentId', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .select('name rollNumber remarks')
      .populate('remarks.teacherId', 'name email');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber
      },
      remarks: student.remarks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get remarks by type
router.get('/student/:studentId/type/:type', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['positive', 'negative', 'neutral'].includes(type)) {
      return res.status(400).json({ error: 'Invalid remark type' });
    }

    const student = await Student.findById(req.params.studentId)
      .select('name rollNumber remarks')
      .populate('remarks.teacherId', 'name email');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const filteredRemarks = student.remarks.filter(r => r.type === type);

    res.json({
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber
      },
      remarks: filteredRemarks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a remark to a student (Teacher/Admin)
router.post('/student/:studentId', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const { remark, type } = req.body;

    if (!remark || !type) {
      return res.status(400).json({ error: 'Remark and type are required' });
    }

    if (!['positive', 'negative', 'neutral'].includes(type)) {
      return res.status(400).json({ error: 'Invalid remark type. Must be positive, negative, or neutral' });
    }

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.remarks.push({
      teacherId: req.user.id,
      remark,
      type,
      date: new Date()
    });

    await student.save();
    await student.populate('remarks.teacherId', 'name email');

    // Return the newly added remark
    const newRemark = student.remarks[student.remarks.length - 1];

    res.status(201).json({
      message: 'Remark added successfully',
      remark: newRemark
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a remark (Teacher/Admin - only their own remarks)
router.put('/:remarkId/student/:studentId', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const { remark, type } = req.body;

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const remarkDoc = student.remarks.id(req.params.remarkId);
    if (!remarkDoc) {
      return res.status(404).json({ error: 'Remark not found' });
    }

    // Check if user is the creator or an admin
    if (req.user.role !== 'admin' && remarkDoc.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own remarks' });
    }

    if (remark !== undefined) remarkDoc.remark = remark;
    if (type !== undefined) {
      if (!['positive', 'negative', 'neutral'].includes(type)) {
        return res.status(400).json({ error: 'Invalid remark type' });
      }
      remarkDoc.type = type;
    }

    await student.save();
    await student.populate('remarks.teacherId', 'name email');

    res.json({
      message: 'Remark updated successfully',
      remark: remarkDoc
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a remark (Teacher/Admin - only their own remarks)
router.delete('/:remarkId/student/:studentId', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const remarkDoc = student.remarks.id(req.params.remarkId);
    if (!remarkDoc) {
      return res.status(404).json({ error: 'Remark not found' });
    }

    // Check if user is the creator or an admin
    if (req.user.role !== 'admin' && remarkDoc.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own remarks' });
    }

    remarkDoc.deleteOne();
    await student.save();

    res.json({ message: 'Remark deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get remarks statistics for a student
router.get('/student/:studentId/stats', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).select('remarks');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const stats = {
      total: student.remarks.length,
      positive: student.remarks.filter(r => r.type === 'positive').length,
      negative: student.remarks.filter(r => r.type === 'negative').length,
      neutral: student.remarks.filter(r => r.type === 'neutral').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
