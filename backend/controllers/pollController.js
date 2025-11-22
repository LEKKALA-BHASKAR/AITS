const Poll = require('../models/Poll');

module.exports = {
  async createPoll(req, res) {
    try {
      const poll = await Poll.create(req.body);
      // Emit real-time update event via Socket.IO
      if (req.app && req.app.get && req.app.get('io')) {
        req.app.get('io').emit('pollUpdated', poll);
      }
      res.status(201).json(poll);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getPolls(req, res) {
    try {
      const polls = await Poll.find().populate('createdBy');
      res.json(polls);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async votePoll(req, res) {
    try {
      const { pollId, optionIndex } = req.body;
      const poll = await Poll.findById(pollId);
      if (!poll) throw new Error('Poll not found');
      poll.options[optionIndex].votes += 1;
      await poll.save();
      res.json(poll);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
