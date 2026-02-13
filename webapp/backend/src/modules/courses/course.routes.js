const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse
} = require('./course.controller');
const { protect, authorize, optionalProtect } = require('../../middleware/auth');

router.get('/', getAllCourses);
router.get('/:id', optionalProtect, getCourse);
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;
