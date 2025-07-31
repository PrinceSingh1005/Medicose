import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, CheckCircleIcon, XCircleIcon, VideoCameraIcon, ClipboardDocumentIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

function DoctorDashboard() {
  const { userInfo } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/appointments/doctor');
      console.log(data);
      setAppointments(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.role === 'doctor') {
      fetchAppointments();
    }
  }, [userInfo]);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await axios.put(`/appointments/${appointmentId}/status`, { status });
      fetchAppointments(); // Re-fetch appointments after update
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;
  if (!userInfo || userInfo.role !== 'doctor') return <Message type="error">Access Denied</Message>;

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Welcome, Dr. {userInfo.name}!
      </h1>

      <div className="bg-card p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="h-7 w-7 mr-2 text-primary" /> Your Appointments
        </h2>
        {appointments.length === 0 ? (
          <Message type="info">You have no appointments scheduled.</Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {appointments.map((appt) => (
                  <tr key={appt._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appt.patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {appt.consultationType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                        }`}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                              title="Confirm Appointment"
                            >
                              <CheckCircleIcon className="h-6 w-6" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Reject Appointment"
                            >
                              <XCircleIcon className="h-6 w-6" />
                            </button>
                          </>
                        )}
                        {appt.status === 'confirmed' && appt.consultationType === 'video' && (
                          <Link
                            to={`/doctor/video-call/${appt._id}`} // Doctor can also join the call
                            className="text-primary hover:text-indigo-700"
                            title="Join Video Call"
                          >
                            <VideoCameraIcon className="h-6 w-6" />
                          </Link>
                        )}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt._id, 'completed')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Mark as Completed"
                          >
                            <ClipboardDocumentIcon className="h-6 w-6" />
                          </button>
                        )}
                        {appt.status === 'completed' && (
                          <Link
                            to={`/doctor/create-prescription/${appt._id}`} // Link to a prescription creation page
                            className="text-purple-600 hover:text-purple-900"
                            title="Create Prescription"
                          >
                            <ClipboardDocumentListIcon className="h-6 w-6" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 text-center">
        <Link to="/doctor/profile" className="btn-primary text-lg mr-4">
          Update Profile
        </Link>
        {/* Add more links like "View Prescriptions Created" */}
      </div>
    </div>
  );
}

export default DoctorDashboard;
