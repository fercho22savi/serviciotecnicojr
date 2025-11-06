import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Header from './Header'; // Cambiado de Navbar a Header
import Footer from './Footer';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const MainLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]); // Initial safe value
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(5000000);

  // Fetch the max price from all products once to set the slider limit
  useEffect(() => {
    const fetchMaxPrice = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const prices = querySnapshot.docs.map(doc => doc.data().price || 0);
      const max = Math.max(...prices);
      if (max > 0) {
        setMaxPrice(max);
        setPriceRange([0, max]); // Initialize slider to full range
      }
    };
    fetchMaxPrice();
  }, []);

  // Data passed down to child routes (ProductsPage)
  const contextValue = {
    searchTerm,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    maxPrice
  };

  return (
    <>
      <Header setSearchTerm={setSearchTerm} /> {/* Cambiado de Navbar a Header */}
      <main>
        <Outlet context={contextValue} /> 
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
