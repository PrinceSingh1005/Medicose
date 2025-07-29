import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateProfile, resetAuthStatus } from '../features/auth/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import Message from '../components/Message';
import { FaUserCircle, FaStethoscope, FaClock } from 'react-icons/fa';

function ProfilePage() {
  const dispatch = useDispatch();
  const { userInfo, profile, loading, error, success } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  const [specialization, setSpecialization] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [experience, setExperience] = useState('');
  const [fees, setFees] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState({});
  const [medicalLicense, setMedicalLicense] = useState('');

  useEffect(() => {
    if (!userInfo) return;
    if (!profile) {
      dispatch(getUserProfile());
    } else {
      setName(profile.name);
      setEmail(profile.email);
      if (profile.role === 'doctor' && profile.doctorProfile) {
        const doc = profile.doctorProfile;
        setSpecialization(doc.specialization || '');
        setQualifications(doc.qualifications?.join(', ') || '');
        setExperience(doc.experience || '');
        setFees(doc.fees || '');
        setAddress(doc.address || '');
        setCity(doc.city || '');
        setState(doc.state || '');
        setCountry(doc.country || '');
        setPhone(doc.phone || '');
        setBio(doc.bio || '');
        setAvailability(doc.availability || {});
        setMedicalLicense(doc.medicalLicense || '');
      }
    }
  }, [dispatch, userInfo, profile]);

  useEffect(() => {
    if (success) {
      setMessage('Profile updated successfully!');
      dispatch(resetAuthStatus());
      setPassword('');
      setConfirmPassword('');
    }
    if (error) {
      setMessage(error);
      dispatch(resetAuthStatus());
    }
  }, [success, error, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) return setMessage('Passwords do not match');

    const userData = { name, email };
    if (password) userData.password = password;

    if (userInfo.role === 'doctor') {
      userData.doctorProfile = {
        specialization,
        qualifications: qualifications.split(',').map(q => q.trim()).filter(Boolean),
        experience: +experience,
        fees: +fees,
        address, city, state, country, phone, bio, availability, medicalLicense
      };
    }
    dispatch(updateProfile(userData));
  };

  const handleAvailabilityChange = (day, type, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: type === 'start' ? [value, prev[day]?.[1] || ''] : [prev[day]?.[0] || '', value]
    }));
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading && !profile) return <LoadingSpinner />;
  if (!profile) return <Message type="info">Loading profile...</Message>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          {userInfo.role === 'doctor' ? 'Doctor Profile' : 'Patient Profile'}
        </h1>

        {message && <Message type={success ? 'success' : 'error'}>{message}</Message>}
        {loading && <LoadingSpinner />}

        <form onSubmit={submitHandler} className="space-y-12">
          {/* User Info */}
          <section>
            <div className="flex items-center gap-2 text-gray-700 mb-6">
              <FaUserCircle className="text-2xl text-indigo-600" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field id="name" label="Full Name" value={name} onChange={setName} />
              <Field id="email" label="Email" type="email" value={email} onChange={setEmail} />
              <Field id="password" label="New Password" type="password" value={password} onChange={setPassword} />
              <Field id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
            </div>
          </section>

          {userInfo.role === 'doctor' && (
            <section>
              <div className="flex items-center gap-2 text-gray-700 mb-6">
                <FaStethoscope className="text-2xl text-indigo-600" />
                <h2 className="text-xl font-semibold">Professional Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field id="specialization" label="Specialization" value={specialization} onChange={setSpecialization} />
                <Field id="qualifications" label="Qualifications (comma separated)" value={qualifications} onChange={setQualifications} />
                <Field id="experience" label="Years of Experience" type="number" value={experience} onChange={setExperience} />
                <Field id="fees" label="Consultation Fee ($)" type="number" value={fees} onChange={setFees} />
                <Field id="phone" label="Phone Number" type="tel" value={phone} onChange={setPhone} />
                <Field id="address" label="Address" value={address} onChange={setAddress} />
                <Field id="city" label="City" value={city} onChange={setCity} />
                <Field id="state" label="State" value={state} onChange={setState} />
                <Field id="country" label="Country" value={country} onChange={setCountry} />
              </div>
              <div className="mt-6">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field min-h-[100px]"
                  maxLength="500"
                ></textarea>
                <p className="text-right text-xs text-gray-400">{bio.length}/500</p>
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <FaClock className="text-indigo-600" />
                  <h3 className="text-lg font-medium text-gray-700">Availability</h3>
                </div>
                <div className="space-y-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center gap-3">
                      <label className="w-24 text-sm font-medium text-gray-600">{day}</label>
                      <input type="time" value={availability[day]?.[0] || ''} onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)} className="input-field w-28" />
                      <span className="text-gray-500">to</span>
                      <input type="time" value={availability[day]?.[1] || ''} onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)} className="input-field w-28" />
                    </div>
                  ))}
                </div>
              </div>
              <Field id="medicalLicense" label="Medical License (URL)" value={medicalLicense} onChange={setMedicalLicense} placeholder="e.g. https://drive.com/file.pdf" />
            </section>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ id, label, type = 'text', value, onChange, placeholder = '' }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

export default ProfilePage;
