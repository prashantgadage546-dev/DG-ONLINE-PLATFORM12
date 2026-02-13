const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const courseRoutes = require('./modules/courses/course.routes');
const lectureRoutes = require('./modules/lectures/lecture.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const topicRoutes = require('./modules/topics/topic.routes');
const userRoutes = require('./modules/users/user.routes');
const assignmentRoutes = require('./modules/assignments/assignment.routes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

module.exports = app;
