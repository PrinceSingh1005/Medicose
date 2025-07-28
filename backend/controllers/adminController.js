const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');

// @desc    Get all users (patients, doctors, admins)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password'); // Exclude passwords
    res.json(users);
});

// @desc    Get all doctors awaiting verification
// @route   GET /api/admin/doctors/pending
// @access  Private/Admin
const getPendingDoctors = asyncHandler(async (req, res) => {
    const doctors = await User.find({ role: 'doctor', isVerified: false })
        .select('-password')
        .populate('doctorProfile'); // Populate their profiles to see license info

    res.json(doctors);
});

// @desc    Verify a doctor
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private/Admin
const verifyDoctor = asyncHandler(async (req, res) => {
    const doctor = await User.findById(req.params.id);

    if (doctor && doctor.role === 'doctor') {
        doctor.isVerified = true;
        await doctor.save();
        res.json({ message: 'Doctor verified successfully' });
    } else {
        res.status(404);
        throw new Error('Doctor not found or not a doctor role');
    }
});

// @desc    Block/unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const { block } = req.body; // true to block, false to unblock

    if (user) {
        // Prevent admin from blocking themselves
        if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Cannot block yourself');
        }

        user.isBlocked = block; // Assuming you add an 'isBlocked' field to User model
        await user.save();
        res.json({ message: `User ${block ? 'blocked' : 'unblocked'} successfully` });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get analytics dashboard data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const verifiedDoctors = await User.countDocuments({ role: 'doctor', isVerified: true });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const totalRevenue = await Appointment.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
            $lookup: {
                from: 'doctorprofiles', // The collection name for DoctorProfile
                localField: 'doctorProfile',
                foreignField: '_id',
                as: 'doctorProfileData'
            }
        },
        { $unwind: '$doctorProfileData' },
        {
            $group: {
                _id: null,
                total: { $sum: '$doctorProfileData.fees' }
            }
        }
    ]);

    res.json({
        totalUsers,
        totalDoctors,
        verifiedDoctors,
        totalAppointments,
        completedAppointments,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        // Add more analytics as needed (e.g., appointments by specialization, patient growth)
    });
});


module.exports = {
    getAllUsers,
    getPendingDoctors,
    verifyDoctor,
    blockUser,
    getAnalytics,
};
