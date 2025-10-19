import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from '../api/axios';
import { updateProfile, updateProfilePhoto, updatePatientProfilePhoto } from '../features/auth/authSlice';
import { updateDoctorProfile } from '../features/doctor/doctorSlice';
import { fetchPatientProfile, updatePatientProfile } from '../features/patient/patientSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaStar, FaCalendarAlt, FaCamera, FaUserMd, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

function ProfilePage() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // --- Redux State ---
  const { userInfo, loading: authLoading } = useSelector((state) => state.auth);
  const { loading: doctorLoading } = useSelector((state) => state.doctors);
  const { profile: patientProfile, status: patientStatus } = useSelector((state) => state.patient);

  // --- Component State ---
  const [imageFile, setImageFile] = useState(null); // Holds the actual file for submission
  const [previewImage, setPreviewImage] = useState(''); // Holds the URL for display
  const [isUploading, setIsUploading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

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

  // --- Effects to Fetch Profile Data ---
  useEffect(() => {
    setFormData(prev => ({ ...prev, name: userInfo?.name || '', email: userInfo?.email || '' }));
    setPreviewImage(userInfo?.profilePhoto || '/avatar.png');

    if (userInfo?.role === 'doctor') {
      const fetchDoctorProfile = async () => {
        setPageLoading(true);
        try {
          const { data } = await axios.get('/doctors/profile/me', {
            headers: { Authorization: `Bearer ${userInfo?.token}` },
          });
          if (data) {
            setDoctorId(data._id);
            setPreviewImage(data.profilePhoto || userInfo?.profilePhoto || '/avatar.png');
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
        } catch (error) {
          console.error(error);
          toast.error('Could not load your doctor profile');
        } finally {
          setPageLoading(false);
        }
      };
      fetchDoctorProfile();
    } else if (userInfo?.role === 'patient') {
      dispatch(fetchPatientProfile());
    } else {
      setPageLoading(false);
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (userInfo?.role === 'patient') {
      if (patientStatus === 'succeeded' && patientProfile) {
        const dob = patientProfile.dateOfBirth ? new Date(patientProfile.dateOfBirth).toISOString().split('T')[0] : '';
        setFormData(prev => ({ ...prev, ...patientProfile, dateOfBirth: dob }));
        setPageLoading(false);
      } else if (patientStatus === 'loading') {
        setPageLoading(true);
      } else if (patientStatus === 'failed') {
        setPageLoading(false);
      }
    }
  }, [patientProfile, patientStatus, userInfo?.role]);

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      availability: { ...prev.availability, [name]: value },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      let newPhotoUrl = null;

      // Step 1: Upload the image if a new one is selected
      if (imageFile) {
        setIsUploading(true);
        const imageFormData = new FormData();
        imageFormData.append('profilePhoto', imageFile);

        let resultAction;
        if (userInfo.role === 'doctor' && doctorId) {
          resultAction = await dispatch(updateProfilePhoto({ doctorId, formData: imageFormData })).unwrap();
        } else if (userInfo.role === 'patient') {
          resultAction = await dispatch(updatePatientProfilePhoto(imageFormData)).unwrap();
        }
        
        if (resultAction && resultAction.profilePhoto) {
            newPhotoUrl = resultAction.profilePhoto;
            toast.success('Profile picture updated successfully!');
        } else {
            throw new Error('Failed to get new photo URL from server.');
        }
      }

      // Step 2: Update the basic user info (name, email, password)
      const userUpdateData = { name: formData.name, email: formData.email };
      if (formData.password) {
        userUpdateData.password = formData.password;
      }
      await dispatch(updateProfile(userUpdateData)).unwrap();

      // Step 3: Update role-specific profile details (doctor or patient)
      if (userInfo.role === 'doctor') {
        const availabilityForDb = {};
        for (const day in formData.availability) {
          if (formData.availability[day]) {
            availabilityForDb[day] = formData.availability[day].split(',').map(time => time.trim());
          }
        }

        const doctorProfileData = {
          specialization: formData.specialization,
          qualifications: formData.qualifications.split(',').map(q => q.trim()).filter(Boolean),
          experience: formData.experience,
          fees: formData.fees,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          phone: formData.phone,
          bio: formData.bio,
          availability: availabilityForDb,
        };
        
        if (newPhotoUrl) {
          doctorProfileData.profilePhoto = newPhotoUrl;
        }
        await dispatch(updateDoctorProfile(doctorProfileData)).unwrap();

      } else if (userInfo.role === 'patient') {
        const patientProfileData = {
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          phone: formData.phone,
        };
        
        if (newPhotoUrl) {
          patientProfileData.profilePhoto = newPhotoUrl;
        }
        await dispatch(updatePatientProfile(patientProfileData)).unwrap();
      }

      toast.success('Profile updated successfully!');

    } catch (error) {
      toast.error(error.message || 'An error occurred during the update.');
    } finally {
        setIsUploading(false);
        setImageFile(null); 
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isLoading = authLoading || doctorLoading || patientStatus === 'loading';

  if (pageLoading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={previewImage}
              alt="Profile"
              className="size-32 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                if (e.target.src !== '/avatar.png') {
                  setPreviewImage('/avatar.png');
                  e.target.src = '/avatar.png';
                }
              }}
            />
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-0 right-0 
                bg-blue-600 hover:bg-blue-700
                p-2 rounded-full cursor-pointer 
                transition-all duration-200
                ${isUploading ? 'animate-pulse pointer-events-none' : ''}
              `}
            >
              <FaCamera className="w-5 h-5 text-white" />
              <input
                type="file"
                id="avatar-upload"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange} // Changed to handleImageChange
                disabled={isUploading || isLoading}
              />
            </label>
          </div>
          <h1 className="text-3xl font-bold">{formData.name}</h1>
          <div className="flex items-center text-gray-500">
            {userInfo.role === 'doctor' ? <FaUserMd className="mr-2" /> : <FaUser className="mr-2" />}
            <span className="capitalize">{userInfo.role}</span>
          </div>
          <p className="text-sm text-gray-500 h-5">
              {isUploading ? 'Uploading image...' : 'Click the camera icon to choose a new photo'}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={submitHandler} className="bg-white p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="font-semibold">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
          <div><label className="font-semibold">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
          <div><label className="font-semibold">Password</label><input type="password" name="password" placeholder="Leave blank to keep same" onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
          <div><label className="font-semibold">Confirm Password</label><input type="password" name="confirmPassword" onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
        </div>

        {/* Doctor-specific Fields */}
        {userInfo.role === 'doctor' && (
           <>
             <div className="mt-8 border-t pt-6">
               <h2 className="text-2xl font-bold mb-4">Stats & Vitals</h2>
               <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg">
                 <div className="text-center"><div className="flex items-center justify-center text-yellow-500"><FaStar className="mr-1" /><span className="text-2xl font-bold">{formData.averageRating?.toFixed(1) || 'N/A'}</span></div><p className="text-sm text-gray-600">Average Rating</p></div>
                 <div className="text-center"><p className="text-2xl font-bold">{formData.numReviews || 0}</p><p className="text-sm text-gray-600">Total Reviews</p></div>
               </div>
             </div>
 
             <div className="mt-8 border-t pt-6">
               <h2 className="text-2xl font-bold mb-4">Doctor Details</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div><label className="font-semibold">Specialization</label><input type="text" name="specialization" value={formData.specialization || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div><label className="font-semibold">Experience (Years)</label><input type="number" name="experience" value={formData.experience || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div><label className="font-semibold">Fees</label><input type="number" name="fees" value={formData.fees || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div><label className="font-semibold">Phone</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div className="md:col-span-2"><label className="font-semibold">Qualifications (comma-separated)</label><input type="text" name="qualifications" value={formData.qualifications || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div className="md:col-span-2"><label className="font-semibold">Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div><label className="font-semibold">City</label><input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div><label className="font-semibold">State</label><input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div><label className="font-semibold">Country</label><input type="text" name="country" value={formData.country || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                 <div className="md:col-span-2"><label className="font-semibold">Bio</label><textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} className="w-full p-2 border rounded" rows="4"></textarea></div>
               </div>
             </div>
 
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
        
        {/* Patient-specific Fields */}
        {userInfo.role === 'patient' && (
           <div className="mt-8">
             <h2 className="text-2xl font-bold mb-6 border-b pb-4">Patient Details</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div><label className="font-semibold block mb-1">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
               <div><label className="font-semibold block mb-1">Gender</label>
                 <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full p-2 border rounded bg-white">
                   <option value="">Select Gender</option>
                   <option value="Male">Male</option>
                   <option value="Female">Female</option>
                   <option value="Other">Other</option>
                 </select>
               </div>
               <div className="md:col-span-2"><label className="font-semibold block mb-1">Address</label><input type="text" name="address" value={formData.address || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
               <div><label className="font-semibold block mb-1">City</label><input type="text" name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
               <div><label className="font-semibold block mb-1">State</label><input type="text" name="state" value={formData.state || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
               <div><label className="font-semibold block mb-1">Country</label><input type="text" name="country" value={formData.country || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
               <div><label className="font-semibold block mb-1">Phone</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
             </div>
           </div>
        )}

        {/* Submit Button */}
        <div className="mt-8">
          <button type="submit" disabled={isLoading || isUploading} className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors">
            {isLoading || isUploading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilePage;