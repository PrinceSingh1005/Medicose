// In frontend/src/pages/DoctorSearchPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios'; // Your configured axios instance
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import DoctorCard from '../components/DoctorCard';

function DoctorSearchPage() {
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all doctors on initial component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/doctors');
        setAllDoctors(data);
        setFilteredDoctors(data); // Initially, all doctors are shown
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors whenever the search term changes
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = allDoctors.filter((doctor) => {
            const nameMatch = doctor.name ? doctor.name.toLowerCase().includes(lowercasedTerm) : false;
            const specMatch = doctor.specialization ? doctor.specialization.toLowerCase().includes(lowercasedTerm) : false;
            return nameMatch || specMatch;
        });
    setFilteredDoctors(results);
  }, [searchTerm, allDoctors]);

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Find Your Doctor</h1>
        <p className="text-lg text-gray-600 mb-6">
          Search for a doctor by name or specialization.
        </p>
        <input
          type="text"
          placeholder="e.g., 'Dr. Smith' or 'Cardiology'"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))
          ) : (
            <div className="col-span-full text-center">
              <Message>No doctors found matching your criteria.</Message>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorSearchPage;