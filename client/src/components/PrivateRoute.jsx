import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const { userInfo } = useSelector((state) => state.auth);

  // Check if user is logged in and has an allowed role
  if (userInfo && userInfo.token && allowedRoles.includes(userInfo.role)) {
    return <Outlet />; // Render child routes
  } else if (userInfo && userInfo.token) {
    // Logged in but not authorized for this role
    return <Navigate to="/" replace />; // Redirect to home or an unauthorized page
  } else {
    // Not logged in
    return <Navigate to="/login" replace />; // Redirect to login
  }
};

export default PrivateRoute;
