const asyncHandler = require('express-async-handler');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Prescription = require('../models/Prescription'); // Added for getDoctorPrescriptions

// @desc    Get all doctors (with search and filters)
// @route   GET /api/doctors
// @access  Public
const getDoctors = asyncHandler(async (req, res) => {
    const { specialization, location, minRating, sortBy, search } = req.query;

    let doctorProfileFilter = {}; // Filters that apply to DoctorProfile model
    let userFilter = { role: 'doctor', isVerified: true }; // Base filters for User model (only verified doctors)

    // 1. Build filters for DoctorProfile
    if (specialization) {
        doctorProfileFilter.specialization = { $regex: specialization, $options: 'i' }; // Case-insensitive search
    }
    if (location) {
        // Use $or for location to search across city, state, or country
        doctorProfileFilter.$or = [
            { city: { $regex: location, $options: 'i' } },
            { state: { $regex: location, $options: 'i' } },
            { country: { $regex: location, $options: 'i' } },
        ];
    }
    if (minRating) {
        doctorProfileFilter.averageRating = { $gte: parseFloat(minRating) };
    }

    // 2. Build filters for User (doctor's name search)
    if (search) {
        userFilter.name = { $regex: search, $options: 'i' };
    }

    // 3. If there are any filters for DoctorProfile, find the corresponding DoctorProfile IDs
    let finalUserQuery = { ...userFilter }; // Start with base user filters

    if (Object.keys(doctorProfileFilter).length > 0) {
        const matchingProfiles = await DoctorProfile.find(doctorProfileFilter).select('_id');
        const matchingProfileIds = matchingProfiles.map(profile => profile._id);

        // If no doctor profiles match the criteria, then no users will match either
        if (matchingProfileIds.length === 0) {
            return res.json([]); // Return empty array early
        }

        // Add the found doctorProfile IDs to the final user query
        // This ensures that the user's doctorProfile field matches one of the found profile IDs
        finalUserQuery.doctorProfile = { $in: matchingProfileIds };
    }

    // 4. Find Users based on the combined filters and populate their profiles
    // Use finalUserQuery which now correctly combines all conditions
    const doctors = await User.find(finalUserQuery)
        .select('-password')
        .populate('doctorProfile');

    // Filter out users who don't have a populated doctorProfile (should be rare with correct data)
    // or if the population somehow failed.
    const filteredDoctors = doctors.filter(doc => doc.doctorProfile);


    // 5. Apply sorting logic (remains the same)
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
