import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import doctorReducer from '../features/doctor/doctorSlice'; 
import patientReducer from '../features/patient/patientSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorReducer, 
    patient: patientReducer,
  },
});

export default store;