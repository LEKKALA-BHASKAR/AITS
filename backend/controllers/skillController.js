const Skill = require('../models/Skill');

module.exports = {
  async addSkill(req, res) {
    try {
      const skill = await Skill.create(req.body);
      res.status(201).json(skill);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getSkills(req, res) {
    try {
      const skills = await Skill.find().populate('students');
      res.json(skills);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
