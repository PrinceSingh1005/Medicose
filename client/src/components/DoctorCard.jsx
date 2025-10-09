import React from 'react'
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => (
  <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-4">
      <img
        src={doctor.profilePhoto || `https://ui-avatars.com/api/?name=${doctor.user?.name}&background=4F46E5&color=fff`}
        alt={doctor.user?.name}
        className="w-16 h-16 rounded-full mr-4 object-cover"
      />
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{doctor.user?.name || 'Dr. Anonymous'}</h2>
        <p className="text-md text-primary font-semibold">{doctor.specialization}</p>
      </div>
    </div>
    <div className="mb-4">
      <p className="text-gray-600">
        <strong>Experience:</strong> {doctor.experience} years
      </p>
      <p className="text-gray-600">
        <strong>Fees:</strong> ${doctor.fees}
      </p>
      <p className="text-gray-600">
        <strong>Location:</strong> {doctor.address || 'Not specified'}
      </p>
      <div className="flex items-center text-gray-600">
        <strong>Rating: </strong>
        <FaStar className="mx-1 text-yellow-300" />
        <span className="font-bold">
          {doctor.averageRating?.toFixed(1) || 'N/A'}
        </span>
        <span className="ml-2">
          ({doctor.numReviews || 0} reviews)
        </span>
      </div>
    </div>
    <Link
      to={`/doctors/${doctor._id}`}
      className="w-full text-center inline-block bg-primary font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
    >
      View Profile & Book
    </Link>
  </div>
);

export default DoctorCard