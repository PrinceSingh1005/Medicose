// In frontend/src/pages/PatientDetailsForDoctorPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { UserCircleIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

function PatientDetailsForDoctorPage() {
    const { patientId } = useParams();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/doctors/patients/${patientId}`);
                setHistory(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch patient history.');
            } finally {
                setLoading(false);
            }
        };
        if (patientId) {
            fetchHistory();
        }
    }, [patientId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <Message variant="danger">{error}</Message>;
    if (!history) return <Message>No history found for this patient.</Message>;

    const { patient, appointments, prescriptions } = history;

    return (
        <div className="container mx-auto p-6">
            {/* Patient Header */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex items-center">
                <UserCircleIcon className="h-16 w-16 text-gray-400 mr-4"/>
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{patient.name}</h1>
                    <p className="text-lg text-gray-600">{patient.email}</p>
                    <p className="text-sm text-gray-500">Member since: {new Date(patient.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* History Sections */}
            <div className="space-y-8">
                {/* Appointments History */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <CalendarIcon className="h-7 w-7 mr-2 text-primary"/> Appointment History
                    </h2>
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
                        {appointments.length > 0 ? appointments.map(appt => (
                            <div key={appt._id} className="p-3 border-b">
                                <p><strong>Date:</strong> {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.appointmentTime}</p>
                                <p><strong>Type:</strong> {appt.consultationType}</p>
                                <p><strong>Status:</strong> <span className="font-semibold">{appt.status}</span></p>
                            </div>
                        )) : <p>No appointment history found.</p>}
                    </div>
                </div>

                {/* Prescriptions History */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <DocumentTextIcon className="h-7 w-7 mr-2 text-primary"/> Prescription History
                    </h2>
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
                        {prescriptions.length > 0 ? prescriptions.map(pres => (
                            <div key={pres._id} className="p-3 border-b">
                                <p><strong>Date:</strong> {new Date(pres.createdAt).toLocaleDateString()}</p>
                                <p><strong>Diagnosis:</strong> {pres.diagnosis}</p>
                                <p className="text-sm text-gray-600">Medicines: {pres.medicines.map(m => m.name).join(', ')}</p>
                            </div>
                        )) : <p>No prescription history found.</p>}
                    </div>
                </div>

                {/* You can add a similar section for Reports here */}
            </div>
        </div>
    );
}

export default PatientDetailsForDoctorPage;