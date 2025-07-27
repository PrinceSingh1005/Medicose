const mongoose = require('mongoose');

const doctorProfileSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Each user (doctor) has one profile
    },
    specialization: {
        type: String,
        required: true,
    },
    qualifications: {
        type: [String], // Array of strings for degrees/certifications
        required: true,
    },
    experience: {
        type: Number,
        required: true,
        default: 0,
    },
    fees: {
        type: Number,
        required: true,
        default: 0,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    availability: {
        type: Map, // Store availability as a map (e.g., "Monday": ["09:00", "17:00"])
        of: [String],
        default: {},
    },
    medicalLicense: {
        type: String, // URL or path to uploaded license document
        required: true,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);

module.exports = DoctorProfile;