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
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME || 'aits_csms'
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const adminRoutes = require('./routes/admin');
const departmentRoutes = require('./routes/department');
const sectionRoutes = require('./routes/section');
const certificateRoutes = require('./routes/certificate');
const supportTicketRoutes = require('./routes/supportTicket');
const notificationRoutes = require('./routes/notification');
const remarkRoutes = require('./routes/remark');
const analyticsRoutes = require('./routes/analytics');

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
app.use('/api/analytics', analyticsRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'AITS CSMS API Server Running' });
});

// Error handling middleware (must be after all routes)
const { errorHandler, notFound } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize scheduled tasks
  if (process.env.NODE_ENV !== 'test') {
    const { initScheduledTasks } = require('./utils/scheduler');
    initScheduledTasks();
  }
});

module.exports = app;
