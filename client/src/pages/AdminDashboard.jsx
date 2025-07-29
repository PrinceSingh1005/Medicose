import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { UserGroupIcon, CheckBadgeIcon, ChartBarIcon,CalendarDaysIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

function AdminDashboard() {
  const { userInfo } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch analytics
      const analyticsRes = await axios.get('/admin/analytics');
      setAnalytics(analyticsRes.data);

      // Fetch pending doctors
      const pendingDoctorsRes = await axios.get('/admin/doctors/pending');
      setPendingDoctors(pendingDoctorsRes.data);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.role === 'admin') {
      fetchAdminData();
    }
  }, [userInfo]);

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await axios.put(`/admin/doctors/${doctorId}/verify`);
      fetchAdminData(); // Re-fetch data to update list
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleBlockUser = async (userId, blockStatus) => {
    try {
      await axios.put(`/admin/users/${userId}/block`, { block: blockStatus });
      fetchAdminData(); // Re-fetch data
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;
  if (!userInfo || userInfo.role !== 'admin') return <Message type="error">Access Denied</Message>;

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Admin Dashboard
      </h1>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <UserGroupIcon className="h-10 w-10 text-primary" />
            <div>
              <p className="text-gray-600">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-900">{analytics.totalUsers}</h3>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <CheckBadgeIcon className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-gray-600">Verified Doctors</p>
              <h3 className="text-3xl font-bold text-gray-900">{analytics.verifiedDoctors} / {analytics.totalDoctors}</h3>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <CalendarDaysIcon className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-gray-600">Total Appointments</p>
              <h3 className="text-3xl font-bold text-gray-900">{analytics.totalAppointments}</h3>
            </div>
          </div>
          <div className="bg-card p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <ChartBarIcon className="h-10 w-10 text-accent" />
            <div>
              <p className="text-gray-600">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Pending Doctor Verification */}
      <div className="bg-card p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldExclamationIcon className="h-7 w-7 mr-2 text-yellow-600" /> Doctors Awaiting Verification
        </h2>
        {pendingDoctors.length === 0 ? (
          <Message type="info">No doctors currently awaiting verification.</Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {pendingDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doctor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.doctorProfile?.specialization || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doctor.doctorProfile?.medicalLicense ? (
                        <a href={doctor.doctorProfile.medicalLicense} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View License</a>
                      ) : 'Not Provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleVerifyDoctor(doctor._id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Verify
                      </button>
                      {/* Add a reject button if needed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Management (simplified) */}
      <div className="bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <UserGroupIcon className="h-7 w-7 mr-2 text-primary" /> User Management
        </h2>
        <Message type="info">
          This section would list all users and provide options to block/unblock accounts.
          (Implementation omitted for brevity, but you can use `getAllUsers` API).
        </Message>
        {/* Example: A button to fetch all users */}
        <button className="btn-primary mt-4" onClick={() => alert('Fetching all users... (API call: /admin/users)')}>
          View All Users
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
