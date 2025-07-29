import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ClipboardDocumentListIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

function PatientDashboard() {
  const { userInfo } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userInfo && userInfo.role === 'patient') {
      const fetchPatientData = async () => {
        try {
          setLoading(true);
          // Fetch appointments
          const apptRes = await axios.get('/patients/appointments');
          setAppointments(apptRes.data);

          // Fetch prescriptions
          const presRes = await axios.get('/patients/prescriptions');
          setPrescriptions(presRes.data);

          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      };
      fetchPatientData();
    }
  }, [userInfo]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;
  if (!userInfo || userInfo.role !== 'patient') return <Message type="error">Access Denied</Message>;

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Welcome, {userInfo.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarDaysIcon className="h-7 w-7 mr-2 text-primary" /> Upcoming Appointments
          </h2>
          {appointments.length === 0 ? (
            <Message type="info">You have no upcoming appointments. <Link to="/doctors" className="text-primary hover:underline">Book one now!</Link></Message>
          ) : (
            <ul className="space-y-4">
              {appointments.filter(appt => appt.status === 'confirmed' || appt.status === 'pending').map((appt) => (
                <li key={appt._id} className="border border-border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      Dr. {appt.doctor.name} - {appt.doctorProfile.specialization}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                    </p>
                    <p className={`text-sm font-semibold ${appt.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      Status: {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </p>
                  </div>
                  {appt.status === 'confirmed' && appt.consultationType === 'video' && (
                    <Link
                      to={`/video-call/${appt._id}`} // Pass appointment ID for video call
                      className="btn-primary flex items-center mt-3 sm:mt-0 sm:ml-4"
                    >
                      <VideoCameraIcon className="h-5 w-5 mr-2" /> Join Call
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-card p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <ClipboardDocumentListIcon className="h-7 w-7 mr-2 text-primary" /> Recent Prescriptions
          </h2>
          {prescriptions.length === 0 ? (
            <Message type="info">No prescriptions found yet.</Message>
          ) : (
            <ul className="space-y-4">
              {prescriptions.map((pres) => (
                <li key={pres._id} className="border border-border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      Prescription from Dr. {pres.doctor.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {new Date(pres.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/prescriptions/${pres._id}`}
                    className="btn-primary bg-indigo-500 hover:bg-indigo-600 flex items-center mt-3 sm:mt-0 sm:ml-4"
                  >
                    View Prescription
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Optional: Quick links, profile summary etc. */}
      <div className="mt-8 text-center">
        <Link to="/doctors" className="btn-primary text-lg">
          Explore Doctors
        </Link>
      </div>
    </div>
  );
}

export default PatientDashboard;
