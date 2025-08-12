import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorDetails } from '../features/doctor/doctorSlice';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { CalendarDaysIcon, ClockIcon, VideoCameraIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

function AppointmentBookingPage() {
    const { id: doctorProfileId } = useParams();
    const { state: routeState } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux state
    const { selectedDoctor: doctor, loading: doctorLoading, error: doctorError } = useSelector((state) => state.doctors);
    const { userInfo } = useSelector((state) => state.auth);

    // Form state
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultationType, setConsultationType] = useState('video');

    // Booking state
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(null);

    // Data loading state
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        // Check if we have doctor data from route state (coming from DoctorDetailsPage)
        if (routeState?.doctorData) {
            setIsInitialized(true);
            return;
        }

        // Otherwise fetch from API if:
        // 1. We don't have doctor data OR
        // 2. The doctor ID doesn't match
        if (doctorProfileId && (!doctor || doctor._id !== doctorProfileId)) {
            console.log('Fetching doctor with ID:', doctorProfileId);
            dispatch(fetchDoctorDetails(doctorProfileId))
                .finally(() => setIsInitialized(true));
        } else {
            setIsInitialized(true);
        }
    }, [dispatch, doctorProfileId, userInfo, navigate, doctor, routeState]);

    console.log('Current doctor:', doctor);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        setBookingError(null);
        setBookingSuccess(null);

        try {
            const currentDoctor = routeState?.doctorData || doctor;
            if (!currentDoctor) {
                throw new Error('Doctor information not available');
            }

            const appointmentData = {
                doctorId: currentDoctor.user._id,
                appointmentDate: selectedDate,
                appointmentTime: selectedTime,
                consultationType,
            };

            await axios.post('/appointments', appointmentData);

            setBookingSuccess('Appointment booked successfully! Redirecting...');
            setTimeout(() => navigate('/patient/dashboard'), 2000);

        } catch (err) {
            setBookingError(err.response?.data?.message || err.message || 'Failed to book appointment.');
        } finally {
            setBookingLoading(false);
        }
    };

    // --- RENDER GUARDS ---
    if (!userInfo) return null; // Redirecting to login

    if (!isInitialized || doctorLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
                <p className="ml-4">Loading doctor details...</p>
            </div>
        );
    }

    if (doctorError) {
        return (
            <div className="text-center p-8">
                <Message variant="danger">
                    Failed to load doctor details: {doctorError}
                </Message>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 btn-primary"
                >
                    Try Again
                </button>
            </div>
        ); 
    }

    const currentDoctor = routeState?.doctorData || doctor;
    if (!currentDoctor) {
        return (
            <div className="text-center p-8">
                <Message variant="warning">
                    Doctor information not available
                </Message>
            </div>
        );
    }

    const getDayOfWeek = (dateString) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const date = new Date(dateString);
        return days[date.getDay()];
    };

    // --- MAIN RENDER ---
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="bg-white shadow-xl rounded-lg p-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
                <p className="text-xl text-gray-600 mb-6">
                    With <strong>{currentDoctor.user?.name || 'Dr. Anonymous'}</strong>
                </p>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                    <p><strong>Specialization:</strong> {currentDoctor.specialization}</p>
                    <p><strong>Consultation Fee:</strong> ${currentDoctor.fees || 0}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {bookingSuccess && <Message variant="success">{bookingSuccess}</Message>}
                    {bookingError && <Message variant="danger">{bookingError}</Message>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label htmlFor="appointmentDate" className="block text-lg font-medium text-gray-700 mb-2">
                                <CalendarDaysIcon className="h-5 w-5 inline-block mr-1" /> Select Date
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
                                <ClockIcon className="h-5 w-5 inline-block mr-1" /> Select Time
                            </label>
                            <select
                                id="appointmentTime"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                disabled={!selectedDate} // Disable until a date is picked
                            >
                                <option value="" disabled>-- Select a time slot --</option>
                                {selectedDate ? (
                                    (() => {
                                        const day = getDayOfWeek(selectedDate);
                                        const slots = currentDoctor.availability?.[day] || [];
                                        return slots.length > 0 ? (
                                            slots.map((time, idx) => (
                                                <option key={`${day}-${idx}`} value={time}>
                                                    {day} - {time}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No slots available for {day}</option>
                                        );
                                    })()
                                ) : (
                                    <option disabled>Please select a date first</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-lg font-medium text-gray-700 mb-2">Consultation Type</label>
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="consultationType"
                                    value="video"
                                    checked={consultationType === 'video'}
                                    onChange={() => setConsultationType('video')}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <span className="ml-2 flex items-center">
                                    <VideoCameraIcon className="h-5 w-5 mr-1" /> Video Call
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="consultationType"
                                    value="in-person"
                                    checked={consultationType === 'in-person'}
                                    onChange={() => setConsultationType('in-person')}
                                    className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <span className="ml-2 flex items-center">
                                    <BuildingOfficeIcon className="h-5 w-5 mr-1" /> In-Person
                                </span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={bookingLoading || !selectedDate || !selectedTime}
                        className="w-full btn-primary text-lg py-3 rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                    >
                        {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AppointmentBookingPage;