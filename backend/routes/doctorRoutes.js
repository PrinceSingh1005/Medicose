const express = require('express');
const { getDoctors, getDoctorById, updateDoctorProfile, getDoctorPrescriptions } = require('../controllers/doctorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getDoctors); // Public route to list doctors
router.get('/:id', getDoctorById); // Public route to get single doctor details

// Private doctor routes
router.put('/profile', protect, authorizeRoles('doctor'), updateDoctorProfile);
router.get('/prescriptions', protect, authorizeRoles('doctor'), getDoctorPrescriptions);

module.exports = router;