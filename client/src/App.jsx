import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DoctorSearchPage from './pages/DoctorSearchPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import VideoCallPage from './pages/VideoCallPage';
import PrescriptionPage from './pages/PrescriptionPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreatePrescriptionPage from './pages/CreatePrescriptionPage';
import DoctorPrescriptionsPage from './pages/DoctorPrescriptionsPage';
import Footer from './components/Footer';
import AIChatPage from './pages/AIChatPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/doctors" element={<DoctorSearchPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
            <Route path="/ai-chat" element={<AIChatPage />} />
             {/* Private Routes for Patients */}
            <Route element={<PrivateRoute allowedRoles={['patient']} />} >
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/book-appointment/:doctorId" element={<AppointmentBookingPage />} />
              <Route path="/video-call/:appointmentId" element={<VideoCallPage />} />
              <Route path="/prescriptions/:prescriptionId" element={<PrescriptionPage />} />
              <Route path="/patient/profile" element={<ProfilePage />} />
            </Route>

            {/* Private Routes for Doctors */}
            <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/profile" element={<ProfilePage />} />
              <Route path="/doctor/video-call/:appointmentId" element={<VideoCallPage />} />
              <Route path="/doctor/create-prescription/:appointmentId" element={<CreatePrescriptionPage />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptionsPage />} />
            </Route>

            {/* Private Routes for Admin */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Fallback route for 404 */}
            <Route path="*" element={<h1 className="text-center text-2xl font-bold">404 - Page Not Found</h1>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;