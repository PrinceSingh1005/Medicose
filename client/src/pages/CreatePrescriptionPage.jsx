import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { ClipboardDocumentListIcon, PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

function CreatePrescriptionPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [eSignature, setESignature] = useState(userInfo?.name || ''); // Pre-fill with doctor's name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [apptLoading, setApptLoading] = useState(true);
  const [apptError, setApptError] = useState(null);

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'doctor') {
      navigate('/login'); // Redirect if not authorized
      return;
    }

    const fetchApptDetails = async () => {
      try {
        setApptLoading(true);
        const { data } = await axios.get('/appointments/doctor');
        const appt = data.find(a => a._id === appointmentId);

        if (!appt) {
          setApptError('Appointment not found or you do not have access.');
          return;
        }
        if (appt.status !== 'completed') {
          setApptError('Prescriptions can only be created for completed appointments.');
          return;
        }
        setAppointmentDetails(appt);
      } catch (err) {
        setApptError(err.response?.data?.message || err.message);
      } finally {
        setApptLoading(false);
      }
    };
    fetchApptDetails();
  }, [appointmentId, userInfo, navigate]);


  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const addMedicineField = () => {
    setMedicines([...medicines, { name: '', dosage: '', instructions: '' }]);
  };

  const removeMedicineField = (index) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const prescriptionData = {
        medicines,
        diagnosis,
        notes,
        eSignature,
      };

      await axios.post(`/appointments/${appointmentId}/prescription`, prescriptionData, config);
      setSuccess('Prescription created successfully!');
      setTimeout(() => navigate('/doctor/dashboard'), 2000); // Redirect after success
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (apptLoading) return <LoadingSpinner />;
  if (apptError) return <Message type="error">{apptError}</Message>;
  if (!appointmentDetails) return <Message type="info">Cannot load appointment details.</Message>;

  return (
    <div className="py-8">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
          <ClipboardDocumentListIcon className="h-8 w-8 mr-3 text-primary" /> Create Prescription
        </h1>
        <p className="text-center text-gray-600 mb-6">
          For Appointment with <span className="font-semibold">{appointmentDetails.patient.name}</span> on{' '}
          {new Date(appointmentDetails.appointmentDate).toLocaleDateString()} at {appointmentDetails.appointmentTime}
        </p>

        {error && <Message type="error">{error}</Message>}
        {success && <Message type="success">{success}</Message>}
        {loading && <LoadingSpinner />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="input-field min-h-[100px]"
              required
            ></textarea>
          </div>

          <div className="border border-border p-4 rounded-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Medicines</h2>
            {medicines.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 border border-gray-200 rounded-md relative">
                <div className="md:col-span-1">
                  <label htmlFor={`medicine-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Medicine Name
                  </label>
                  <input
                    id={`medicine-name-${index}`}
                    type="text"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor={`medicine-dosage-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    id={`medicine-dosage-${index}`}
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor={`medicine-instructions-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions (Optional)
                  </label>
                  <input
                    id={`medicine-instructions-${index}`}
                    type="text"
                    value={med.instructions}
                    onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    className="input-field"
                  />
                </div>
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicineField(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    title="Remove Medicine"
                  >
                    <MinusCircleIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMedicineField}
              className="btn-primary bg-green-600 hover:bg-green-700 flex items-center mt-4"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Medicine
            </button>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field min-h-[80px]"
            ></textarea>
          </div>

          <div>
            <label htmlFor="eSignature" className="block text-sm font-medium text-gray-700 mb-1">
              E-Signature (Your Name)
            </label>
            <input
              id="eSignature"
              type="text"
              value={eSignature}
              onChange={(e) => setESignature(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Create Prescription'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePrescriptionPage;