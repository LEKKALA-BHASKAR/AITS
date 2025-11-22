const Assignment = require('../models/Assignment');
const Resource = require('../models/Resource');

module.exports = {
  async createAssignment(req, res) {
    try {
      const assignment = await Assignment.create(req.body);
      // Emit real-time update event via Socket.IO
      if (req.app && req.app.get && req.app.get('io')) {
        req.app.get('io').emit('assignmentUpdated', assignment);
      }
      res.status(201).json(assignment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAssignments(req, res) {
    try {
      const assignments = await Assignment.find().populate('resources assignedTo createdBy');
      res.json(assignments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async addResource(req, res) {
    try {
      const resource = await Resource.create(req.body);
      res.status(201).json(resource);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getResources(req, res) {
    try {
      const resources = await Resource.find().populate('uploadedBy');
      res.json(resources);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
