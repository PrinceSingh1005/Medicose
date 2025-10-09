// frontend/src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "../api/axios";

import {
  DollarSign,
  Users,
  Calendar,
  FileText,
  Clock,
  UserCheck,
  Activity,
} from "lucide-react";

import StatCard from "../components/doctor/StatCard";
import PatientCard from "../components/doctor/PatientCard";
import AppointmentCard from "../components/doctor/AppointmentCard";
import Header from "../components/doctor/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import Message from "../components/Message";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

const DoctorDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await axios.put(`/appointments/${appointmentId}/status`, { status });
      // refresh data
      const apptsRes = await axios.get('/appointments/doctor');
      setAppointments(apptsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, apptsRes, presRes, patientsRes] = await Promise.all([
          axios.get("/doctors/stats"),
          axios.get("/appointments/doctor"),
          axios.get("/doctors/prescriptions"),
          axios.get("/doctors/patients"),
        ]);

        setStats([
          {
            title: "Total Earnings",
            value: `$${statsRes.data?.yearlyEarnings || 0}`, 
            change: "+12.5% from last month",
            changeType: "positive",
            icon: DollarSign,
            gradient: "primary",
          },
          {
            title: "Total Patients",
            value: String(patientsRes.data?.length || 0), 
            change: "+8.2% from last month",
            changeType: "positive",
            icon: Users,
            gradient: "success",
          },
          {
            title: "Appointments This Week",
            value: String(apptsRes.data?.length || 0), 
            change: "Ongoing",
            changeType: "neutral",
            icon: Calendar,
            gradient: "warning",
          },
          {
            title: "Prescriptions",
            value: String(presRes.data?.length || 0),
            change: "+ Recent Issued",
            changeType: "positive",
            icon: FileText,
            gradient: "primary",
          },
        ]);

        setPatients(patientsRes.data);
        setAppointments(apptsRes.data);
        setPrescriptions(presRes.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) fetchDashboardData();
  }, [userInfo]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      <Header userInfo={userInfo} appointments={appointments} handleUpdateStatus={handleUpdateStatus} />
      <div className="flex">
        <Sidebar />
        <main className="lg:ml-64 pt-20 px-8">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Welcome */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-800">
                Good morning, {userInfo?.name || "Doctor"}!
              </h1>
              <p className="text-gray-500">
                Here’s what’s happening with your practice today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats &&
                stats.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Patients */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Recent Patients
                  </h2>
                  <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-primary hover:text-white transition">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {patients.length > 0 ? (
                    patients.slice(0, 4).map((patient, index) => (
                      <PatientCard
                        key={index}
                        name={patient.name}
                        age={patient.age}
                        email={patient.email}
                        lastVisit={patient.lastVisit || "N/A"}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500">No patients found.</p>
                  )}
                </div>
              </div>

              {/* Appointments */}
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Upcoming Appointments
                  </h2>
                  <Link to="/doctor/appointments" className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-primary hover:text-white transition">
                    View All Appointments
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointments.length > 0 ? (
                    appointments.slice(0, 4).map((appt, index) => (
                      <AppointmentCard
                        key={index}
                        appt={appt}
                        handleUpdateStatus={handleUpdateStatus}
                      />
                    ))
                  ) : (
                    <p className="text-gray-500">No upcoming appointments.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Prescriptions
                </h2>
                <Link to="/doctor/prescriptions" className="px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-primary hover:text-white transition">
                  View
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Patient
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Medication
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Issued Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prescriptions.length > 0 ? (
                      prescriptions.slice(0, 5).map((pres, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm font-medium text-gray-800">
                            {pres.patient?.name}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {pres.medication || "N/A"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {new Date(pres.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pres.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                                }`}
                            >
                              {pres.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Link to="/doctor/prescriptions" className="px-3 py-1 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-primary hover:text-white transition">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-4 px-4 text-center text-gray-500"
                        >
                          No prescriptions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
