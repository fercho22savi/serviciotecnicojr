import { db, analytics } from './config';
import { collection, serverTimestamp, getDocs, doc, setDoc } from 'firebase/firestore';
import { logEvent } from "firebase/analytics";

// --- ORDER MANAGEMENT --- //

/**
 * Guarda una orden en la base de datos y actualiza el stock de productos.
 * @param {object} orderData - Datos de la orden a guardar.
 * @returns {string} El número de orden legible para el usuario.
 * @throws {Error} Si falla al guardar la orden.
 */
export const saveOrder = async (orderData) => {
  if (!orderData || !orderData.userId || !orderData.items) {
    throw new Error('Datos de la orden incompletos o inválidos.');
  }

  const orderRef = doc(collection(db, 'orders'));
  const orderId = orderRef.id; // Firestore document ID
  const orderNumber = `ORD-${Date.now()}`; // Human-readable order number

  try {
    await setDoc(orderRef, {
      ...orderData,
      id: orderId, // Store the document ID in the document
      orderNumber: orderNumber, // Store the human-readable number
      createdAt: serverTimestamp()
    });

    // --- Conditional Analytics Event ---
    if (analytics) {
      logEvent(analytics, 'purchase', {
        transaction_id: orderNumber,
        value: orderData.pricing.total,
        currency: orderData.pricing.currency,
        coupon: orderData.coupon?.code,
        items: orderData.items.map(item => ({ 
          item_id: item.id, 
          item_name: item.name, 
          price: item.price, 
          quantity: item.quantity 
        }))
      });
    } else {
      console.log("Analytics not initialized, skipping purchase event.");
    }

    return orderNumber; // Return the human-readable number

  } catch (error) {
    console.error("Error detallado al guardar la orden: ", error);
    throw new Error(`Error al guardar la orden en la base de datos: ${error.message}`);
  }
};

// --- ADDRESS MANAGEMENT --- //

/**
 * Obtiene las direcciones guardadas de un usuario.
 * @param {string} userId - El ID del usuario.
 * @returns {Array<object>} Una lista de direcciones.
 */
export const fetchUserAddresses = async (userId) => {
    if (!userId) return [];
    try {
        const snapshot = await getDocs(collection(db, 'users', userId, 'addresses'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching user addresses: ", error);
        throw new Error('No se pudieron cargar las direcciones.');
    }
};

/**
 * Guarda o actualiza una dirección de envío para un usuario.
 * @param {string} userId - El ID del usuario.
 * @param {object} addressData - Los datos de la dirección.
 * @param {string|null} addressId - El ID de la dirección si se está actualizando.
 * @returns {string} El ID de la dirección guardada.
 */
export const saveShippingAddress = async (userId, addressData, addressId = null) => {
    if (!userId || !addressData) throw new Error('Datos de dirección inválidos.');
    
    const addressRef = addressId ? doc(db, 'users', userId, 'addresses', addressId) : doc(collection(db, 'users', userId, 'addresses'));
    
    await setDoc(addressRef, addressData, { merge: true });
    
    return addressRef.id;
};
