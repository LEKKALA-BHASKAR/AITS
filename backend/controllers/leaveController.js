const Leave = require('../models/Leave');

module.exports = {
  async applyLeave(req, res) {
    try {
      const leave = await Leave.create(req.body);
      res.status(201).json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getLeaves(req, res) {
    try {
      const leaves = await Leave.find().populate('student reviewedBy');
      res.json(leaves);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async updateLeaveStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reviewedBy } = req.body;
      const leave = await Leave.findByIdAndUpdate(id, { status, reviewedBy }, { new: true });
      res.json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
