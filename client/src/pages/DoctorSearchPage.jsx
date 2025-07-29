import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../features/doctor/doctorSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, StarIcon, AcademicCapIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

function DoctorSearchPage() {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('');

  const dispatch = useDispatch();
  const { doctors, loading, error } = useSelector((state) => state.doctors);

  useEffect(() => {
    // Initial fetch of doctors or based on default filters
    dispatch(fetchDoctors({ specialization, location, minRating, sortBy, search }));
  }, [dispatch, specialization, location, minRating, sortBy, search]); // Re-fetch when filters change

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchDoctors({ specialization, location, minRating, sortBy, search }));
  };

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Find Your Doctor</h1>

      {/* Search and Filter Section */}
      <div className="bg-card p-6 rounded-xl shadow-lg mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                placeholder="e.g., Dr. John Doe"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <select
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="input-field"
            >
              <option value="">All Specializations</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dentist">Dentist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="General Physician">General Physician</option>
              {/* Add more specializations */}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location (City/State/Country)
            </label>
            <div className="relative">
              <input
                id="location"
                type="text"
                placeholder="e.g., New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field pl-10"
              />
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
              Min. Rating
            </label>
            <select
              id="minRating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="input-field"
            >
              <option value="">Any Rating</option>
              <option value="4">4 Stars & Up</option>
              <option value="3">3 Stars & Up</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="">Default</option>
              <option value="feesAsc">Fees: Low to High</option>
              <option value="feesDesc">Fees: High to Low</option>
              <option value="experienceDesc">Experience: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1 flex items-end">
            <button type="submit" className="btn-primary w-full py-2">
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      {/* Doctor List */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Message type="error">{error}</Message>
      ) : doctors.length === 0 ? (
        <Message type="info">No doctors found matching your criteria.</Message>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-card p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
              <img
                src={`https://placehold.co/100x100/4F46E5/ffffff?text=Dr`} // Placeholder image
                alt={doctor.name}
                className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-primary"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. {doctor.name}</h3>
              <p className="text-primary font-medium mb-2">{doctor.doctorProfile?.specialization}</p>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <StarIcon className="h-4 w-4 text-accent mr-1" />
                {doctor.doctorProfile?.averageRating?.toFixed(1) || 'N/A'} ({doctor.doctorProfile?.numReviews || 0} reviews)
              </div>
              <p className="text-gray-600 text-sm mb-1 flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-1" /> {doctor.doctorProfile?.experience} Years Exp.
              </p>
              <p className="text-gray-600 text-sm mb-3 flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" /> Fees: ${doctor.doctorProfile?.fees}
              </p>
              <Link to={`/doctors/${doctor._id}`} className="btn-primary mt-auto">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorSearchPage;
