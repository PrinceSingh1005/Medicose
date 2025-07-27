const express = require('express');
const { getPatientAppointments, getPatientPrescriptions, submitReview } = require('../controllers/patientController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Private patient routes
router.get('/appointments', protect, authorizeRoles('patient'), getPatientAppointments);
router.get('/prescriptions', protect, authorizeRoles('patient'), getPatientPrescriptions);
router.post('/reviews', protect, authorizeRoles('patient'), submitReview);

module.exports = router;
