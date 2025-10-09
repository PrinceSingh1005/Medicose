import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, ClipboardDocumentListIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';

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
          const apptRes = await axios.get('/patients/appointments');
          setAppointments(apptRes.data);

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
    <div>
      <Navbar />
      <div className="py-10 px-4 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          Welcome, {userInfo.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Appointments */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <CalendarDaysIcon className="h-7 w-7 mr-2 text-blue-600" />
              Upcoming Appointments
            </h2>
            {appointments.length === 0 ? (
              <Message type="info">
                You have no upcoming appointments.{' '}
                <Link to="/doctors" className="text-blue-600 font-medium hover:underline">
                  Book one now!
                </Link>
              </Message>
            ) : (
              <ul className="space-y-5">
                {appointments
                  .filter(appt => appt.status === 'confirmed' || appt.status === 'pending')
                  .map(appt => (
                    <li
                      key={appt._id}
                      className="p-5 rounded-xl border border-gray-300 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Dr. {appt.doctor.name} — {appt.doctorProfile.specialization}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                        </p>
                        <p
                          className={`text-sm font-semibold mt-1 ${appt.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                            }`}
                        >
                          Status: {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                        </p>
                      </div>
                      {appt.status === 'confirmed' && appt.consultationType === 'video' && (
                        <Link
                          to={`/video-call/${appt._id}`}
                          className="inline-flex items-center mt-3 sm:mt-0 sm:ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-all"
                        >
                          <VideoCameraIcon className="h-5 w-5 mr-2" />
                          Join Call
                        </Link>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Prescriptions */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <ClipboardDocumentListIcon className="h-7 w-7 mr-2 text-purple-600" />
              Recent Prescriptions
            </h2>
            {prescriptions.length === 0 ? (
              <Message type="info">No prescriptions found yet.</Message>
            ) : (
              <ul className="space-y-5">
                {prescriptions.map(pres => (
                  <li
                    key={pres._id}
                    className="p-5 rounded-xl border border-gray-300 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                  >
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Prescription from Dr. {pres.doctor.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(pres.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/prescriptions/${pres._id}`}
                      className="inline-flex items-center mt-3 sm:mt-0 sm:ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-all"
                    >
                      View Prescription
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <Link
            to="/doctors"
            className="inline-block px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-all"
          >
            Explore Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
