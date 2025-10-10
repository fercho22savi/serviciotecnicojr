import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function AdminRoute({ user, adminUIDs, children }) {
  const isAuth = user && adminUIDs.includes(user.uid);

  if (!isAuth) {
    // We can show a toast message for better UX
    // This will only trigger if they try to access the route directly
    toast.error('No tienes permiso para acceder a esta página.');
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
