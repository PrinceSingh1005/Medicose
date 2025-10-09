const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Review = require('../models/Review');
const User = require('../models/User'); // To fetch doctor names for prescriptions/appointments
const PatientProfile = require('../models/PatientProfile');

// @desc    Get the profile for the logged-in patient
// @route   GET /api/patients/profile/me
// @access  Private/Patient
const getMyPatientProfile = asyncHandler(async (req, res) => {
    const profile = await PatientProfile.findOne({ user: req.user._id });

    if (profile) {
        res.json(profile);
    } else {
        res.status(404);
        throw new Error('Patient profile not found.');
    }
});

// @desc    Update the profile for the logged-in patient
// @route   PUT /api/patients/profile/me
// @access  Private/Patient
const updatePatientProfile = asyncHandler(async (req, res) => {
    const profile = await PatientProfile.findOne({ user: req.user._id });

    if (profile) {
        profile.dateOfBirth = req.body.dateOfBirth || profile.dateOfBirth;
        profile.gender = req.body.gender || profile.gender;
        profile.address = req.body.address || profile.address;
        profile.city = req.body.city || profile.city;
        profile.state = req.body.state || profile.state;
        profile.country = req.body.country || profile.country;
        profile.phone = req.body.phone || profile.phone;
        
        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } else {
        res.status(404);
        throw new Error('Patient profile not found.');
    }
});


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
        .populate('doctor', 'name email profilePhoto') 
        .populate('doctorProfile', 'specialization fees'); 

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
        .populate('patient', 'name email')
        .populate('doctor', 'name email') 
        .populate('appointment', 'appointmentDate appointmentTime');

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
    getMyPatientProfile,
    updatePatientProfile
};
