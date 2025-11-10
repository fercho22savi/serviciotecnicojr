import { db } from './config';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

/**
 * Guarda un nuevo pedido en la base de datos.
 * @param {Object} orderData Los datos del pedido a guardar.
 * @returns {string} El ID del pedido recién creado.
 */
export const saveOrder = async (orderData) => {
  try {
    const orderWithTimestamp = {
      ...orderData,
      createdAt: serverTimestamp(),
      orderNumber: `JR-${Date.now()}` // Generar un número de pedido simple
    };
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error("Error saving order to Firestore: ", error);
    throw new Error('Could not save the order. Please try again.');
  }
};

/**
 * Obtiene las direcciones guardadas de un usuario.
 * @param {string} userId El ID del usuario.
 * @returns {Array<Object>} Una lista de las direcciones del usuario.
 */
export const fetchUserAddresses = async (userId) => {
  if (!userId) return [];
  try {
    const addressesRef = collection(db, `users/${userId}/addresses`);
    const q = query(addressesRef);
    const querySnapshot = await getDocs(q);
    
    const addresses = [];
    querySnapshot.forEach((doc) => {
      addresses.push({ id: doc.id, ...doc.data() });
    });
    
    return addresses;
  } catch (error) {
    console.error("Error fetching user addresses: ", error);
    // No lanzar un error fatal, simplemente devolver una lista vacía.
    return [];
  }
};
