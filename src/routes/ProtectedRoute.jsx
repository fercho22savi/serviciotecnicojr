import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth(); // Corrected: use user instead of currentUser
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
