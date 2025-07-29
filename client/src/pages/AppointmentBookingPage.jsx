import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorDetails, clearSelectedDoctor } from '../features/doctor/doctorSlice';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { CalendarDaysIcon, ClockIcon, CurrencyDollarIcon, VideoCameraIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

function AppointmentBookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedDoctor, loading: doctorLoading, error: doctorError } = useSelector((state) => state.doctors);
  const { userInfo } = useSelector((state) => state.auth);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('video'); // Default to video
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login'); // Redirect to login if not authenticated
    }
    dispatch(fetchDoctorDetails(doctorId));
    return () => {
      dispatch(clearSelectedDoctor());
    };
  }, [dispatch, doctorId, userInfo, navigate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(''); // Reset time when date changes
  };

  const generateTimeSlots = () => {
    if (!selectedDoctor || !selectedDate) return [];

    const dayOfWeek = new Date(selectedDate).toLocaleString('en-US', { weekday: 'long' });
    const availability = selectedDoctor.doctorProfile?.availability?.[dayOfWeek];

    if (!availability || availability.length === 0) {
      return []; // No availability for this day
    }

    const [startTimeStr, endTimeStr] = availability;
    const slots = [];
    let currentTime = new Date(`2000/01/01 ${startTimeStr}`);
    const endTime = new Date(`2000/01/01 ${endTimeStr}`);

    while (currentTime < endTime) {
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute slots
    }
    return slots;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        '/appointments',
        {
          doctorId,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          consultationType,
        },
        config
      );
      setBookingSuccess(data.message);
      // In a real app, you'd integrate with Stripe/Razorpay here
      alert(`Appointment booked! Next step: Payment of $${data.fees}. Meeting link: ${data.meetingLink}`);
      navigate(`/patient/dashboard`); // Redirect to dashboard after booking
    } catch (err) {
      setBookingError(err.response?.data?.message || err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (doctorLoading) return <LoadingSpinner />;
  if (doctorError) return <Message type="error">{doctorError}</Message>;
  if (!selectedDoctor) return <Message type="info">Doctor details not available.</Message>;

  const doctor = selectedDoctor;
  const profile = doctor.doctorProfile;
  const availableTimeSlots = generateTimeSlots();

  return (
    <div className="py-8">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Book Appointment with Dr. {doctor.name}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Specialization: <span className="font-semibold">{profile.specialization}</span> | Fees: <span className="font-semibold">${profile.fees}</span>
        </p>

        {bookingError && <Message type="error">{bookingError}</Message>}
        {bookingSuccess && <Message type="success">{bookingSuccess}</Message>}
        {bookingLoading && <LoadingSpinner />}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarDaysIcon className="h-5 w-5 inline-block mr-1 text-primary" /> Select Date
            </label>
            <input
              id="appointmentDate"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="input-field"
              min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
              required
            />
          </div>

          <div>
            <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
              <ClockIcon className="h-5 w-5 inline-block mr-1 text-primary" /> Select Time Slot
            </label>
            <select
              id="appointmentTime"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="input-field"
              disabled={!selectedDate || availableTimeSlots.length === 0}
              required
            >
              <option value="">Select a time</option>
              {availableTimeSlots.length === 0 && selectedDate && (
                <option disabled>No slots available for this date.</option>
              )}
              {availableTimeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="consultationType" className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Type
            </label>
            <div className="flex space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary h-5 w-5"
                  name="consultationType"
                  value="video"
                  checked={consultationType === 'video'}
                  onChange={(e) => setConsultationType(e.target.value)}
                />
                <span className="ml-2 text-gray-700 flex items-center">
                  <VideoCameraIcon className="h-5 w-5 mr-1" /> Video Call
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-primary h-5 w-5"
                  name="consultationType"
                  value="in-person"
                  checked={consultationType === 'in-person'}
                  onChange={(e) => setConsultationType(e.target.value)}
                />
                <span className="ml-2 text-gray-700 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-1" /> In-Person
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg"
            disabled={bookingLoading || !selectedDate || !selectedTime}
          >
            {bookingLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentBookingPage;
