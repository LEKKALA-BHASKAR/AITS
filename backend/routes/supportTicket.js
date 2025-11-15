const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');

// Student: Create support ticket
router.post('/', auth, roleCheck(['student']), async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body;
    
    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }
    
    const ticket = new SupportTicket({
      studentId: req.user.id,
      subject,
      description,
      category: category || 'other',
      priority: priority || 'medium'
    });
    
    await ticket.save();
    
    res.status(201).json({ 
      message: 'Support ticket created successfully',
      ticket 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student: Get own tickets
router.get('/my-tickets', auth, roleCheck(['student']), async (req, res) => {
  try {
    const { status } = req.query;
    const query = { studentId: req.user.id };
    
    if (status) query.status = status;
    
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email')
      .populate('responses.responderId', 'name');
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student: Get single ticket with full details
router.get('/:id', auth, roleCheck(['student', 'admin', 'teacher']), async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('studentId', 'name email rollNumber')
      .populate('assignedTo', 'name email')
      .populate('responses.responderId', 'name');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Students can only view their own tickets
    if (req.user.role === 'student' && ticket.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Teacher: Get all tickets or filtered tickets
router.get('/', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const { status, category, priority, assignedToMe } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedToMe === 'true') query.assignedTo = req.user.id;
    
    const tickets = await SupportTicket.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .populate('studentId', 'name email rollNumber departmentId sectionId')
      .populate('assignedTo', 'name email');
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Assign ticket
router.put('/:id/assign', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo,
        status: assignedTo ? 'in_progress' : 'open'
      },
      { new: true }
    ).populate('assignedTo', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket assigned successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Teacher: Add response to ticket
router.post('/:id/response', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.responses.push({
      responderId: req.user.id,
      responderModel: req.user.role === 'admin' ? 'Admin' : 'Teacher',
      message
    });
    
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    
    await ticket.save();
    await ticket.populate('responses.responderId', 'name');
    
    res.json({ message: 'Response added successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin/Teacher: Update ticket status
router.put('/:id/status', auth, roleCheck(['admin', 'teacher']), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const update = { status };
    if (status === 'resolved' || status === 'closed') {
      update.resolvedAt = new Date();
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ message: 'Ticket status updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get ticket statistics
router.get('/stats/overview', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'in_progress' }),
      SupportTicket.countDocuments({ status: 'resolved' }),
      SupportTicket.countDocuments({ status: 'closed' })
    ]);
    
    const byCategory = await SupportTicket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const byPriority = await SupportTicket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    res.json({
      total,
      byStatus: { open, inProgress, resolved, closed },
      byCategory,
      byPriority
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
