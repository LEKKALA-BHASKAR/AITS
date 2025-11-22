const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(mongoSanitize()); // Sanitize data against NoSQL injection
app.use(xss()); // Sanitize data against XSS attacks

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
app.use('/api', apiLimiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
mongoose.connect(mongoUri, {
  dbName: process.env.DB_NAME || 'aits_csms'
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Import Routes
const notificationRoutes = require('./routes/notification');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const adminRoutes = require('./routes/admin');
const departmentRoutes = require('./routes/department');
const sectionRoutes = require('./routes/section');
const certificateRoutes = require('./routes/certificate');
const supportTicketRoutes = require('./routes/supportTicket');
// ...existing code...
const remarkRoutes = require('./routes/remark');
// ...existing code...
const libraryRoutes = require('./routes/library');
const hostelRoutes = require('./routes/hostel');
const eventRoutes = require('./routes/event');
const pollRoutes = require('./routes/poll');
// ...existing code...
const skillRoutes = require('./routes/skill');
const hallTicketRoutes = require('./routes/hallTicket');
const feeRoutes = require('./routes/fee');
const mentoringRoutes = require('./routes/mentoring');
const chatRoutes = require('./routes/chat');
const internshipRoutes = require('./routes/internship');
const projectRoutes = require('./routes/project');
const portfolioRoutes = require('./routes/portfolio');
const placementRoutes = require('./routes/placement');
const assignmentRoutes = require('./routes/assignment');
const timetableRoutes = require('./routes/timetable');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const feedbackRoutes = require('./routes/feedback');
const idCardRoutes = require('./routes/idCard');
// ...existing code...

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/section', sectionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/remarks', remarkRoutes);
// ...existing code...
app.use('/api/library', libraryRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/skill', skillRoutes);
app.use('/api/hallticket', hallTicketRoutes);
app.use('/api/fee', feeRoutes);
app.use('/api/mentoring', mentoringRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/internship', internshipRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/assignment', assignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/idcard', idCardRoutes);
// ...existing code...

app.get('/api', (req, res) => {
  res.json({ message: 'AITS CSMS API Server Running' });
});

// Error handling middleware (must be after all routes)
const { errorHandler, notFound } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize scheduled tasks
  if (process.env.NODE_ENV !== 'test') {
    const { initScheduledTasks } = require('./utils/scheduler');
    initScheduledTasks();
  }
});

// Socket.IO setup
const socketIO = require('socket.io');
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST']
  }
});

// Expose io instance on app for use in routes/controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Join group
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });
  // Send message
  socket.on('sendMessage', (data) => {
    io.to(data.groupId).emit('newMessage', data);
  });
  // Typing indicator
  socket.on('typing', (groupId) => {
    socket.to(groupId).emit('typing', socket.id);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

module.exports = app;
