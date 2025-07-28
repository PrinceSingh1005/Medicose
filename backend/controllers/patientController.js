const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Review = require('../models/Review');
const User = require('../models/User'); // To fetch doctor names for prescriptions/appointments

// @desc    Get patient's appointments
// @route   GET /api/patients/appointments
// @access  Private/Patient
const getPatientAppointments = asyncHandler(async (req, res) => {
    if (req.user.role !== 'patient') {
        res.status(403);
        throw new Error('Not authorized as a patient');
    }

    // Find appointments for the logged-in patient
    const appointments = await Appointment.find({ patient: req.user._id })
        .populate('doctor', 'name email') // Populate doctor's basic info
        .populate('doctorProfile', 'specialization fees'); // Populate doctor's profile info

    res.json(appointments);
});

// @desc    Get patient's prescriptions
// @route   GET /api/patients/prescriptions
// @access  Private/Patient
const getPatientPrescriptions = asyncHandler(async (req, res) => {
    if (req.user.role !== 'patient') {
        res.status(403);
        throw new Error('Not authorized as a patient');
    }

    // Find prescriptions for the logged-in patient
    const prescriptions = await Prescription.find({ patient: req.user._id })
        .populate('doctor', 'name email') // Populate doctor's basic info
        .populate('appointment', 'appointmentDate appointmentTime'); // Populate appointment details

    res.json(prescriptions);
});

// @desc    Submit a review for a doctor
// @route   POST /api/patients/reviews
// @access  Private/Patient
const submitReview = asyncHandler(async (req, res) => {
    const { doctorId, rating, comment } = req.body;

    if (req.user.role !== 'patient') {
        res.status(403);
        throw new Error('Not authorized as a patient');
    }

    // Check if the doctor exists and is verified
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || !doctor.isVerified) {
        res.status(404);
        throw new Error('Doctor not found or not verified');
    }

    // Optional: Check if patient has actually had an appointment with this doctor
    const hasAppointment = await Appointment.findOne({
        patient: req.user._id,
        doctor: doctorId,
        status: 'completed',
    });

    if (!hasAppointment) {
        res.status(400);
        throw new Error('You can only review doctors you have had a completed appointment with.');
    }

    // Check if patient has already reviewed this doctor for this appointment (or generally)
    const alreadyReviewed = await Review.findOne({
        patient: req.user._id,
        doctor: doctorId,
    });

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this doctor.');
    }

    const review = await Review.create({
        patient: req.user._id,
        doctor: doctorId,
        rating,
        comment,
    });

    if (review) {
        res.status(201).json({ message: 'Review submitted successfully' });
    } else {
        res.status(400);
        throw new Error('Invalid review data');
    }
});


module.exports = {
    getPatientAppointments,
    getPatientPrescriptions,
    submitReview,
};
