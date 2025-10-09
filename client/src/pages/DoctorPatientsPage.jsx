import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function DoctorPatientsPage() {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get('/doctors/patients');
                setPatients(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch patients.');
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <Message variant="danger">{error}</Message>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 flex items-center">
                <UserGroupIcon className="h-10 w-10 mr-3 text-primary"/> My Patients
            </h1>
            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border rounded-lg"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-3.5 left-3"/>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="space-y-4">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                            <Link 
                                key={patient._id} 
                                to={`/doctor/patients/${patient._id}`} 
                                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <p className="font-bold text-lg text-primary">{patient.name}</p>
                                <p className="text-sm text-gray-600">{patient.email}</p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500">No patients found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DoctorPatientsPage;