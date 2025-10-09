// frontend/src/pages/DoctorPrescriptionsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Message from "../components/Message";

function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/doctors/prescriptions");
      setPrescriptions(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Prescriptions</h1>
      {prescriptions.length === 0 ? (
        <Message type="info">No prescriptions found.</Message>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((pres) => (
            <div
              key={pres._id}
              className="p-4 border rounded-lg shadow-sm hover:bg-gray-50"
            >
              <p className="font-semibold">
                Patient: {pres.patient ? pres.patient.name : "Unknown"}
              </p>
              <p className="text-sm text-gray-600">
                Issued on: {new Date(pres.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Diagnosis: {pres.diagnosis}
              </p>
              <p className="text-sm text-gray-500">
                Medicines: {pres.medicines?.join(", ") || "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                Notes: {pres.notes || "None"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorPrescriptionsPage;
