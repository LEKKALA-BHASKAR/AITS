const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const Department = require('../models/Department');

router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('hodId', 'name email')
      .populate('sections', 'name');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json({ message: 'Department created successfully', departmentId: department._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Department deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
