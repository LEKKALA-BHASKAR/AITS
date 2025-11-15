const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { trackLogin, checkSuspiciousLogin } = require('../middleware/loginTracking');

router.post('/login', authLimiter, trackLogin, checkSuspiciousLogin, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    let user;
    let Model;
    
    if (role === 'student') {
      Model = Student;
    } else if (role === 'teacher') {
      Model = Teacher;
    } else if (role === 'admin') {
      Model = Admin;
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    user = await Model.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, role, email: user.email },
      process.env.JWT_SECRET || 'aits_secret_key',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        imageURL: user.imageURL
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, ...otherData } = req.body;
    
    let Model;
    if (role === 'student') Model = Student;
    else if (role === 'teacher') Model = Teacher;
    else if (role === 'admin') Model = Admin;
    else return res.status(400).json({ error: 'Invalid role' });
    
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new Model({
      name,
      email,
      password: hashedPassword,
      ...otherData
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change Password (authenticated users)
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    let Model;
    if (req.user.role === 'student') Model = Student;
    else if (req.user.role === 'teacher') Model = Teacher;
    else if (req.user.role === 'admin') Model = Admin;
    else return res.status(400).json({ error: 'Invalid role' });
    
    const user = await Model.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password (admin only - for resetting other users' passwords)
router.post('/reset-password', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reset passwords' });
    }
    
    const { userId, role, newPassword } = req.body;
    
    if (!userId || !role || !newPassword) {
      return res.status(400).json({ error: 'User ID, role and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    let Model;
    if (role === 'student') Model = Student;
    else if (role === 'teacher') Model = Teacher;
    else if (role === 'admin') Model = Admin;
    else return res.status(400).json({ error: 'Invalid role' });
    
    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get login history (authenticated users - own history)
router.get('/login-history', auth, async (req, res) => {
  try {
    const LoginLog = require('../models/LoginLog');
    const logs = await LoginLog.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('-__v');
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
