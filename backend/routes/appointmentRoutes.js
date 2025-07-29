const express = require('express');
const {
    getAppointmentById,
    bookAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    createPrescription,
    handlePaymentSuccess
} = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Doctor routes
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorAppointments);
router.put('/:id/status', protect, authorizeRoles('doctor'), updateAppointmentStatus);
router.post('/:id/prescription', protect, authorizeRoles('doctor'), createPrescription);

router.get('/:id', protect, getAppointmentById)

// Patient routes
router.post('/', protect, authorizeRoles('patient'), bookAppointment);
router.post('/:id/payment-success', protect, authorizeRoles('patient'), handlePaymentSuccess); // Simplified payment callback


module.exports = router;
