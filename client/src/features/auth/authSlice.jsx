import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axios'; // Use your configured axios instance

const userInfoFromStorage = localStorage.getItem('userInfo');

// Check if the retrieved value is not the string "undefined" before parsing
const parsedUserInfo = userInfoFromStorage && userInfoFromStorage !== "undefined"
  ? JSON.parse(userInfoFromStorage)
  : null;

const initialState = {
  userInfo: parsedUserInfo,
  profile: null, // To store detailed user profile (patient/doctor/admin)
  loading: false,
  error: null,
  success: false,
};

// Async Thunks
export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        '/auth/register',
        { name, email, password, role },
        config
      );
      if (data && data.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
      }
      else {
        throw new Error('Invalid registration response from server.');
      }
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        '/auth/login',
        { email, password },
        config
      );
      if (data && data.token) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
      }
      else {
        throw new Error('Invalid login response from server.');
      }
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return rejectWithValue(message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('No authentication token found.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/auth/profile', config);
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      // If token is invalid/expired, log out the user
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('userInfo');
        window.location.reload(); // Force reload to clear state
      }
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('No authentication token found.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put('/auth/profile', userData, config);
      // Update userInfo in localStorage if relevant fields change (e.g., name, email)
      if (data) {
        const updatedUserInfo = { ...userInfo, name: data.name, email: data.email };
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      }
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

export const updateProfilePhoto = createAsyncThunk(
  'auth/updateProfilePhoto',
  async ({ doctorId, formData }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('No authentication token found.');
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(`/doctors/${doctorId}/uploadProfilePhoto`, formData, config);
      if (data && data.user) {
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          return data.user;
      }
      return rejectWithValue('User data not returned from server.');
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return rejectWithValue(message);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userInfo'); // Clear user info from localStorage
      state.userInfo = null;
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    resetAuthStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userInfo = action.payload;
        state.profile = null; // Profile will be fetched separately
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userInfo = action.payload;
        state.profile = null; // Profile will be fetched separately
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.userInfo = { ...state.userInfo, profileLoaded: true }; // Mark profile as loaded
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.profile = null;
        state.userInfo = { ...state.userInfo, profileLoaded: false }; // Reset flag on error
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update userInfo and profile with new data
        state.userInfo = { ...state.userInfo, name: action.payload.name, email: action.payload.email };
        state.profile = { ...state.profile, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userInfo = action.payload;
      })
      .addCase(updateProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { logout, resetAuthStatus } = authSlice.actions;
export default authSlice.reducer;
