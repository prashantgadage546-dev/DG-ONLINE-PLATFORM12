const express = require('express');
const router = express.Router();
const { videoUpload } = require('../../middleware/upload');
const {
  listVideos,
  getCourseLectures,
  createLecture,
  uploadLectureVideo,
  updateLecture,
  deleteLecture,
  updateLectureProgress,
  completeLecture
} = require('./lecture.controller');
const { protect, authorize } = require('../../middleware/auth');

router.get('/', protect, authorize('admin'), listVideos);
router.get('/course/:courseId', getCourseLectures);
router.post('/', protect, authorize('admin'), createLecture);
router.post('/upload', protect, authorize('admin'), videoUpload.single('video'), uploadLectureVideo);
router.put('/:id', protect, authorize('admin'), updateLecture);
router.delete('/:id', protect, authorize('admin'), deleteLecture);
router.put('/:id/progress', protect, updateLectureProgress);
router.post('/:id/complete', protect, completeLecture);

module.exports = router;
