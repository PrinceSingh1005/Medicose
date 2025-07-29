import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import doctorReducer from '../features/doctor/doctorSlice'; // You'll create this

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorReducer, // For doctor search and details
    // Add other reducers here as your app grows (e.g., appointments, prescriptions)
  },
});

export default store;