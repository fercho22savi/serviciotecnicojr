import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const { t } = useTranslation();

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
            toast.error(t('wishlist.toast.fetch_error'));
        } finally {
            setLoading(false);
        }
    }, [currentUser, t]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    useEffect(() => {
        if (!currentUser) {
            setWishlist(new Set());
        }
    }, [currentUser]);

    const addToWishlist = async (productId) => {
        if (!currentUser) {
            toast.error(t('wishlist.toast.add_login_prompt'));
            return;
        }
        try {
            setWishlist(prevWishlist => {
                if (prevWishlist.has(productId)) return prevWishlist;
                const newWishlist = new Set(prevWishlist);
                newWishlist.add(productId);
                return newWishlist;
            });
            await setDoc(doc(db, 'users', currentUser.uid, 'wishlist', productId), { productId });
            toast.success(t('wishlist.toast.add_success'));
        } catch (error) {
            console.error("Error adding to wishlist: ", error);
            toast.error(t('wishlist.toast.add_error'));
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
            setWishlist(prevWishlist => {
                if (!prevWishlist.has(productId)) return prevWishlist;
                const newWishlist = new Set(prevWishlist);
                newWishlist.delete(productId);
                return newWishlist;
            });
            await deleteDoc(doc(db, 'users', currentUser.uid, 'wishlist', productId));
            toast.success(t('wishlist.toast.remove_success'));
        } catch (error) {
            console.error("Error removing from wishlist: ", error);
            toast.error(t('wishlist.toast.remove_error'));
            setWishlist(prev => {
                const newWishlist = new Set(prev);
                newWishlist.add(productId);
                return newWishlist;
            });
        }
    };
    
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
