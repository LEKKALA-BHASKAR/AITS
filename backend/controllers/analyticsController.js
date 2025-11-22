const Analytics = require('../models/Analytics');

module.exports = {
  async createAnalytics(req, res) {
    try {
      const analytics = await Analytics.create(req.body);
      res.status(201).json(analytics);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAnalytics(req, res) {
    try {
      const analytics = await Analytics.find().populate('generatedBy');
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
