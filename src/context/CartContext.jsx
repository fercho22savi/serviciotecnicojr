
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, writeBatch, query, where, documentId, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [cart, setCart] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [cartId, setCartId] = useState(null);

    useEffect(() => {
        const fetchCart = async () => {
            if (!currentUser) {
                setCart(new Map());
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const cartRef = collection(db, 'users', currentUser.uid, 'cart');
                const cartSnapshot = await getDocs(cartRef);

                if (!cartSnapshot.empty) {
                    const cartDoc = cartSnapshot.docs[0];
                    setCartId(cartDoc.id);
                    const productIds = Object.keys(cartDoc.data().products || {});

                    if (productIds.length > 0) {
                        const productsRef = collection(db, 'products');
                        const q = query(productsRef, where(documentId(), 'in', productIds));
                        const productsSnap = await getDocs(q);
                        const productsData = new Map(productsSnap.docs.map(doc => [doc.id, { ...doc.data(), id: doc.id }]));

                        const newCart = new Map();
                        Object.entries(cartDoc.data().products).forEach(([id, item]) => {
                            if(productsData.has(id)) {
                                newCart.set(id, { ...productsData.get(id), quantity: item.quantity });
                            }
                        });
                        setCart(newCart);
                    } else {
                        setCart(new Map());
                    }
                } else {
                    setCart(new Map()); // No cart document exists
                }
            } catch (error) {
                console.error("Error fetching cart: ", error);
                toast.error("Error al cargar el carrito.");
            }
            setLoading(false);
        };

        fetchCart();
    }, [currentUser]);
    
    // Effect to clear cart on logout
    useEffect(() => {
        if (!currentUser) {
            clearCart();
        }
    }, [currentUser]);

    const updateFirestoreCart = async (newCart) => {
        if (!currentUser) return; // Not logged in

        try {
            const batch = writeBatch(db);
            const userCartRef = doc(db, 'users', currentUser.uid, 'cart', cartId || `cart_${currentUser.uid}`);

            const productsForFirestore = {};
            newCart.forEach((item, key) => {
                productsForFirestore[key] = { 
                    quantity: item.quantity,
                    // Do not store the full product details, only what's necessary
                };
            });

            if (newCart.size > 0) {
                const cartData = { 
                    products: productsForFirestore, 
                    updatedAt: serverTimestamp()
                };
                // If cartId doesn't exist, it means we are creating a new cart document
                if (!cartId) {
                    batch.set(userCartRef, cartData);
                    setCartId(`cart_${currentUser.uid}`); // Set the new cart ID
                } else {
                    batch.update(userCartRef, cartData);
                }
            } else {
                // If cart is empty, delete the cart document
                if (cartId) {
                    batch.delete(userCartRef);
                    setCartId(null); // Reset cartId
                }
            }

            await batch.commit();

        } catch (error) {
            console.error("Error updating Firestore cart: ", error);
            toast.error("No se pudo actualizar tu carrito.");
        }
    };

    const addToCart = (product, quantity = 1) => {
        if (!product || !product.id) {
            toast.error("No se puede añadir un producto inválido.");
            return;
        }

        const newCart = new Map(cart);
        const existingItem = newCart.get(product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
                toast.error(`¡No puedes añadir más! Stock disponible: ${product.stock}`);
                return;
            }
            existingItem.quantity = newQuantity;
        } else {
            if (quantity > product.stock) {
                toast.error(`¡Stock insuficiente! Disponible: ${product.stock}`);
                return;
            }
            newCart.set(product.id, { ...product, quantity });
        }
        
        setCart(newCart);
        updateFirestoreCart(newCart);
        toast.success(`${product.name} fue añadido al carrito.`);
    };
    
    const removeFromCart = (productId) => {
        const newCart = new Map(cart);
        if (newCart.has(productId)) {
            newCart.delete(productId);
            setCart(newCart);
            updateFirestoreCart(newCart);
            toast.success("Producto eliminado del carrito.");
        } else {
            toast.error("El producto no estaba en el carrito.");
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const newCart = new Map(cart);
        const item = newCart.get(productId);

        if (item) {
            if (newQuantity <= 0) {
                removeFromCart(productId);
                return;
            }
            if (newQuantity > item.stock) {
                toast.error(`¡Stock insuficiente! Disponible: ${item.stock}`);
                return;
            }
            item.quantity = newQuantity;
            setCart(newCart);
            updateFirestoreCart(newCart);
        } else {
            toast.error("Producto no encontrado en el carrito.");
        }
    };

    const clearCart = () => {
        setCart(new Map());
        setCartId(null);
        // If user is logged in, also clear the firestore cart
        if (currentUser) {
            const userCartRef = doc(db, 'users', currentUser.uid, 'cart', cartId || `cart_${currentUser.uid}`);
            const batch = writeBatch(db);
            batch.delete(userCartRef);
            batch.commit().catch(e => console.error("Error clearing firestore cart", e));
        }
    };

    const cartItemCount = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, cartItemCount }}>
            {children}
        </CartContext.Provider>
    );
};