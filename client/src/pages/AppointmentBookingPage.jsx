// In frontend/src/pages/AppointmentBookingPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorDetails, clearSelectedDoctor } from '../features/doctor/doctorSlice';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { CalendarDaysIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

function AppointmentBookingPage() {
    const { id: doctorId } = useParams(); 
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedDoctor: doctor, loading: doctorLoading, error: doctorError } = useSelector((state) => state.doctors);
    // Get both userInfo and the auth loading state
    const { userInfo, loading: authLoading } = useSelector((state) => state.auth);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('video');
    
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }
        if (!userInfo) {
            navigate('/login');
            return; 
        }
        if (doctorId) {
            dispatch(fetchDoctorDetails(doctorId));
        }
        return () => {
            dispatch(clearSelectedDoctor());
        }
    }, [dispatch, doctorId, userInfo, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        setBookingError(null);
        setBookingSuccess(null);

        try {
            const appointmentData = {
                doctorId: doctor.user._id,
                patientId: userInfo._id,
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                consultationType,
                fees: doctor.fees,
            };

            await axios.post('/appointments', appointmentData);
            
            setBookingSuccess('Appointment booked successfully! Redirecting...');
            setTimeout(() => {
                navigate('/patient/dashboard');
            }, 2000);

        } catch (err) {
            setBookingError(err.response?.data?.message || 'Failed to book appointment.');
        } finally {
            setBookingLoading(false);
        }
    };

    // Show a single, combined loading spinner
    if (authLoading || doctorLoading) {
        return <LoadingSpinner />;
    }

    // Handle any errors that occur
    if (doctorError) {
        return <div className="text-center p-8"><Message variant="danger">{doctorError}</Message></div>;
    }
    
    // Handle the case where the doctor isn't found after loading
    if (!doctor) {
        return <div className="text-center p-8"><Message>Doctor details could not be loaded.</Message></div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-white shadow-xl rounded-lg p-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
                <p className="text-xl text-gray-600 mb-6">
                    With <strong>{doctor.user?.name || 'Dr. Anonymous'}</strong>
                </p>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <p><strong>Specialization:</strong> {doctor.specialization}</p>
                    <p><strong>Consultation Fee:</strong> ${doctor.fees || 0}</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {bookingSuccess && <Message variant="success">{bookingSuccess}</Message>}
                    {bookingError && <Message variant="danger">{bookingError}</Message>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label htmlFor="appointmentDate" className="block text-lg font-medium text-gray-700 mb-2">
                                <CalendarDaysIcon className="h-5 w-5 inline-block mr-1"/> Select Date
                            </label>
                            <input
                                type="date"
                                id="appointmentDate"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                min={new Date().toISOString().split('T')[0]} 
                            />
                        </div>
                        <div>
                             <label htmlFor="appointmentTime" className="block text-lg font-medium text-gray-700 mb-2">
                                <ClockIcon className="h-5 w-5 inline-block mr-1"/> Select Time
                            </label>
                            <select
                                id="appointmentTime"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            >
                                <option value="" disabled>-- Select a time slot --</option>
                                {Array.isArray(doctor.availability) ? (
                                    doctor.availability.map((slot, index) => (
                                        <option key={index} value={slot.time}>{slot.day} - {slot.time}</option>
                                    ))
                                ) : (
                                    <option disabled>No specific time slots found</option>
                                )}
                            </select>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700 mb-2">Consultation Type</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center"><input type="radio" name="consultationType" value="video" checked={consultationType === 'video'} onChange={() => setConsultationType('video')} className="h-4 w-4 text-primary focus:ring-primary"/><span className="ml-2 flex items-center"><VideoCameraIcon className="h-5 w-5 mr-1"/> Video Call</span></label>
                            <label className="flex items-center"><input type="radio" name="consultationType" value="in-person" checked={consultationType === 'in-person'} onChange={() => setConsultationType('in-person')} className="h-4 w-4 text-primary focus:ring-primary"/><span className="ml-2 flex items-center"><BuildingOfficeIcon className="h-5 w-5 mr-1"/> In-Person</span></label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={bookingLoading || !selectedDate || !selectedTime}
                        className="w-full btn-primary text-lg py-3 rounded-lg disabled:bg-gray-400"
                    >
                        {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AppointmentBookingPage;