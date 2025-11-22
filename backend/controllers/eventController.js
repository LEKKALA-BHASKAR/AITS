const Event = require('../models/Event');

module.exports = {
  async createEvent(req, res) {
    try {
      const event = await Event.create(req.body);
      // Emit real-time update event via Socket.IO
      if (req.app && req.app.get && req.app.get('io')) {
        req.app.get('io').emit('eventUpdated', event);
      }
      res.status(201).json(event);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getEvents(req, res) {
    try {
      const events = await Event.find().populate('createdBy');
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
