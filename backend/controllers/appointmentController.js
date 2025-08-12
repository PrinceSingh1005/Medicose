const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const { isValidTimeSlot } = require('../utils/timeUtils');
const { sendAppointmentConfirmation } = require('../services/emailService');
const { emitSocketEvent } = require('../config/socket');

const getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id)
        .populate('patient', 'name email')
        .populate('doctor', 'name email');

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Check if the logged-in user is either the patient or the doctor for this appointment
    const isPatient = appointment.patient._id.toString() === req.user._id.toString();
    const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
        res.status(403);
        throw new Error('User not authorized to view this appointment');
    }

    res.json(appointment);
});

// Helper for emitting to a specific user (by userId)
const emitToUser = (userId, event, data) => {
    emitSocketEvent(userId.toString(), event, data);
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
const bookAppointment = asyncHandler(async (req, res) => {
    const {
        doctorId,
        appointmentDate,
        appointmentTime,
        consultationType,
        reason
    } = req.body;

    // --- Validation ---
    if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Only patients can book appointments' });
    }

    if (!doctorId || !appointmentDate || !appointmentTime || !consultationType) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!doctorId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    console.log('Looking up doctor profile for ID:', doctorId);

    // --- Find DoctorProfile by ID or by User ID fallback ---
    let doctorProfile = await DoctorProfile.findById(doctorId);
    if (!doctorProfile) {
        // Try as User ID -> lookup user and then profile
        const doctorUserRecord = await User.findById(doctorId);
        if (doctorUserRecord && doctorUserRecord.role === 'doctor') {
            doctorProfile = await DoctorProfile.findOne({ user: doctorUserRecord._id });
        }
    }

    if (!doctorProfile) {
        return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // --- Verify doctor user data ---
    const doctorUser = await User.findById(doctorProfile.user);
    if (!doctorUser) {
        return res.status(404).json({ message: 'Doctor user not found' });
    }
    if (doctorUser.role !== 'doctor' || !doctorUser.isVerified) {
        return res.status(400).json({ message: 'Doctor is not available for appointments' });
    }

    // --- Date & time validation ---
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(appointmentDateTime.getTime())) {
        return res.status(400).json({ message: 'Invalid date or time format' });
    }
    if (appointmentDateTime < new Date()) {
        return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }
    if (!(await isValidTimeSlot(appointmentTime, appointmentDate, doctorProfile._id))) {
        return res.status(400).json({ message: 'Selected time slot is not available' });
    }


    // --- Check availability using new utility ---
    const available = await isValidTimeSlot(appointmentTime, appointmentDate, doctorProfile._id);
    if (!available) {
        return res.status(400).json({ message: 'Selected time slot is not available' });
    }


    // --- Create appointment ---
    try {
        const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorUser._id,          // User ref
        doctorProfile: doctorProfile._id, // DoctorProfile ref
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        consultationType,
        reason: reason || '',
        fees: doctorProfile.fees || 0,
        status: 'pending',
        paymentStatus: doctorProfile.fees > 0 ? 'pending' : 'paid',
    });
    res.status(201).json({
        message: 'Appointment booked successfully',
        appointmentId: appointment._id,
        paymentRequired: doctorProfile.fees > 0
    });
    }catch(error){
        if (error.code == 11000) {
            return res.status(409).json({ message: 'Appointment already exists for the selected time slot' });
        }
        return res.status(500).json({ message: 'Failed to create appointment' });
    }


    // // --- Send confirmation email (async, no await) ---
    // sendAppointmentConfirmation({
    //     patient: req.user,
    //     doctor: doctorUser,
    //     appointment
    // }).catch(err => console.error('Appointment confirmation email failed:', err));

    // // --- Optionally emit socket event to doctor about new appointment ---
    // emitToUser(doctorUser._id, 'new-appointment', {
    //     appointmentId: appointment._id,
    //     patientName: req.user.name,
    //     appointmentDate,
    //     appointmentTime
    // });

});


// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private/Doctor
const getDoctorAppointments = asyncHandler(async (req, res) => {
    if (req.user.role !== 'doctor') {
        res.status(403);
        throw new Error('Not authorized as a doctor');
    }

    const appointments = await Appointment.find({ doctor: req.user._id })
        .populate('patient', 'name email') // Populate patient's basic info
        .sort({ appointmentDate: 1, appointmentTime: 1 }); // Sort by date and time

    res.json(appointments);
});

// In updateAppointmentStatus, make sure to check if doctor.user is populated correctly:
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status value');
    }

    const appointment = await Appointment.findById(req.params.id)
        .populate({
            path: 'doctor',
            populate: { path: 'user' }
        })
        .populate('patient');

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    if (!appointment.doctor || !appointment.doctor.user) {
        res.status(500);
        throw new Error('Invalid doctor data linked to appointment');
    }

    if (appointment.doctor.user._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this appointment');
    }

    // Validate transition rules as before
    if (status === 'completed' && appointment.status !== 'confirmed') {
        res.status(400);
        throw new Error('Only confirmed appointments can be marked as completed');
    }

    appointment.status = status;
    const updatedAppointment = await appointment.save();

    // Emit socket updates
    emitToUser(appointment.patient._id, 'appointment:updated', {
        appointmentId: appointment._id,
        newStatus: status,
        doctorName: appointment.doctor.user.name
    });

    emitToUser(appointment.doctor.user._id, 'appointment:updated', {
        appointmentId: appointment._id,
        newStatus: status,
        patientName: appointment.patient.name
    });

    res.json(updatedAppointment);
});

// @desc    Create a prescription for a completed appointment
// @route   POST /api/appointments/:id/prescription
// @access  Private/Doctor
const createPrescription = asyncHandler(async (req, res) => {
    const { medicines, diagnosis, notes, eSignature } = req.body;
    const appointmentId = req.params.id;

    if (req.user.role !== 'doctor') {
        res.status(403);
        throw new Error('Not authorized as a doctor to create prescriptions');
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Ensure the doctor creating the prescription owns the appointment
    if (appointment.doctor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to create prescription for this appointment');
    }

    // Ensure appointment is completed before creating prescription
    if (appointment.status !== 'completed') {
        res.status(400);
        throw new Error('Prescription can only be created for completed appointments');
    }

    // Check if a prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({ appointment: appointmentId });
    if (existingPrescription) {
        res.status(400);
        throw new Error('Prescription already exists for this appointment');
    }

    const prescription = await Prescription.create({
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointment: appointment._id,
        medicines,
        diagnosis,
        notes,
        eSignature,
    });

    if (prescription) {
        res.status(201).json(prescription);
    } else {
        res.status(400);
        throw new Error('Invalid prescription data');
    }
});

// @desc    Handle payment callback (simplified)
// @route   POST /api/appointments/:id/payment-success
// @access  Private/Patient (or webhook from payment gateway)
const handlePaymentSuccess = asyncHandler(async (req, res) => {
    const { paymentId } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // In a real scenario, you'd verify the paymentId with Stripe/Razorpay API
    // For this example, we'll just update the status
    appointment.paymentStatus = 'paid';
    appointment.status = 'confirmed'; // Auto-confirm after payment
    appointment.paymentId = paymentId;

    const updatedAppointment = await appointment.save();

    res.json({ message: 'Payment successful and appointment confirmed', appointment: updatedAppointment });

    // TODO: Implement Socket.io notification to doctor about new confirmed appointment
});

module.exports = {
    getAppointmentById,
    bookAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    createPrescription,
    handlePaymentSuccess,
};
