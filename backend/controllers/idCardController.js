const IDCard = require('../models/IDCard');

module.exports = {
  async issueIDCard(req, res) {
    try {
      const idCard = await IDCard.create(req.body);
      res.status(201).json(idCard);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getIDCards(req, res) {
    try {
      const idCards = await IDCard.find().populate('student');
      res.json(idCards);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async updateIDCardStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const idCard = await IDCard.findByIdAndUpdate(id, { status }, { new: true });
      res.json(idCard);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
