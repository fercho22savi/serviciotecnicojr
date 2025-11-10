
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    setPersistence,
    browserSessionPersistence, 
    browserLocalPersistence    
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CircularProgress, Box } from '@mui/material';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // FOR DEVELOPMENT: Automatically grant admin privileges.
                // In a production environment, this should be replaced with a secure role-check,
                // for example, by verifying a custom claim on the user's ID token.
                setIsAdmin(true);
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (email, password, rememberMe) => {
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        return setPersistence(auth, persistence).then(() => {
            return signInWithEmailAndPassword(auth, email, password);
        });
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = () => {
        return signOut(auth);
    };

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const value = {
        currentUser,
        isAdmin,
        loading,
        login,
        loginWithGoogle,
        logout,
        resetPassword
    };
    
    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : ( 
                children 
            )}
        </AuthContext.Provider>
    );
};