const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
        user: config.email.user,
        pass: config.email.password
    }
});

/**
 * Sends appointment confirmation email
 * @param {Object} params - { patient, doctor, appointment }
 * @returns {Promise<void>}
 */
const sendAppointmentConfirmation = async ({ patient, doctor, appointment }) => {
    try {
        const mailOptions = {
            from: `"Clinic System" <${config.email.from}>`,
            to: patient.email,
            subject: 'Your Appointment Confirmation',
            html: `
                <h2>Appointment Confirmed</h2>
                <p>Dear ${patient.name},</p>
                <p>Your appointment with Dr. ${doctor.name} has been booked successfully.</p>
                
                <h3>Appointment Details:</h3>
                <ul>
                    <li>Date: ${appointment.appointmentDate.toDateString()}</li>
                    <li>Time: ${appointment.appointmentTime}</li>
                    <li>Type: ${appointment.consultationType}</li>
                    <li>Fees: $${appointment.fees}</li>
                </ul>
                
                <p>Thank you for using our services.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${patient.email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        throw error;
    }
};

/**
 * Sends appointment status update email
 * @param {Object} params - { patient, doctor, appointment, oldStatus, newStatus }
 */
const sendStatusUpdate = async ({ patient, doctor, appointment, oldStatus, newStatus }) => {
    // Similar implementation for status change emails
};

module.exports = {
    sendAppointmentConfirmation,
    sendStatusUpdate
};