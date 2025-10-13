
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const AdminRoute = ({ children }) => {
    const { isAdmin, loading, currentUser } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!currentUser) {
        // If not loading and no user, redirect to login
        return <Navigate to="/login" replace />;
    }

    // If user is not an admin, redirect to their account page or home
    return isAdmin ? (children || <Outlet />) : <Navigate to="/account/profile" replace />;
};

export default AdminRoute;
