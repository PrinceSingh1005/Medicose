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
    <div className="py-12 bg-gray-50 min-h-screen">
  <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-10">
    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center space-x-2">
      {/* <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600" /> */}
      <span>Digital Prescription</span>
    </h1>

    {/* Patient & Doctor Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-200 pb-6">
      <div className="space-y-2">
        <p className="text-gray-700 font-medium">
          <span className="font-semibold text-gray-900">Patient:</span> {prescription.patient.name}
        </p>
        <p className="text-gray-700 font-medium">
          <span className="font-semibold text-gray-900">Doctor:</span> {prescription.doctor.name}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-gray-700 font-medium">
          <span className="font-semibold text-gray-900">Prescription Date:</span> {new Date(prescription.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-700 font-medium">
          <span className="font-semibold text-gray-900">Appointment:</span> {new Date(prescription.appointment.appointmentDate).toLocaleDateString()} at {prescription.appointment.appointmentTime}
        </p>
      </div>
    </div>

    {/* Diagnosis */}
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-3 border-b pb-2 border-gray-200">Diagnosis</h2>
      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        {prescription.diagnosis}
      </p>
    </div>

    {/* Medicines */}
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2 border-gray-200">Medicines</h2>
      {prescription.medicines && prescription.medicines.length > 0 ? (
        <ul className="space-y-4">
          {prescription.medicines.map((med, index) => (
            <li key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-indigo-600 font-semibold text-lg">{med.name}</p>
              <p className="text-gray-700 mt-1">Dosage: {med.dosage}</p>
              {med.instructions && <p className="text-gray-500 text-sm mt-1">Instructions: {med.instructions}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <Message type="info">No medicines prescribed.</Message>
      )}
    </div>

    {/* Doctor Notes */}
    {prescription.notes && (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3 border-b pb-2 border-gray-200">Doctor's Notes</h2>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
          {prescription.notes}
        </p>
      </div>
    )}

    {/* Doctor E-Signature */}
    <div className="mb-8 text-right">
      <p className="font-semibold text-gray-800">Doctor's E-Signature:</p>
      <p className="text-gray-500 italic">{prescription.eSignature || 'Not Available'}</p>
    </div>

    {/* Print / Download */}
    <div className="text-center">
      <button
        onClick={() => window.print()}
        className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-colors duration-200"
      >
        Download / Print Prescription
      </button>
    </div>
  </div>
</div>

  );
}

export default PrescriptionPage;