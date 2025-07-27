const express = require('express');
const {
    bookAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    createPrescription,
    handlePaymentSuccess
} = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Patient routes
router.post('/', protect, authorizeRoles('patient'), bookAppointment);
router.post('/:id/payment-success', protect, authorizeRoles('patient'), handlePaymentSuccess); // Simplified payment callback

// Doctor routes
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorAppointments);
router.put('/:id/status', protect, authorizeRoles('doctor'), updateAppointmentStatus);
router.post('/:id/prescription', protect, authorizeRoles('doctor'), createPrescription);

module.exports = router;
