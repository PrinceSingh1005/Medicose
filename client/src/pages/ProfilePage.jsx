// In frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../api/axios'; // For fetching doctor profile details initially
import { updateProfile } from '../features/auth/authSlice'; // Use the correct thunk from authSlice
import { updateDoctorProfile } from '../features/doctor/doctorSlice'; // The thunk for doctor-specific data
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { FaStar, FaCalendarAlt } from 'react-icons/fa'; // For the rating icon

function ProfilePage() {
    const dispatch = useDispatch();

    const { userInfo } = useSelector((state) => state.auth);
    const { loading: doctorLoading, error: doctorError } = useSelector((state) => state.doctors);
    const { loading: authLoading, error: authError } = useSelector((state) => state.auth);

    const initialAvailability = {
        Monday: '', Tuesday: '', Wednesday: '', Thursday: '',
        Friday: '', Saturday: '', Sunday: '',
    };

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        specialization: '', qualifications: '', experience: '',
        fees: '', address: '', city: '', state: '', country: '',
        phone: '', bio: '', averageRating: 0, numReviews: 0,
        availability: initialAvailability,
    });

    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        setFormData(prev => ({ ...prev, name: userInfo.name, email: userInfo.email }));
        if (userInfo.role === 'doctor') {
            const fetchDoctorProfile = async () => {
                try {
                    const { data } = await axios.get('/doctors/profile/me');
                    if (data) {
                        const availabilityFromServer = data.availability || {};
                        const fullAvailability = { ...initialAvailability };
                        for (const day in availabilityFromServer) {
                            fullAvailability[day] = Array.isArray(availabilityFromServer[day]) ? availabilityFromServer[day].join(', ') : '';
                        }
                        
                        const displayData = { 
                            ...data, 
                            qualifications: data.qualifications?.join(', ') || '',
                            availability: fullAvailability,
                        };
                        setFormData(prev => ({ ...prev, ...displayData }));
                    }
                } catch (e) {
                    setPageError('Could not load your doctor profile.');
                } finally {
                    setPageLoading(false);
                }
            };
            fetchDoctorProfile();
        } else {
            setPageLoading(false);
        }
    }, [userInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvailabilityChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [name]: value,
            }
        }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setSuccessMessage(null);
        setPageError(null);

        if (formData.password && formData.password !== formData.confirmPassword) {
            setPageError('Passwords do not match');
            return;
        }

        try {
            const userUpdateData = { name: formData.name, email: formData.email };
            if (formData.password) userUpdateData.password = formData.password;
            await dispatch(updateProfile(userUpdateData)).unwrap();

            if (userInfo.role === 'doctor') {
                // Format availability back into the Map<String, [String]> structure
                const availabilityForDb = {};
                for (const day in formData.availability) {
                    if (formData.availability[day]) { // Only include days with timings
                        availabilityForDb[day] = formData.availability[day].split(',').map(time => time.trim());
                    }
                }

                const doctorProfileData = {
                    specialization: formData.specialization, qualifications: formData.qualifications,
                    experience: formData.experience, fees: formData.fees,
                    address: formData.address, city: formData.city, state: formData.state,
                    country: formData.country, phone: formData.phone, bio: formData.bio,
                    availability: availabilityForDb,
                };
                await dispatch(updateDoctorProfile(doctorProfileData)).unwrap();
            }
            setSuccessMessage('Profile updated successfully!');
        } catch (error) {
            setPageError(error.message || 'An error occurred during the update.');
        }
    };

    const isLoading = pageLoading || authLoading || doctorLoading;
    const error = pageError || authError || pageError;

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-4xl font-bold mb-6">User Profile</h1>
            <form onSubmit={submitHandler} className="bg-white p-8 rounded-lg shadow-lg">
                {error && <Message variant="danger">{error}</Message>}
                {successMessage && <Message variant="success">{successMessage}</Message>}

                {/* User Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="font-semibold">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                    <div><label className="font-semibold">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                    <div><label className="font-semibold">Password</label><input type="password" name="password" placeholder="Leave blank to keep same" value={formData.password} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                    <div><label className="font-semibold">Confirm Password</label><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                </div>

                {/* Doctor Fields */}
                {userInfo.role === 'doctor' && (
                    <>
                        {/* Stats Section */}
                        <div className="mt-8 border-t pt-6">
                             <h2 className="text-2xl font-bold mb-4">Stats & Vitals</h2>
                             <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg">
                                 <div className="text-center"><div className="flex items-center justify-center text-yellow-500"><FaStar className="mr-1" /><span className="text-2xl font-bold">{formData.averageRating?.toFixed(1) || 'N/A'}</span></div><p className="text-sm text-gray-600">Average Rating</p></div>
                                 <div className="text-center"><p className="text-2xl font-bold">{formData.numReviews || 0}</p><p className="text-sm text-gray-600">Total Reviews</p></div>
                             </div>
                        </div>
                    
                        {/* Editable Details */}
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-2xl font-bold mb-4">Doctor Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="font-semibold">Specialization</label><input type="text" name="specialization" value={formData.specialization || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div><label className="font-semibold">Experience (Years)</label><input type="number" name="experience" value={formData.experience || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div><label className="font-semibold">Fees</label><input type="number" name="fees" value={formData.fees || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div><label className="font-semibold">Phone</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div className="md:col-span-2"><label className="font-semibold">Qualifications (comma-separated)</label><input type="text" name="qualifications" value={formData.qualifications || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div className="md:col-span-2"><label className="font-semibold">Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div><label className="font-semibold">City</label><input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div><label className="font-semibold">State</label><input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div><label className="font-semibold">Country</label><input type="text" name="country" value={formData.country || ''} onChange={handleInputChange} className="w-full p-2 border rounded"/></div>
                                <div className="md:col-span-2"><label className="font-semibold">Bio</label><textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} className="w-full p-2 border rounded" rows="4"></textarea></div>
                            </div>
                        </div>

                        {/* --- NEW AVAILABILITY SECTION --- */}
                        <div className="mt-8 border-t pt-6">
                             <h2 className="text-2xl font-bold mb-4 flex items-center"><FaCalendarAlt className="mr-2" /> Weekly Availability</h2>
                             <p className="text-sm text-gray-500 mb-4">Enter time slots for each day, separated by commas. E.g., 09:00-12:00, 14:00-17:00</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                {Object.keys(initialAvailability).map((day) => (
                                    <div key={day}>
                                        <label className="font-semibold capitalize">{day}</label>
                                        <input
                                            type="text"
                                            name={day}
                                            value={formData.availability[day] || ''}
                                            onChange={handleAvailabilityChange}
                                            placeholder="e.g., 09:00-17:00"
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                ))}
                             </div>
                        </div>
                    </>
                )}
                <div className="mt-8">
                    <button type="submit" disabled={isLoading} className="w-full btn-primary py-3 rounded-lg disabled:bg-gray-400">
                        {isLoading ? 'Updating...' : 'Update Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfilePage;