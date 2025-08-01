import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  doctors: [],
  selectedDoctor: null,
  loading: false,
  error: null,
  success: false,
};

// Async Thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (filters = {}, { rejectWithValue }) => {
    try {
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
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return rejectWithValue(message);
    }
  }
);

export const fetchDoctorDetails = createAsyncThunk(
  'doctors/fetchDoctorDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/doctors/${id}`);
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return rejectWithValue(message);
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctors/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      // Assuming your update endpoint is '/api/doctors/profile'
      const { data } = await axios.put('/doctors/profile', profileData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    resetDoctorStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearSelectedDoctor: (state) => {
      state.selectedDoctor = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Doctor Details
      .addCase(fetchDoctorDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedDoctor = null;
      })
      .addCase(fetchDoctorDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDoctor = action.payload;
      })
      .addCase(fetchDoctorDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedDoctor = null;
      })
      // Update Doctor Profile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        // Update the selectedDoctor if it's the one being edited
        if (state.selectedDoctor?._id === action.payload._id) {
            state.selectedDoctor = { ...state.selectedDoctor, ...action.payload };
        }
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDoctorStatus, clearSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;