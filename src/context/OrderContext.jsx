
import React, { createContext, useState, useContext, useEffect } from 'react';

const OrderContext = createContext();
const CANCELLATION_WINDOW_HOURS = 3;

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [latestOrder, setLatestOrder] = useState(() => {
    try {
      const savedOrder = localStorage.getItem('latestOrder');
      if (!savedOrder) return null;

      const order = JSON.parse(savedOrder);
      const orderCreationTime = new Date(order.createdAt).getTime();
      const expirationTime = orderCreationTime + (CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000);

      // If the order is already expired on load, clear it
      if (new Date().getTime() > expirationTime) {
        localStorage.removeItem('latestOrder');
        return null;
      }
      return order;
    } catch (error) {
      localStorage.removeItem('latestOrder');
      return null;
    }
  });
  
  const [timeLeft, setTimeLeft] = useState(0);

  const setOrder = (order) => {
    const orderWithTimestamp = { ...order, createdAt: new Date().toISOString() };
    setLatestOrder(orderWithTimestamp);
    localStorage.setItem('latestOrder', JSON.stringify(orderWithTimestamp));
  };

  const clearOrder = () => {
    setLatestOrder(null);
    setTimeLeft(0);
    localStorage.removeItem('latestOrder');
  }

  useEffect(() => {
    if (!latestOrder) {
      return;
    }

    const orderCreationTime = new Date(latestOrder.createdAt).getTime();
    const expirationTime = orderCreationTime + (CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000);

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const remaining = expirationTime - now;

      if (remaining > 0) {
        setTimeLeft(Math.floor(remaining / 1000));
      } else {
        setTimeLeft(0);
        clearInterval(intervalId); // Stop the timer but don't clear the order
      }
    }, 1000);

    // Set initial time immediately
    const initialRemaining = expirationTime - new Date().getTime();
    setTimeLeft(initialRemaining > 0 ? Math.floor(initialRemaining / 1000) : 0);

    return () => clearInterval(intervalId);
  }, [latestOrder]);

  return (
    <OrderContext.Provider value={{ latestOrder, setOrder, timeLeft, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
