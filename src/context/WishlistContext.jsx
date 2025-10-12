import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

// 1. Crear el contexto
export const WishlistContext = createContext();

// Hook para usar el contexto de la lista de deseos
export const useWishlist = () => {
    return useContext(WishlistContext);
};

// 2. Crear el proveedor del contexto
export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);

    // Cargar la lista de deseos desde localStorage al iniciar
    useEffect(() => {
        try {
            const storedWishlist = localStorage.getItem('wishlist');
            if (storedWishlist) {
                setWishlistItems(JSON.parse(storedWishlist));
            }
        } catch (error) {
            console.error("Error al cargar la lista de deseos desde localStorage", error);
            setWishlistItems([]);
        }
    }, []);

    // Guardar la lista de deseos en localStorage cada vez que cambie
    useEffect(() => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        } catch (error) {
            console.error("Error al guardar la lista de deseos en localStorage", error);
        }
    }, [wishlistItems]);

    // Añadir o quitar un producto de la lista de deseos
    const toggleWishlistItem = (product) => {
        setWishlistItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                toast.success('Producto eliminado de la lista de deseos');
                return prevItems.filter(item => item.id !== product.id);
            } else {
                toast.success('Producto añadido a la lista de deseos');
                return [...prevItems, product];
            }
        });
    };

    // Comprobar si un producto está en la lista de deseos
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.id === productId);
    };

    // Contar los artículos en la lista de deseos
    const wishlistItemCount = wishlistItems.length;

    const value = {
        wishlistItems,
        toggleWishlistItem,
        isInWishlist,
        wishlistItemCount
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
