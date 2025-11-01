import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const CustomThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

export const useCustomTheme = () => useContext(CustomThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#2C3E50' },
                secondary: { main: '#E67E22' },
                background: { default: '#F4F6F8', paper: '#FFFFFF' },
                text: { primary: '#34495E', secondary: '#5D6D7E' },
              }
            : {
                primary: { main: '#5DADE2' },
                secondary: { main: '#F5B041' },
                background: { default: '#1C2833', paper: '#283747' },
                text: { primary: '#EAECEE', secondary: '#ABB2B9' },
              }),
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: '600' },
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
                        borderRadius: '12px',
                    }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: { borderRadius: '8px' }
                }
            }
        }
      }),
    [mode]
  );

  const contextValue = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <CustomThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </CustomThemeContext.Provider>
  );
};
