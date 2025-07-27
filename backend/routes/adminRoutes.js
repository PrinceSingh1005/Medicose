const express = require('express');
const {
    getAllUsers,
    getPendingDoctors,
    verifyDoctor,
    blockUser,
    getAnalytics
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.get('/doctors/pending', getPendingDoctors);
router.put('/doctors/:id/verify', verifyDoctor);
router.put('/users/:id/block', blockUser); // Consider adding an 'isBlocked' field to User model
router.get('/analytics', getAnalytics);

module.exports = router;