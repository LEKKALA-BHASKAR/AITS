const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');
const CertificateApproval = require('../models/CertificateApproval');
const Student = require('../models/Student');

// Student: Upload certificate
router.post('/upload', auth, roleCheck(['student']), uploadLimiter, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { title, description, category } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'certificates',
      `cert_${req.user.id}_${Date.now()}`
    );
    
    const certificate = new CertificateApproval({
      studentId: req.user.id,
      title,
      description,
      category: category || 'other',
      certificateURL: result.secure_url,
      publicId: result.public_id
    });
    
    await certificate.save();
    
    res.status(201).json({ 
      message: 'Certificate uploaded successfully and pending approval',
      certificate 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student: Get own certificates
router.get('/my-certificates', auth, roleCheck(['student']), async (req, res) => {
  try {
    const certificates = await CertificateApproval.find({ studentId: req.user.id })
      .sort({ uploadDate: -1 })
      .populate('reviewedBy', 'name');
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher/Admin: Get pending certificates
router.get('/pending', auth, roleCheck(['teacher', 'admin']), async (req, res) => {
  try {
    const query = { status: 'pending' };
    
    // If teacher, only show certificates from their assigned sections
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(req.user.id);
      const students = await Student.find({ 
        sectionId: { $in: teacher.assignedSections } 
      }).select('_id');
      query.studentId = { $in: students.map(s => s._id) };
    }
    
    const certificates = await CertificateApproval.find(query)
      .sort({ uploadDate: 1 })
      .populate('studentId', 'name rollNumber email departmentId sectionId')
      .populate({
        path: 'studentId',
        populate: [
          { path: 'departmentId', select: 'name code' },
          { path: 'sectionId', select: 'name' }
        ]
      });
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher/Admin: Approve or reject certificate
router.put('/:id/review', auth, roleCheck(['teacher', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }
    
    const certificate = await CertificateApproval.findById(id);
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    
    // If teacher, verify they can review this certificate
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(req.user.id);
      const student = await Student.findById(certificate.studentId);
      
      if (!teacher.assignedSections.includes(student.sectionId.toString())) {
        return res.status(403).json({ error: 'You can only review certificates from your assigned sections' });
      }
    }
    
    certificate.status = status;
    certificate.reviewComments = reviewComments;
    certificate.reviewedBy = req.user.id;
    certificate.reviewerModel = req.user.role === 'admin' ? 'Admin' : 'Teacher';
    certificate.reviewDate = new Date();
    
    await certificate.save();
    
    // If approved, add to student's achievements
    if (status === 'approved') {
      const student = await Student.findById(certificate.studentId);
      student.achievements.push({
        title: certificate.title,
        description: certificate.description,
        certificateURL: certificate.certificateURL,
        date: certificate.uploadDate
      });
      await student.save();
    }
    
    res.json({ message: `Certificate ${status} successfully`, certificate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all certificates
router.get('/all', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    
    const certificates = await CertificateApproval.find(query)
      .sort({ uploadDate: -1 })
      .populate('studentId', 'name rollNumber email')
      .populate('reviewedBy', 'name');
    
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student: Delete own certificate (only if pending)
router.delete('/:id', auth, roleCheck(['student']), async (req, res) => {
  try {
    const certificate = await CertificateApproval.findOne({
      _id: req.params.id,
      studentId: req.user.id,
      status: 'pending'
    });
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found or cannot be deleted' });
    }
    
    // Delete from Cloudinary
    if (certificate.publicId) {
      await deleteFromCloudinary(certificate.publicId);
    }
    
    await certificate.deleteOne();
    
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
