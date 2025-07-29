import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorDetails, clearSelectedDoctor } from '../features/doctor/doctorSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import {
  StarIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

function DoctorDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedDoctor, loading, error } = useSelector((state) => state.doctors);

  useEffect(() => {
    dispatch(fetchDoctorDetails(id));
    return () => {
      dispatch(clearSelectedDoctor()); // Clear doctor details when unmounting
    };
  }, [dispatch, id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Message type="error">{error}</Message>;
  if (!selectedDoctor) return <Message type="info">Doctor not found.</Message>;

  const doctor = selectedDoctor;
  const profile = doctor.doctorProfile;

  // Function to format availability
  const formatAvailability = (availability) => {
    if (!availability || Object.keys(availability).length === 0) {
      return <p className="text-gray-500">Availability not specified.</p>;
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {Object.entries(availability).map(([day, times]) => (
          <li key={day}>
            <span className="font-semibold">{day}:</span> {times.join(' - ')}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="py-8">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          {/* Doctor Image */}
          <img
            src={`https://placehold.co/150x150/4F46E5/ffffff?text=Dr`} // Placeholder image
            alt={`Dr. ${doctor.name}`}
            className="w-36 h-36 rounded-full object-cover border-4 border-primary mb-6 md:mb-0"
          />

          {/* Doctor Info */}
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dr. {doctor.name}</h1>
            <p className="text-primary text-xl font-semibold mb-3">{profile.specialization}</p>

            <div className="flex items-center justify-center md:justify-start text-gray-700 mb-3">
              <StarIcon className="h-5 w-5 text-accent mr-1" />
              <span className="font-medium">{profile.averageRating?.toFixed(1) || 'N/A'}</span>
              <span className="ml-1 text-sm">({profile.numReviews || 0} reviews)</span>
            </div>

            <p className="text-gray-600 mb-2 flex items-center justify-center md:justify-start">
              <AcademicCapIcon className="h-5 w-5 mr-2" /> {profile.experience} Years of Experience
            </p>
            <p className="text-gray-600 mb-2 flex items-center justify-center md:justify-start">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" /> Consultation Fees: ${profile.fees}
            </p>
            <p className="text-gray-600 mb-4 flex items-center justify-center md:justify-start">
              <MapPinIcon className="h-5 w-5 mr-2" /> {profile.address}, {profile.city}, {profile.state}, {profile.country}
            </p>
            <p className="text-gray-600 mb-4 flex items-center justify-center md:justify-start">
              <PhoneIcon className="h-5 w-5 mr-2" /> {profile.phone}
            </p>

            <p className="text-gray-700 mt-4 text-lg leading-relaxed">{profile.bio || 'No biography provided.'}</p>

            <div className="mt-6 flex justify-center md:justify-start">
              <Link to={`/book-appointment/${doctor._id}`} className="btn-primary px-6 py-3 text-lg">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <AcademicCapIcon className="h-7 w-7 mr-2 text-primary" /> Qualifications
          </h2>
          {profile.qualifications && profile.qualifications.length > 0 ? (
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {profile.qualifications.map((qual, index) => (
                <li key={index}>{qual}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No qualifications listed.</p>
          )}
        </div>

        {/* Availability */}
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="h-7 w-7 mr-2 text-primary" /> Availability
          </h2>
          {formatAvailability(profile.availability)}
        </div>

        {/* Reviews (Placeholder) */}
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <ClipboardDocumentListIcon className="h-7 w-7 mr-2 text-primary" /> Patient Reviews
          </h2>
          <Message type="info">
            Reviews will be displayed here. (Feature to be implemented on frontend)
          </Message>
          {/* You would fetch and display actual reviews here */}
        </div>
      </div>
    </div>
  );
}

export default DoctorDetailsPage;
