const Mentoring = require('../models/Mentoring');

module.exports = {
  async createMentoring(req, res) {
    try {
      const mentoring = await Mentoring.create(req.body);
      res.status(201).json(mentoring);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getMentorings(req, res) {
    try {
      const mentorings = await Mentoring.find().populate('mentor mentee');
      res.json(mentorings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
