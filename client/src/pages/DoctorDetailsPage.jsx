import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorDetails} from '../features/doctor/doctorSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { FaStethoscope, FaGraduationCap, FaBriefcase, FaMoneyBillWave, FaMapMarkerAlt, FaPhone, FaStar } from 'react-icons/fa';

function DoctorDetailsPage() {
    const { id: doctorId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedDoctor: doctor, status, error } = useSelector((state) => state.doctors);
    const { userInfo } = useSelector((state) => state.auth);

    console.log('Selected doctor from Redux store:', doctor);

    useEffect(() => {
        if (!doctorId) {
            navigate('/doctors');
            return;
        }

        dispatch(fetchDoctorDetails(doctorId));

        // return () => {
        //     dispatch(clearSelectedDoctor());
        // };
    }, [dispatch, doctorId, navigate]);

    // Loading and error states
    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
                <p className="ml-4">Loading doctor details...</p>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="text-center p-8">
                <Message variant="danger">
                    Error loading doctor: {error}
                    <button 
                        onClick={() => dispatch(fetchDoctorDetails(doctorId))}
                        className="mt-4 btn-primary"
                    >
                        Retry
                    </button>
                </Message>
            </div>
        );
    }

    if (status !== 'succeeded' && !doctor) {
        return (
            <div className="text-center p-8">
                <Message variant="warning">Doctor not found</Message>
                <Link to="/doctors" className="mt-4 btn-primary">
                    Browse Doctors
                </Link>
            </div>
        );
    }

    // Helper functions
    const getQualificationsText = () => {
        if (!doctor?.qualifications) return 'N/A';
        return Array.isArray(doctor?.qualifications) 
            ? doctor?.qualifications.join(', ')
            : doctor?.qualifications;
    };

    const getAddressText = () => {
        const parts = [
            doctor?.address,
            doctor?.city,
            doctor?.state,
            doctor?.country
        ].filter(Boolean);
        return parts.length ? parts.join(', ') : 'Address not specified';
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                {/* Header Section */}
                <div className="p-8 bg-primary text-white flex flex-col md:flex-row items-center">
                    <img
                        src={doctor.imageUrl || `https://ui-avatars.com/api/?name=${doctor.user?.name || 'Doctor'}&background=FFFFFF&color=4F46E5&size=128`}
                        alt={doctor.user?.name || 'Doctor'}
                        className="w-32 h-32 rounded-full border-4 border-white object-cover mb-4 md:mb-0 md:mr-8"
                    />
                    <div>
                        <h1 className="text-4xl font-bold">{doctor.user?.name || 'Dr. Anonymous'}</h1>
                        <p className="text-lg">{doctor.user?.email || 'No email provided'}</p>
                        <div className="flex items-center mt-2 text-yellow-300">
                            <FaStar className="mr-1" />
                            <span className="text-xl font-bold text-white">
                                {doctor.averageRating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="ml-2 text-white">
                                ({doctor.numReviews || 0} reviews)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                                Professional Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-start">
                                    <FaStethoscope className="text-primary mt-1 mr-3" size={20} />
                                    <span>
                                        <strong>Specialization:</strong><br/>
                                        {doctor.specialization || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <FaGraduationCap className="text-primary mt-1 mr-3" size={20} />
                                    <span>
                                        <strong>Qualifications:</strong><br/>
                                        {getQualificationsText()}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <FaBriefcase className="text-primary mt-1 mr-3" size={20} />
                                    <span>
                                        <strong>Experience:</strong><br/>
                                        {doctor.experience || 0} years
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <FaMoneyBillWave className="text-primary mt-1 mr-3" size={20} />
                                    <span>
                                        <strong>Fee:</strong><br/>
                                        ${doctor.fees || 0}
                                    </span>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                                Contact & Location
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="text-primary mt-1 mr-3" size={20} />
                                    <span>
                                        <strong>Address:</strong><br/>
                                        {getAddressText()}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <FaPhone className="text-primary mt-1 mr-3" size={20} />
                                    <span>
                                        <strong>Phone:</strong><br/>
                                        {doctor.phone || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bio & Booking */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                                About Me
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                {doctor.bio || 'No biography available.'}
                            </p>
                            <Link
                                to={`/book-appointment/${doctor._id}`}
                                state={{ doctorData: doctor }}  // Pass doctor data via route state
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