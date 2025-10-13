
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
    browserSessionPersistence, // Sesión dura hasta que se cierra el navegador
    browserLocalPersistence    // Sesión persiste incluso después de cerrar el navegador
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CircularProgress, Box } from '@mui/material';
// Import hooks from other contexts
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Get cleanup functions from other contexts
    const { clearCart } = useCart();
    const { clearWishlist } = useWishlist();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
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

    const logout = async () => {
        try {
            await signOut(auth);
            // Clear user-specific data upon logout
            clearCart();
            clearWishlist();
        } catch (error) {
            console.error("Error during logout:", error);
            // Still attempt to clear local data even if signOut fails
            clearCart();
            clearWishlist();
        }
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
