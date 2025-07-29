import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import { ClipboardDocumentListIcon, UserCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

function DoctorPrescriptionsPage() {
  const { userInfo } = useSelector((state) => state.auth);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userInfo && userInfo.role === 'doctor') {
      const fetchPrescriptions = async () => {
        try {
          setLoading(true);
          // Assuming an API endpoint for doctors to get their own prescriptions
          const { data } = await axios.get('/doctors/prescriptions'); // You'll need to implement this backend endpoint
          setPrescriptions(data);
          setLoading(false);
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setLoading(false);
        }
      };
      fetchPrescriptions();
    }
  }, [userInfo]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;
  if (!userInfo || userInfo.role !== 'doctor') return <Message type="error">Access Denied</Message>;

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
        <ClipboardDocumentListIcon className="h-9 w-9 mr-3 text-primary" /> Your Prescriptions
      </h1>

      <div className="bg-card p-6 rounded-xl shadow-lg">
        {prescriptions.length === 0 ? (
          <Message type="info">You have not issued any prescriptions yet.</Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Issued
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {prescriptions.map((pres) => (
                  <tr key={pres._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pres.patient.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {pres.diagnosis.substring(0, 50)}{pres.diagnosis.length > 50 ? '...' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(pres.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/prescriptions/${pres._id}`}
                        className="text-primary hover:text-indigo-700"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorPrescriptionsPage;