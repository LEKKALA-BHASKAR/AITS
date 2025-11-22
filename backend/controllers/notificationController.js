const Notification = require('../models/Notification');

module.exports = {
  async sendNotification(req, res) {
    try {
      const notification = await Notification.create(req.body);
      res.status(201).json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.find().populate('recipient');
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
      res.json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
