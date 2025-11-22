const Fee = require('../models/Fee');

module.exports = {
  async createFee(req, res) {
    try {
      const fee = await Fee.create(req.body);
      res.status(201).json(fee);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getFees(req, res) {
    try {
      const fees = await Fee.find().populate('student');
      res.json(fees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async markFeePaid(req, res) {
    try {
      const { id } = req.params;
      const fee = await Fee.findByIdAndUpdate(id, { status: 'Paid', paidAt: Date.now() }, { new: true });
      res.json(fee);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
