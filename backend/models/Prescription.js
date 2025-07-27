const mongoose = require('mongoose');

const prescriptionSchema = mongoose.Schema({
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        unique: true, // One prescription per appointment
    },
    medicines: [
        {
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            instructions: { type: String },
        },
    ],
    diagnosis: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    eSignature: { // Placeholder for doctor's e-signature (e.g., a hash or image URL)
        type: String,
    },
}, {
    timestamps: true,
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;