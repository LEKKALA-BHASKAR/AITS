const HallTicket = require('../models/HallTicket');

module.exports = {
  async issueHallTicket(req, res) {
    try {
      const hallTicket = await HallTicket.create(req.body);
      res.status(201).json(hallTicket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getHallTickets(req, res) {
    try {
      const hallTickets = await HallTicket.find().populate('student');
      res.json(hallTickets);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
