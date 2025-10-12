import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence, // For "Remember Me" functionality
    browserSessionPersistence // Default behavior
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userRef);
                setIsAdmin(docSnap.exists() && docSnap.data().isAdmin);
                setUser(currentUser);
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email, password, rememberMe) => {
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = () => signOut(auth);

    const resetPassword = (email) => sendPasswordResetEmail(auth, email);

    const value = {
        user,
        isAdmin,
        loading,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        onAuthStateChanged
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
