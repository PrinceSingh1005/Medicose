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
      });
  },
});

export const { resetDoctorStatus, clearSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;