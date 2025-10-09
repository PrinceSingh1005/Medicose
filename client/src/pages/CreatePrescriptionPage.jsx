import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { ClipboardDocumentListIcon, PlusCircleIcon, MinusCircleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

function CreatePrescriptionPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [diagnosis, setDiagnosis] = useState('');
  const [rawPrescription, setRawPrescription] = useState(''); // New state for raw prescription text
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [eSignature, setESignature] = useState(userInfo?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [apptLoading, setApptLoading] = useState(true);
  const [apptError, setApptError] = useState(null);

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'doctor') {
      navigate('/login');
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


  const convertToProfessionalPrescription = async () => {
    if (!rawPrescription.trim()) {
      setError('Please write a raw prescription to convert.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const prompt = `
            Convert the doctor's raw prescription text into a structured JSON. 
            Rules:
            - Respond ONLY with valid JSON.
            - JSON must contain: 
              { "diagnosis": string, "medicines": [ { "name": string, "dosage": string, "instructions": string } ], "notes": string }
            - If dosage or instructions missing, auto-fill safe defaults (e.g., Paracetamol = 500mg, 1 tablet twice daily after meals).
            - Handle Hinglish, shorthand, incomplete sentences.

            Example input: 3 din se fever, cough. Paracetamol di hai. 2 din baad follow-up.
            Example output:
            {
              "diagnosis": "Fever and cough for 3 days",
              "medicines": [
                { "name": "Paracetamol", "dosage": "500mg", "instructions": "1 tablet twice daily after meals" }
              ],
              "notes": "Follow-up after 2 days"
            }

            Raw Prescription:
            """${rawPrescription}"""
            `;

      const { data } = await axios.post('/ai/chat', { prompt });

      let parsedData;
      try {
        // Gemini sometimes wraps the JSON in ```json ... ``` fences
        let raw = data.response || data.text || data;

        // Remove markdown code fences if present
        raw = raw.replace(/```json|```/g, '').trim();

        parsedData = JSON.parse(raw);
      } catch (err) {
        console.error("AI Response (unparsed):", data);
        throw new Error("Could not parse prescription JSON.");
      }


      setDiagnosis(parsedData.diagnosis || '');
      setMedicines(parsedData.medicines?.length ? parsedData.medicines : [{ name: '', dosage: '', instructions: '' }]);
      setNotes(parsedData.notes || '');

      setSuccess('Prescription converted successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to convert prescription. Please try again.');
    } finally {
      setLoading(false);
    }
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
      setTimeout(() => navigate('/doctor/dashboard'), 2000);
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
  <div className="py-10 px-4 bg-gray-50 min-h-screen">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
        <ClipboardDocumentListIcon className="h-8 w-8 mr-3 text-blue-600" /> 
        Create Prescription
      </h1>

      <p className="text-center text-gray-500 mb-8">
        For Appointment with <span className="font-semibold text-gray-700">{appointmentDetails.patient.name}</span> on{' '}
        <span className="font-medium">{new Date(appointmentDetails.appointmentDate).toLocaleDateString()}</span> at{' '}
        <span className="font-medium">{appointmentDetails.appointmentTime}</span>
      </p>

      {error && <Message type="error">{error}</Message>}
      {success && <Message type="success">{success}</Message>}
      {loading && <LoadingSpinner />}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Raw Prescription */}
        <div>
          <label htmlFor="rawPrescription" className="block text-sm font-semibold text-gray-700 mb-2">
            Raw Prescription Draft (Optional) 📝
          </label>
          <textarea
            id="rawPrescription"
            value={rawPrescription}
            onChange={(e) => setRawPrescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="e.g., 'Patient has flu. Prescribe Paracetamol 500mg...' "
            rows="4"
          ></textarea>
          <button
            type="button"
            onClick={convertToProfessionalPrescription}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
            disabled={loading}
          >
            <RocketLaunchIcon className="h-5 w-5" /> Convert to Professional Prescription
          </button>
        </div>

        {/* Professional Prescription */}
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            Professional Prescription Details
          </h2>

          {/* Diagnosis */}
          <div className="mb-6">
            <label htmlFor="diagnosis" className="block text-sm font-semibold text-gray-700 mb-2">
              Diagnosis
            </label>
            <textarea
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              rows="3"
              required
            ></textarea>
          </div>

          {/* Medicines */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Medicines</h3>
            {medicines.map((med, index) => (
              <div 
                key={index} 
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-white relative shadow-sm"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Instructions</label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicineField(index)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  >
                    <MinusCircleIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMedicineField}
              className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Medicine
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows="2"
          ></textarea>
        </div>

        {/* Signature */}
        <div>
          <label htmlFor="eSignature" className="block text-sm font-semibold text-gray-700 mb-2">
            E-Signature (Your Name)
          </label>
          <input
            id="eSignature"
            type="text"
            value={eSignature}
            onChange={(e) => setESignature(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 text-lg font-semibold bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
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