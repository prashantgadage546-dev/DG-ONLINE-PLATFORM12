const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const { getUsers, updateUserRole, deleteUser } = require('./user.controller');

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
