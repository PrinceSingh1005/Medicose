const express = require('express');
const { getPatientAppointments, getPatientPrescriptions, submitReview, getMyPatientProfile, updatePatientProfile } = require('../controllers/patientController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Private patient routes
router.get('/appointments', protect, authorizeRoles('patient'), getPatientAppointments);
router.get('/prescriptions', protect, authorizeRoles('patient'), getPatientPrescriptions);
router.post('/reviews', protect, authorizeRoles('patient'), submitReview);
router.route('/profile/me')
.get(protect, authorizeRoles('patient'), getMyPatientProfile)
.put(protect, authorizeRoles('patient'), updatePatientProfile);

module.exports = router;
