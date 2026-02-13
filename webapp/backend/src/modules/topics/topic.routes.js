const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const { getTopics, createTopic } = require('./topic.controller');

const router = express.Router();

router.get('/', getTopics);
router.post('/', protect, authorize('admin'), createTopic);

module.exports = router;
