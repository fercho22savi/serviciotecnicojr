import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);

const MAX_RECENTLY_VIEWED = 15; // We will store the last 15 viewed products

export const RecentlyViewedProvider = ({ children }) => {
    const [viewed, setViewed] = useState([]);

    // On initial load, try to get the list from localStorage
    useEffect(() => {
        try {
            const items = localStorage.getItem('recentlyViewed');
            if (items) {
                setViewed(JSON.parse(items));
            }
        } catch (error) {
            console.error("Error parsing recently viewed items from localStorage:", error);
            setViewed([]);
        }
    }, []);

    // When the 'viewed' state changes, save it to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
        } catch (error) {
            console.error("Error saving recently viewed items to localStorage:", error);
        }
    }, [viewed]);

    /**
     * Adds a product to the recently viewed list.
     * If the product is already in the list, it moves it to the front.
     * @param {string} productId The ID of the product to add.
     */
    const addProduct = (productId) => {
        if (!productId) return; // Do nothing if productId is invalid

        setViewed(currentViewed => {
            // 1. Remove the product if it already exists to avoid duplicates and to move it to the front.
            const filteredViewed = currentViewed.filter(id => id !== productId);

            // 2. Add the new product ID to the beginning of the array.
            const newViewed = [productId, ...filteredViewed];

            // 3. Ensure the list doesn't exceed the maximum size.
            if (newViewed.length > MAX_RECENTLY_VIEWED) {
                return newViewed.slice(0, MAX_RECENTLY_VIEWED);
            }

            return newViewed;
        });
    };

    const value = {
        recentlyViewedIds: viewed,
        addProduct,
    };

    return (
        <RecentlyViewedContext.Provider value={value}>
            {children}
        </RecentlyViewedContext.Provider>
    );
};
