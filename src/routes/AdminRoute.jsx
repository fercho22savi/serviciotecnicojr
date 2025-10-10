import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress } from '@mui/material';

const AdminRoute = () => {
    const { currentUser, loading } = useAuth();
    if (loading) {
        return <CircularProgress />
    }
    return currentUser && currentUser.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}

export default AdminRoute;
