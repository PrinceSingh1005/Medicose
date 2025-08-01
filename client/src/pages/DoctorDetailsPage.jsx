// In frontend/src/pages/DoctorDetailsPage.jsx

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// Correct the import path to match your project structure
import { fetchDoctorDetails, clearSelectedDoctor } from '../features/doctor/doctorSlice'; 
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { FaStethoscope, FaGraduationCap, FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';

function DoctorDetailsPage() {
    const { id: doctorId } = useParams();
    const dispatch = useDispatch();

    const { selectedDoctor: doctor, loading, error } = useSelector((state) => state.doctors);

    useEffect(() => {
        if (doctorId) {
            dispatch(fetchDoctorDetails(doctorId));
        }
        return () => {
            dispatch(clearSelectedDoctor());
        };
        // ------------------------------------
    }, [dispatch, doctorId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <Message variant="danger">{error}</Message>;
    }

    if (!doctor) {
        return <div className="text-center p-8"><Message>No doctor found.</Message></div>;
    }

    // Safely join the qualifications array into a string
    const qualificationsText = Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : 'N/A';

    return (
        <div className="container mx-auto p-6 bg-gray-50">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                {/* Header Section */}
                <div className="p-8 bg-primary text-white flex flex-col md:flex-row items-center">
                    <img
                        src={doctor.imageUrl || `https://ui-avatars.com/api/?name=${doctor.user?.name}&background=FFFFFF&color=4F46E5&size=128`}
                        alt={doctor.user?.name}
                        className="w-32 h-32 rounded-full border-4 border-white object-cover mb-4 md:mb-0 md:mr-8"
                    />
                    <div>
                        <h1 className="text-4xl font-bold">{doctor.user?.name || 'Dr. Anonymous'}</h1>
                        <p className="text-lg">{doctor.user?.email || 'No email provided'}</p>
                        <div className="flex items-center mt-2 text-yellow-300">
                           <FaStar className="mr-1" />
                           <span className="text-xl font-bold text-white">{doctor.averageRating?.toFixed(1) || 'N/A'}</span>
                           <span className="ml-2 text-white">({doctor.numReviews || 0} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2">
                             <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Professional Details</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-start"><FaStethoscope className="text-primary mt-1 mr-3" size={20} /><span><strong>Specialization:</strong><br/>{doctor.specialization || 'N/A'}</span></div>
                                <div className="flex items-start"><FaGraduationCap className="text-primary mt-1 mr-3" size={20} /><span><strong>Qualifications:</strong><br/>{qualificationsText}</span></div>
                                <div className="flex items-start"><FaBriefcase className="text-primary mt-1 mr-3" size={20} /><span><strong>Experience:</strong><br/>{doctor.experience || 0} years</span></div>
                                <div className="flex items-start"><FaMoneyBillWave className="text-primary mt-1 mr-3" size={20} /><span><strong>Fee:</strong><br/>${doctor.fees || 0}</span></div>
                             </div>
                             
                             <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Contact & Location</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start"><FaMapMarkerAlt className="text-primary mt-1 mr-3" size={20} /><span><strong>Address:</strong><br/>{`${doctor.address || ''}, ${doctor.city || ''}, ${doctor.state || ''}, ${doctor.country || ''}`}</span></div>
                                <div className="flex items-start"><FaPhone className="text-primary mt-1 mr-3" size={20} /><span><strong>Phone:</strong><br/>{doctor.phone || 'N/A'}</span></div>
                             </div>
                        </div>

                        {/* Right Column: Bio & Booking */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">About Me</h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                {doctor.bio || 'No biography available.'}
                            </p>
                            <Link
                                to={`/book-appointment/${doctor._id}`}
                                className="w-full text-center block btn-primary text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
                            >
                                Book Appointment
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DoctorDetailsPage;