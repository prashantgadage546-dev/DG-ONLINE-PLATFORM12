const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getStudentDashboard, 
  getAdminDashboard 
} = require('../controllers/dashboardController');

// Protected routes
router.get('/student', protect, getStudentDashboard);
router.get('/admin', protect, getAdminDashboard);

module.exports = router;
