const express = require('express');
const router = express.Router();
const {
  getCourseLectures,
  createLecture,
  updateLecture,
  deleteLecture,
  completeLecture
} = require('../controllers/lectureController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:courseId', getCourseLectures);
router.post('/', protect, authorize('admin'), createLecture);
router.put('/:id', protect, authorize('admin'), updateLecture);
router.delete('/:id', protect, authorize('admin'), deleteLecture);
router.post('/:id/complete', protect, completeLecture);

module.exports = router;
