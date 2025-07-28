const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User'); // For fetching user details

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private/Patient
const bookAppointment = asyncHandler(async (req, res) => {
    const { doctorId, appointmentDate, appointmentTime, consultationType } = req.body;

    if (req.user.role !== 'patient') {
        res.status(403);
        throw new Error('Only patients can book appointments');
    }

    // Check if doctor exists and is verified
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || !doctor.isVerified) {
        res.status(404);
        throw new Error('Doctor not found or not verified');
    }

    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (!doctorProfile) {
        res.status(404);
        throw new Error('Doctor profile not found');
    }

    // Basic availability check (more complex logic needed for real-time slot management)
    // For simplicity, we'll assume the frontend sends a valid slot based on doctor's availability
    // In a real app, you'd check doctorProfile.availability for the given date/time

    // Check for existing appointments for this doctor at this exact time
    const existingAppointment = await Appointment.findOne({
        doctor: doctorId,
        appointmentDate: new Date(appointmentDate),
        appointmentTime: appointmentTime,
        status: { $in: ['pending', 'confirmed'] } // Check for pending or confirmed appointments
    });

    if (existingAppointment) {
        res.status(400);
        throw new Error('This time slot is already booked for the doctor.');
    }

    // Create a meeting link (simple placeholder, in real app use WebRTC room ID or Twilio/Agora)
    const meetingLink = `https://meet.medicose.com/${Math.random().toString(36).substring(2, 15)}`;

    const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        doctorProfile: doctorProfile._id,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        consultationType,
        paymentStatus: 'pending', // Payment will be handled separately
        meetingLink,
    });

    if (appointment) {
        res.status(201).json({
            message: 'Appointment booked successfully. Awaiting payment.',
            appointmentId: appointment._id,
            meetingLink: appointment.meetingLink,
            fees: doctorProfile.fees // Return fees for frontend payment processing
        });
    } else {
        res.status(400);
        throw new Error('Invalid appointment data');
    }
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

// @desc    Update appointment status (confirm/reject/complete)
// @route   PUT /api/appointments/:id/status
// @access  Private/Doctor
const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'confirmed', 'rejected', 'completed'
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Ensure the doctor updating the status owns the appointment
    if (appointment.doctor.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this appointment');
    }

    // Update status
    appointment.status = status;
    const updatedAppointment = await appointment.save();

    res.json(updatedAppointment);

    // TODO: Implement Socket.io notification to patient about status change
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
    bookAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    createPrescription,
    handlePaymentSuccess,
};