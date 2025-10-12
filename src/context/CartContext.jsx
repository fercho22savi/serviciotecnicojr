import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

// 1. Crear el contexto
export const CartContext = createContext();

// Hook para usar el contexto del carrito
export const useCart = () => {
    return useContext(CartContext);
};

// 2. Crear el proveedor del contexto
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Cargar el carrito desde localStorage al iniciar
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Error al cargar el carrito desde localStorage", error);
            setCartItems([]);
        }
    }, []);

    // Guardar el carrito en localStorage cada vez que cambie
    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Error al guardar el carrito en localStorage", error);
        }
    }, [cartItems]);

    // Añadir un producto al carrito
    const addToCart = (product, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                toast.success('Producto actualizado en el carrito');
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                toast.success('Producto añadido al carrito');
                return [...prevItems, { ...product, quantity }];
            }
        });
    };

    // Eliminar un producto del carrito
    const removeFromCart = (productId) => {
        setCartItems(prevItems => {
            toast.error('Producto eliminado del carrito');
            return prevItems.filter(item => item.id !== productId);
        });
    };

    // Actualizar la cantidad de un producto
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCartItems(prevItems => {
                toast.success('Cantidad actualizada');
                return prevItems.map(item =>
                    item.id === productId ? { ...item, quantity } : item
                );
            });
        }
    };

    // Vaciar el carrito
    const clearCart = () => {
        setCartItems([]);
        toast.success('El carrito se ha vaciado');
    };

    // Calcular el total de artículos
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    // Calcular el precio total
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
