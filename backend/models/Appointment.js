const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctorProfile: { // Reference to the doctor's profile for easy access to fees etc.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoctorProfile',
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    appointmentTime: { // Store time as string for simplicity (e.g., "10:00 AM")
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'],
        default: 'pending',
    },
    meetingStatus: { 
      type: String,
      enum: ['pending', 'active', 'ended'],
      default: 'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
    },
    paymentId: { // Store payment gateway transaction ID
        type: String,
    },
    consultationType: {
        type: String,
        enum: ['video', 'in-person'],
        default: 'video',
    },
    meetingLink: { // For video calls (e.g., WebRTC room ID or external link)
        type: String,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
