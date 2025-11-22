const Feedback = require('../models/Feedback');

module.exports = {
  async submitFeedback(req, res) {
    try {
      const feedback = await Feedback.create(req.body);
      res.status(201).json(feedback);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getFeedbacks(req, res) {
    try {
      const feedbacks = await Feedback.find().populate('student teacher');
      res.json(feedbacks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
