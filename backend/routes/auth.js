const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
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

module.exports = router;
