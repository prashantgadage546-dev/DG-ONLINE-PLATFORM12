const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const {
  getTopicAssignment,
  createAssignment,
  updateAssignment,
  listAssignmentsForAdmin,
  submitAssignment,
} = require('./assignment.controller');

const router = express.Router();

router.get('/topic/:topicId', protect, getTopicAssignment);
router.get('/admin', protect, authorize('admin'), listAssignmentsForAdmin);
router.post('/', protect, authorize('admin'), createAssignment);
router.put('/:id', protect, authorize('admin'), updateAssignment);
router.post('/:id/submit', protect, submitAssignment);

module.exports = router;
