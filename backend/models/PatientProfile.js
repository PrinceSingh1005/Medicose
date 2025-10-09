const mongoose = require('mongoose');

const patientProfileSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    phone: {
        type: String,
    },
    profilePhoto:{
        type: String,
    }
}, {
    timestamps: true,
});

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

module.exports = PatientProfile;