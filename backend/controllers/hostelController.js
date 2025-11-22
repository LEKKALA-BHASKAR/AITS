const Hostel = require('../models/Hostel');

module.exports = {
  async addHostel(req, res) {
    try {
      const hostel = await Hostel.create(req.body);
      res.status(201).json(hostel);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getHostels(req, res) {
    try {
      const hostels = await Hostel.find().populate('warden');
      res.json(hostels);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
