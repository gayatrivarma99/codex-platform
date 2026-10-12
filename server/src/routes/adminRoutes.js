const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
  getAllSubmissionsAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes strictly protected
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/role', changeUserRole);
router.get('/submissions', getAllSubmissionsAdmin);

module.exports = router;
