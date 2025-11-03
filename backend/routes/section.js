const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Section = require('../models/Section');
const Department = require('../models/Department');

router.get('/', auth, async (req, res) => {
  try {
    const sections = await Section.find({ isActive: true })
      .populate('departmentId', 'name code')
      .populate('teacherId', 'name email');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();
    
    await Department.findByIdAndUpdate(req.body.departmentId, {
      $push: { sections: section._id }
    });
    
    res.status(201).json({ message: 'Section created successfully', sectionId: section._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Section.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Section deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
