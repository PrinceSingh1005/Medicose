const asyncHandler = require('express-async-handler');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User'); // To check if user is a doctor
const Prescription = require('../models/Prescription'); 


// @desc    Get all doctors (with search and filters)
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
    const { specialization, location, minRating, sortBy, search } = req.query;

    let query = {};

    // Filter by specialization
    if (specialization) {
        query.specialization = { $regex: specialization, $options: 'i' }; // Case-insensitive search
    }

    // Filter by location (city, state, country)
    if (location) {
        query.$or = [
            { city: { $regex: location, $options: 'i' } },
            { state: { $regex: location, $options: 'i' } },
            { country: { $regex: location, $options: 'i' } },
        ];
    }

    // Filter by minimum rating
    if (minRating) {
        query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Search by doctor name (requires joining with User model)
    let userQuery = { role: 'doctor', isVerified: true }; // Only verified doctors
    if (search) {
        userQuery.name = { $regex: search, $options: 'i' };
    }

    const doctors = await User.find(userQuery)
        .select('-password')
        .populate({
            path: 'doctorProfile', // Populate the doctorProfile field from the User model (if added)
            match: query, // Apply profile-specific filters here
        });

    // Filter out users who don't have a matching doctor profile
    const filteredDoctors = doctors.filter(doc => doc.doctorProfile);

    // Sorting logic
    let sortedDoctors = filteredDoctors;
    if (sortBy) {
        if (sortBy === 'feesAsc') {
            sortedDoctors.sort((a, b) => a.doctorProfile.fees - b.doctorProfile.fees);
        } else if (sortBy === 'feesDesc') {
            sortedDoctors.sort((a, b) => b.doctorProfile.fees - a.doctorProfile.fees);
        } else if (sortBy === 'experienceAsc') {
            sortedDoctors.sort((a, b) => a.doctorProfile.experience - b.doctorProfile.experience);
        } else if (sortBy === 'experienceDesc') {
            sortedDoctors.sort((a, b) => b.doctorProfile.experience - a.doctorProfile.experience);
        } else if (sortBy === 'rating') {
            sortedDoctors.sort((a, b) => b.doctorProfile.averageRating - a.doctorProfile.averageRating);
        }
    }

    res.json(sortedDoctors);
});

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await User.findById(req.params.id)
        .select('-password')
        .populate('doctorProfile'); // Populate doctor's profile

    if (doctor && doctor.role === 'doctor' && doctor.isVerified) {
        res.json(doctor);
    } else {
        res.status(404);
        throw new Error('Doctor not found or not verified');
    }
});

// @desc    Update doctor profile (by doctor themselves)
// @route   PUT /api/doctors/profile
// @access  Private/Doctor
const updateDoctorProfile = asyncHandler(async (req, res) => {
    // Ensure the logged-in user is a doctor
    if (req.user.role !== 'doctor') {
        res.status(403);
        throw new Error('Not authorized as a doctor');
    }

    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });

    if (doctorProfile) {
        // Update fields if provided in the request body
        doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
        doctorProfile.qualifications = req.body.qualifications || doctorProfile.qualifications;
        doctorProfile.experience = req.body.experience || doctorProfile.experience;
        doctorProfile.fees = req.body.fees || doctorProfile.fees;
        doctorProfile.address = req.body.address || doctorProfile.address;
        doctorProfile.city = req.body.city || doctorProfile.city;
        doctorProfile.state = req.body.state || doctorProfile.state;
        doctorProfile.country = req.body.country || doctorProfile.country;
        doctorProfile.phone = req.body.phone || doctorProfile.phone;
        doctorProfile.bio = req.body.bio || doctorProfile.bio;
        doctorProfile.availability = req.body.availability || doctorProfile.availability;
        doctorProfile.medicalLicense = req.body.medicalLicense || doctorProfile.medicalLicense; // For license re-upload

        const updatedDoctorProfile = await doctorProfile.save();
        res.json(updatedDoctorProfile);
    } else {
        res.status(404);
        throw new Error('Doctor profile not found');
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
        .populate('patient', 'name email') // Populate patient's basic info
        .populate('appointment', 'appointmentDate appointmentTime') // Populate relevant appointment details
        .sort({ createdAt: -1 }); // Sort by most recent first

    res.json(prescriptions);
});

module.exports = {
    getDoctors,
    getDoctorById,
    updateDoctorProfile,
    getDoctorPrescriptions,
};
