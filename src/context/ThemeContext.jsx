import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Crear el contexto
export const ThemeContext = createContext();

// Hook para consumir el contexto
export const useTheme = () => React.useContext(ThemeContext);

// Proveedor del tema
export const ThemeProvider = ({ children }) => {
  // Intenta obtener el modo desde localStorage, o usa 'light' como predeterminado
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem('themeMode');
    return storedMode || 'light';
  });

  // Guardar el modo en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Función para cambiar el tema
  const toggleTheme = (newMode) => {
    if (newMode) {
      setMode(newMode);
    } else {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    }
  };

  // Crear el tema de MUI basado en el modo actual
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        // Paleta para el modo claro
        primary: {
          main: '#1976d2',
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
      } : {
        // Paleta para el modo oscuro
        primary: {
          main: '#90caf9',
        },
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      }),
    },
  }), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
