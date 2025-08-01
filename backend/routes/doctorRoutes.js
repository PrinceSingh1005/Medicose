// In backend/routes/doctorRoutes.js

const express = require('express');
// Correctly import 'getAllDoctors' instead of 'getDoctors'
const { getAllDoctors, getDoctorById, updateDoctorProfile, getDoctorPrescriptions,getMyDoctorProfile } = require('../controllers/doctorController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// This now uses the correct function name and will work as intended
router.get('/', getAllDoctors);
router.get('/profile/me', protect, authorizeRoles('doctor'), getMyDoctorProfile);

router.get('/:id', getDoctorById); 

// Private doctor routes
router.put('/profile', protect, authorizeRoles('doctor'), updateDoctorProfile);
router.get('/prescriptions', protect, authorizeRoles('doctor'), getDoctorPrescriptions);

module.exports = router;