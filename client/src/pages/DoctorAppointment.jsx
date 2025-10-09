// frontend/src/pages/DoctorAppointment.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import Message from "../components/Message";
import {
  CheckCircleIcon,
  XCircleIcon,
  VideoCameraIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

function DoctorAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/appointments/doctor");
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await axios.put(`/appointments/${appointmentId}/status`, { status });
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Appointments</h1>
      {appointments.length === 0 ? (
        <Message type="info">No appointments found.</Message>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {appointments.map((appt) => (
                <tr key={appt._id}>
                  <td className="px-6 py-4 text-sm font-medium">
                    {appt.patient?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(appt.appointmentDate).toLocaleDateString()} at{" "}
                    {appt.appointmentTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {appt.consultationType}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        appt.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : appt.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appt.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex space-x-2">
                      {appt.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(appt._id, "confirmed")
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Confirm"
                          >
                            <CheckCircleIcon className="h-6 w-6" />
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(appt._id, "rejected")
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircleIcon className="h-6 w-6" />
                          </button>
                        </>
                      )}
                      {appt.status === "confirmed" &&
                        appt.consultationType === "video" && (
                          <Link
                            to={`/doctor/video-call/${appt._id}`}
                            className="text-primary hover:text-indigo-700"
                            title="Join Video"
                          >
                            <VideoCameraIcon className="h-6 w-6" />
                          </Link>
                        )}
                      {appt.status === "confirmed" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(appt._id, "completed")
                          }
                          className="text-blue-600 hover:text-blue-900"
                          title="Mark Completed"
                        >
                          <ClipboardDocumentIcon className="h-6 w-6" />
                        </button>
                      )}
                      {appt.status === "completed" && (
                        <Link
                          to={`/doctor/create-prescription/${appt._id}`}
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
  );
}

export default DoctorAppointment;
