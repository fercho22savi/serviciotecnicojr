
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Initialize state from localStorage or with an empty array
    const [cart, setCart] = useState(() => {
        try {
            const localData = localStorage.getItem('cart');
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error("Error reading cart from localStorage", error);
            return [];
        }
    });

    // Persist state to localStorage whenever the cart changes
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error("Error saving cart to localStorage", error);
        }
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setCart(prevCart => prevCart.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        try {
            localStorage.removeItem('cart');
        } catch (error) {
            console.error("Error clearing cart from localStorage", error);
        }
    };

    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartItemCount,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
