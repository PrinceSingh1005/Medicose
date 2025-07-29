import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
// import { ClipboardDocumentListIcon, UserCircleIcon, CalendarDaysIcon, StethoscopeIcon } from '@heroicons/react/24/solid';

function PrescriptionPage() {
  const { prescriptionId } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setLoading(true);
        // Assuming /api/patients/prescriptions/:id endpoint exists or filter from all patient prescriptions
        // For simplicity, we'll fetch all and filter, in a real app, create a specific endpoint.
        const { data: allPrescriptions } = await axios.get('/patients/prescriptions');
        const foundPrescription = allPrescriptions.find(p => p._id === prescriptionId);

        if (foundPrescription) {
          setPrescription(foundPrescription);
        } else {
          setError('Prescription not found or you do not have access.');
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [prescriptionId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;
  if (!prescription) return <Message type="info">Prescription details not available.</Message>;

  return (
    <div className="py-8">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
          {/* <ClipboardDocumentListIcon className="h-8 w-8 mr-3 text-primary" /> Digital Prescription */}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6 border-b pb-4 border-border">
          <div>
            <p className="text-gray-600 flex items-center mb-1">
              {/* <UserCircleIcon className="h-5 w-5 mr-2 text-primary" /> */}
              <span className="font-semibold">Patient:</span> {prescription.patient.name}
            </p>
            <p className="text-gray-600 flex items-center">
              {/* <StethoscopeIcon className="h-5 w-5 mr-2 text-primary" /> */}
              <span className="font-semibold">Doctor:</span> Dr. {prescription.doctor.name}
            </p>
          </div>
          <div>
            <p className="text-gray-600 flex items-center mb-1">
              {/* <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary" /> */}
              <span className="font-semibold">Date:</span> {new Date(prescription.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-600 flex items-center">
              {/* <ClockIcon className="h-5 w-5 mr-2 text-primary" /> */}
              <span className="font-semibold">Appointment Date:</span> {new Date(prescription.appointment.appointmentDate).toLocaleDateString()} at {prescription.appointment.appointmentTime}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Diagnosis:</h2>
          <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border border-border">
            {prescription.diagnosis}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Medicines:</h2>
          {prescription.medicines && prescription.medicines.length > 0 ? (
            <ul className="space-y-3">
              {prescription.medicines.map((med, index) => (
                <li key={index} className="bg-gray-50 p-4 rounded-md border border-border">
                  <p className="font-semibold text-lg text-primary">{med.name}</p>
                  <p className="text-gray-700">Dosage: {med.dosage}</p>
                  {med.instructions && <p className="text-gray-600 text-sm">Instructions: {med.instructions}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <Message type="info">No medicines prescribed.</Message>
          )}
        </div>

        {prescription.notes && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Doctor's Notes:</h2>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-md border border-border">
              {prescription.notes}
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-border text-right">
          <p className="font-semibold text-gray-800">Doctor's E-Signature:</p>
          <p className="text-gray-600 italic">{prescription.eSignature || 'Not Available'}</p>
          {/* In a real app, this would be an image or a more secure representation */}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="btn-primary bg-indigo-500 hover:bg-indigo-600"
          >
            Download / Print Prescription
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrescriptionPage;