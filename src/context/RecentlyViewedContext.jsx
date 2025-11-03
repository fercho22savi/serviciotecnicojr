import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);

const MAX_RECENTLY_VIEWED = 50; // We will store the last 50 viewed products

export const RecentlyViewedProvider = ({ children }) => {
    const [viewed, setViewed] = useState([]);

    const forceReload = useCallback(() => {
        try {
            const items = localStorage.getItem('recentlyViewed');
            setViewed(items ? JSON.parse(items) : []);
        } catch (error) {
            console.error("Error parsing recently viewed items from localStorage:", error);
            setViewed([]);
        }
    }, []);

    // On initial load, try to get the list from localStorage
    useEffect(() => {
        forceReload();
    }, [forceReload]);

    // When the 'viewed' state changes, save it to localStorage
    useEffect(() => {
        try {
            // Avoid saving the initial empty array before hydration from local storage
            if (viewed.length > 0 || localStorage.getItem('recentlyViewed') !== null) {
                 localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
            }
        } catch (error) {
            console.error("Error saving recently viewed items to localStorage:", error);
        }
    }, [viewed]);

    const addProduct = useCallback((productId) => {
        if (!productId) return;

        setViewed(currentViewed => {
            // Remove the product if it already exists to move it to the front
            const filteredViewed = currentViewed.filter(id => id !== productId);
            // Add the new product to the beginning of the list
            const newViewed = [productId, ...filteredViewed];
            // Enforce the maximum limit
            return newViewed.length > MAX_RECENTLY_VIEWED 
                ? newViewed.slice(0, MAX_RECENTLY_VIEWED) 
                : newViewed;
        });
    }, []);

    const value = {
        recentlyViewedIds: viewed,
        addProduct,
        forceReload, // Expose the reload function
    };

    return (
        <RecentlyViewedContext.Provider value={value}>
            {children}
        </RecentlyViewedContext.Provider>
    );
};
