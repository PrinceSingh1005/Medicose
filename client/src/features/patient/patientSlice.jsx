import { createSlice, createAsyncThunk } from 'https://esm.sh/@reduxjs/toolkit';
import axios from '../../api/axios';

const initialState = {
  profile: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

export const fetchPatientProfile = createAsyncThunk(
  'patient/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      // You might need to configure axios base URL globally
      const { data } = await axios.get('/patients/profile/me', config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Could not load patient profile.');
    }
  }
);

export const updatePatientProfile = createAsyncThunk(
  'patient/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
       // You might need to configure axios base URL globally
      const { data } = await axios.put('patients/profile/me', profileData, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile.');
    }
  }
);

const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    resetPatientStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updatePatientProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetPatientStatus } = patientSlice.actions;
export default patientSlice.reducer;

