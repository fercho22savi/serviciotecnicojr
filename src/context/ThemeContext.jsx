import React, { createContext, useState, useMemo, useEffect, useContext } from 'react';
import { useMediaQuery } from '@mui/material';

// 1. Create the context for theme state management
export const ThemeContext = createContext();

// 2. Custom hook to easily consume the theme state and functions
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};

// 3. Create the provider component that will ONLY manage the state
export const ThemeContextProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // State logic to determine the current mode (light/dark)
  const [mode, setMode] = useState(() => {
    try {
        const savedMode = localStorage.getItem('themeMode');
        return savedMode ? savedMode : (prefersDarkMode ? 'dark' : 'light');
    } catch (error) {
        console.error("Could not access localStorage. Defaulting to system preference.");
        return prefersDarkMode ? 'dark' : 'light';
    }
  });

  // Effect to save the theme mode to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('themeMode', mode);
    } catch (error) {
        console.error("Could not access localStorage to save theme mode.");
    }
  }, [mode]);

  // Function to toggle the theme
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // The value provided by the context: the current mode and the function to change it.
  // useMemo ensures this object doesn't get recreated on every render.
  const value = useMemo(() => ({ mode, toggleTheme, setMode }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
