const Timetable = require('../models/Timetable');

module.exports = {
  async createTimetable(req, res) {
    try {
      const timetable = await Timetable.create(req.body);
      res.status(201).json(timetable);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getTimetables(req, res) {
    try {
      const timetables = await Timetable.find().populate('teacher section');
      res.json(timetables);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
