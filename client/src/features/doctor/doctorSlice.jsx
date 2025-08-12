import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  doctors: [],
  selectedDoctor: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  lastUpdated: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes cache
};

const isCacheValid = (lastUpdated, cacheExpiry) => {
  return lastUpdated && (Date.now() - lastUpdated) < cacheExpiry;
};

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const { doctors } = getState();

      if (doctors.doctors.length > 0 && isCacheValid(doctors.lastUpdated, doctors.cacheExpiry)) {
        return doctors.doctors;
      }

      const { specialization, location, minRating, sortBy, search } = filters;
      const params = new URLSearchParams();
      if (specialization) params.append('specialization', specialization);
      if (location) params.append('location', location);
      if (minRating) params.append('minRating', minRating);
      if (sortBy) params.append('sortBy', sortBy);
      if (search) params.append('search', search);

      const { data } = await axios.get(`/doctors?${params.toString()}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorDetails = createAsyncThunk(
  'doctors/fetchDoctorDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { doctors } = getState();

      if (doctors.selectedDoctor?._id === id && isCacheValid(doctors.lastUpdated, doctors.cacheExpiry)) {
        return doctors.selectedDoctor;
      }

      const { data } = await axios.get(`/doctors/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch doctor details');
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctors/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo }, doctors } = getState();

      if (doctors.selectedDoctor?.user?._id !== userInfo._id) {
        throw new Error('Not authorized to update this profile');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put('/doctors/profile', profileData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    resetDoctorStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearSelectedDoctor: (state) => {
      state.selectedDoctor = null;
    },
    setCacheExpiry: (state, action) => {
      state.cacheExpiry = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.doctors = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Doctor Details
      .addCase(fetchDoctorDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDoctorDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedDoctor = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDoctorDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.selectedDoctor = null;
      })

      // Update Doctor Profile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastUpdated = Date.now();

        if (state.selectedDoctor?._id === action.payload._id) {
          state.selectedDoctor = action.payload;
        }

        state.doctors = state.doctors.map(doctor =>
          doctor._id === action.payload._id ? action.payload : doctor
        );
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetDoctorStatus, clearSelectedDoctor, setCacheExpiry } = doctorSlice.actions;
export default doctorSlice.reducer;
