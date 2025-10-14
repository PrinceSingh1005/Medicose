const asyncHandler = require('express-async-handler');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;

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
        .populate('user', 'name profilePhoto')
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
// Example endpoint: GET /api/doctors/user/:userId
const getDoctorById = asyncHandler(async (req, res) => {
    let doctor = await DoctorProfile.findById(req.params.id)
        .populate('user', 'name email role isVerified profilePhoto');

    // If not found by DoctorProfile _id, try finding by user _id
    if (!doctor) {
        doctor = await DoctorProfile.findOne({ user: req.params.id })
            .populate('user', 'name email role isVerified profilePhoto');
    }

    if (doctor && doctor.user?.role === 'doctor') {
        console.log(doctor);
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


const getDoctorStats = asyncHandler(async (req, res) => {
    // Find the doctor's profile ID from their user ID
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) {
        res.status(404);
        throw new Error('Doctor profile not found');
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const stats = await Appointment.aggregate([
        {
            // Match only paid, completed appointments for this doctor
            $match: {
                doctor: doctorProfile._id,
                status: 'completed',
                paymentStatus: 'paid'
            }
        },
        {
            // Use $facet to run multiple aggregation pipelines on the same data
            $facet: {
                // Pipeline for weekly earnings
                weekly: [
                    { $match: { appointmentDate: { $gte: startOfWeek } } },
                    { $group: { _id: null, total: { $sum: '$fees' } } }
                ],
                // Pipeline for monthly earnings
                monthly: [
                    { $match: { appointmentDate: { $gte: startOfMonth } } },
                    { $group: { _id: null, total: { $sum: '$fees' } } }
                ],
                // Pipeline for yearly earnings
                yearly: [
                    { $match: { appointmentDate: { $gte: startOfYear } } },
                    { $group: { _id: null, total: { $sum: '$fees' } } }
                ]
            }
        }
    ]);

    res.json({
        weeklyEarnings: stats[0].weekly[0]?.total || 0,
        monthlyEarnings: stats[0].monthly[0]?.total || 0,
        yearlyEarnings: stats[0].yearly[0]?.total || 0,
    });
});


// @desc    Get a list of unique patients for the logged-in doctor
// @route   GET /api/doctors/patients
// @access  Private/Doctor
const getDoctorPatients = asyncHandler(async (req, res) => {
    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) {
        res.status(404);
        throw new Error('Doctor profile not found');
    }

    // Use an aggregation pipeline to find unique patients from appointments
    const patients = await Appointment.aggregate([
        { $match: { doctor: doctorProfile._id } }, // Find all appointments for this doctor
        { $group: { _id: '$patient' } }, // Group them by patient to get unique patient IDs
        {
            // Look up the user details for each unique patient ID
            $lookup: {
                from: 'users', // The name of the users collection
                localField: '_id',
                foreignField: '_id',
                as: 'patientDetails'
            }
        },
        { $unwind: '$patientDetails' }, // Deconstruct the patientDetails array
        {
            // Project the final fields you want to send
            $project: {
                _id: '$patientDetails._id',
                name: '$patientDetails.name',
                email: '$patientDetails.email',
            }
        }
    ]);

    res.json(patients);
});

// @desc    Get a specific patient's history for the logged-in doctor
// @route   GET /api/doctors/patients/:patientId
// @access  Private/Doctor
const getPatientHistoryForDoctor = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    const doctorProfile = await DoctorProfile.findOne({ user: req.user._id });
    if (!doctorProfile) {
        res.status(404);
        throw new Error('Doctor profile not found');
    }

    // Fetch all data for this specific patient and doctor in parallel
    const [patient, appointments, prescriptions] = await Promise.all([
        User.findById(patientId).select('name email createdAt profilePhoto'),
        Appointment.find({ doctor: doctorProfile._id, patient: patientId }).sort({ appointmentDate: -1 }),
        Prescription.find({ doctor: doctorProfile._id, patient: patientId }).sort({ createdAt: -1 })
    ]);

    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }

    res.json({
        patient,
        appointments,
        prescriptions,
    });
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.params.id;
        const doctorProfile = await DoctorProfile.findById(doctorId);
        if (!doctorProfile) {
            res.status(404);
            throw new Error('Doctor profile not found');
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'doctor_profiles',
            transformation: [{ width: 200, height: 200, crop: 'fill' }],
        });
        await fs.unlink(req.file.path);
        doctorProfile.profilePhoto = result.secure_url;

        const user = await User.findById(req.user._id);
        if (user) {
            user.profilePhoto = result.secure_url;
            await user.save();
        }

        await doctorProfile.save();
        res.json({ message: 'Profile picture uploaded successfully', profilePhoto: doctorProfile.profilePhoto });
    } catch (error) {
        res.status(500);
        throw new Error('Error uploading profile picture');
    }
});

module.exports = {
    getDoctorPatients,
    getPatientHistoryForDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctorProfile,
    getDoctorPrescriptions,
    getMyDoctorProfile,
    getDoctorStats,
    uploadProfilePhoto
};