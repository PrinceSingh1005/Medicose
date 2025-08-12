const Appointment = require('../models/Appointment');

/**
 * Validates if a time slot is available for a doctor based on existing appointments
 * @param {string} timeSlot - The time slot to check (format: "HH:MM")
 * @param {Date} date - Appointment date
 * @param {string} doctorId - Doctor's ID (DoctorProfile._id)
 * @returns {Promise<boolean>} - Returns true if time slot is available
 */
const isValidTimeSlot = async (timeSlot, date, doctorId) => {
    try {
        // Basic format validation
        if (!/^\d{2}:\d{2}$/.test(timeSlot)) return false;

        // Ensure date is valid and in the future
        const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(slotHours, slotMinutes, 0, 0);

        if (isNaN(slotDateTime.getTime()) || slotDateTime < new Date()) return false;

        // Check if another appointment already exists at that time for the doctor
        const existing = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate: new Date(date),
            appointmentTime: timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        return !existing;
    } catch (error) {
        console.error('Error validating time slot:', error);
        return false;
    }
};

module.exports = {
    isValidTimeSlot
};
