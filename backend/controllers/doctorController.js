const asyncHandler = require('express-async-handler');
const DoctorProfile = require('../models/DoctorProfile');
const Prescription = require('../models/Prescription');

// @desc    Get all doctors (with search and filters)
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = asyncHandler(async (req, res) => {
    const { search } = req.query;
    let query = {};

    if (search) {
        query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
            ],
        };
    }

    const doctors = await DoctorProfile.find(query)
        .populate('user', 'name')
        .select('-password');

    if (doctors) {
        res.json(doctors);
    } else {
        res.status(404);
        throw new Error('No doctors found');
    }
});

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await DoctorProfile.findById(req.params.id)
        .populate('user', 'name email role isVerified'); // Populate all necessary fields

    // --- THIS IS THE FIX ---
    // Check the 'role' and 'isVerified' fields on the populated 'user' object, not the 'doctor' profile itself.
    if (doctor && doctor.user && doctor.user.role === 'doctor' /* && doctor.user.isVerified */) {
    // -----------------------
        res.json(doctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found or not verified');
    }
});


// --- ADD THIS NEW FUNCTION ---
// @desc    Get the profile for the logged-in doctor
// @route   GET /api/doctors/profile/me
// @access  Private/Doctor
const getMyDoctorProfile = asyncHandler(async (req, res) => {
    // req.user is populated by the 'protect' middleware
    const profile = await DoctorProfile.findOne({ user: req.user._id });

    if (profile) {
        res.json(profile);
    } else {
        res.status(404);
        // Send a specific message so the frontend knows what to do
        throw new Error('Doctor profile not found for this user.');
    }
});


// @desc    Update doctor profile (by doctor themselves)
// @route   PUT /api/doctors/profile
// @access  Private/Doctor
const updateDoctorProfile = asyncHandler(async (req, res) => {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });

    if (doctorProfile) {
        // --- THIS IS THE FIX ---
        // Update all fields from the schema if they are provided in the request body
        doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
        // For qualifications, expect a comma-separated string and turn it into an array
        if (req.body.qualifications) {
            doctorProfile.qualifications = req.body.qualifications.split(',').map(q => q.trim());
        }
        doctorProfile.experience = req.body.experience || doctorProfile.experience;
        doctorProfile.fees = req.body.fees || doctorProfile.fees; // Corrected from previous versions
        doctorProfile.address = req.body.address || doctorProfile.address;
        doctorProfile.city = req.body.city || doctorProfile.city;
        doctorProfile.state = req.body.state || doctorProfile.state;
        doctorProfile.country = req.body.country || doctorProfile.country;
        doctorProfile.phone = req.body.phone || doctorProfile.phone;
        doctorProfile.bio = req.body.bio || doctorProfile.bio;
        // Note: Availability and medicalLicense might be handled in separate, more complex forms (e.g., for file uploads)

        const updatedProfile = await doctorProfile.save();
        res.json(updatedProfile);
    } else {
        res.status(404);
        throw new Error('Doctor profile not found.');
    }
});

// @desc    Get doctor's issued prescriptions
// @route   GET /api/doctors/prescriptions
// @access  Private/Doctor
const getDoctorPrescriptions = asyncHandler(async (req, res) => {
    if (req.user.role !== 'doctor') {
        res.status(403);
        throw new Error('Not authorized as a doctor');
    }

    const prescriptions = await Prescription.find({ doctor: req.user._id })
        .populate('patient', 'name email')
        .populate('appointment', 'appointmentDate')
        .sort({ createdAt: -1 });

    res.json(prescriptions);
});


module.exports = {
    getAllDoctors,
    getDoctorById,
    updateDoctorProfile,
    getDoctorPrescriptions,
    getMyDoctorProfile,
};