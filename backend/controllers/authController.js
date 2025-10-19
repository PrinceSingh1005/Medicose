const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const generateToken = require('../utils/generateToken');
const PatientProfile = require('../models/PatientProfile');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create new user (initially without doctorProfile reference)
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'patient', // Default role is patient
    });

    if (user) {
        if (role === 'patient') {
            await PatientProfile.create({ user: user._id });
        }
        if (user.role === 'doctor') {
            const doctorProfile = await DoctorProfile.create({
                user: user._id,
                specialization: 'Not Specified', // Default values
                qualifications: [],
                experience: 0,
                fees: 0,
                address: 'Not Specified',
                city: 'Not Specified',
                state: 'Not Specified',
                country: 'Not Specified',
                phone: 'Not Specified',
                medicalLicense: 'Not Specified', // Will be updated later
                profilePhoto: '', // Will be updated later
            });
            // Link the created doctorProfile to the user
            user.doctorProfile = doctorProfile._id;
            await user.save(); // Save the user again to update the doctorProfile reference
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id), // Generate JWT token
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id),
            profilePhoto: user.profilePhoto,
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
        let profileData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profilePhoto: user.profilePhoto,
        };

        // If user is a doctor, fetch their profile details and populate the doctorProfile field
        if (user.role === 'doctor') {
            // Populate the doctorProfile field directly from the user object
            const populatedUser = await User.findById(req.user._id)
                                            .select('-password')
                                            .populate('doctorProfile'); // Populate the newly added field

            profileData = { ...profileData, doctorProfile: populatedUser.doctorProfile };
        }
        res.json(profileData);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password; // Password hashing handled by pre-save hook in User model
        }

        // Handle doctor profile updates
        if (user.role === 'doctor' && req.body.doctorProfile) {
            const doctorProfile = await DoctorProfile.findOne({ user: user._id });
            if (doctorProfile) {
                // Update doctor profile fields
                Object.assign(doctorProfile, req.body.doctorProfile);
                await doctorProfile.save();
            }
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            profilePhoto: updatedUser.profilePhoto,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
