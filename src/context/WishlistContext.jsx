import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    // Fetch wishlist from Firestore when user logs in
    const fetchWishlist = useCallback(async () => {
        if (!currentUser) {
            setWishlist(new Set());
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const wishlistColRef = collection(db, 'users', currentUser.uid, 'wishlist');
            const wishlistSnapshot = await getDocs(wishlistColRef);
            const productIds = wishlistSnapshot.docs.map(doc => doc.id);
            setWishlist(new Set(productIds));
        } catch (error) {
            console.error("Error fetching wishlist: ", error);
            toast.error("Could not fetch wishlist.");
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    // Clear local wishlist on logout
    useEffect(() => {
        if (!currentUser) {
            setWishlist(new Set());
        }
    }, [currentUser]);

    const addToWishlist = async (productId) => {
        if (!currentUser) {
            toast.error("Please log in to add items to your wishlist.");
            return;
        }
        try {
            // Optimistic UI update: update state before async operation
            setWishlist(prevWishlist => {
                if (prevWishlist.has(productId)) return prevWishlist; // Already in wishlist, do nothing
                // Create a new Set to ensure React detects the state change
                const newWishlist = new Set(prevWishlist);
                newWishlist.add(productId);
                return newWishlist;
            });
            await setDoc(doc(db, 'users', currentUser.uid, 'wishlist', productId), { productId });
            toast.success("Added to wishlist!");
        } catch (error) {
            console.error("Error adding to wishlist: ", error);
            toast.error("Could not add to wishlist.");
            // Revert UI on error
            setWishlist(prev => {
                const newWishlist = new Set(prev);
                newWishlist.delete(productId);
                return newWishlist;
            });
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!currentUser) return;
        try {
            // Optimistic UI update
            setWishlist(prevWishlist => {
                if (!prevWishlist.has(productId)) return prevWishlist; // Not in wishlist, do nothing
                // Create a new Set for re-render
                const newWishlist = new Set(prevWishlist);
                newWishlist.delete(productId);
                return newWishlist;
            });
            await deleteDoc(doc(db, 'users', currentUser.uid, 'wishlist', productId));
            toast.success("Removed from wishlist!");
        } catch (error) {
            console.error("Error removing from wishlist: ", error);
            toast.error("Could not remove from wishlist.");
            // Revert UI on error
            setWishlist(prev => {
                const newWishlist = new Set(prev);
                newWishlist.add(productId);
                return newWishlist;
            });
        }
    };
    
    // Single handler for toggling an item
    const handleWishlist = (productId) => {
        if (wishlist.has(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(productId);
        }
    };

    const value = {
        wishlist,
        loading,
        handleWishlist,
        itemCount: wishlist.size
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};