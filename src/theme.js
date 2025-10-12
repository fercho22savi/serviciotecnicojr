import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Palette for light mode
          primary: {
            main: '#3d5afe', // A vibrant, modern blue
          },
          secondary: {
            main: '#ff4081', // Pink for accents and interactive elements
          },
          background: {
            default: '#f5f5f5', // Light grey for the background
            paper: '#ffffff',   // White for paper surfaces
          },
          text: {
            primary: '#212121',    // Black for main text
            secondary: '#757575', // Grey for secondary text
          },
        }
      : {
          // Palette for dark mode
          primary: {
            main: '#536dfe', // A slightly lighter blue for dark mode
          },
          secondary: {
            main: '#ff80ab', // A lighter pink for dark mode
          },
          background: {
            default: '#121212', // Standard dark background
            paper: '#1e1e1e',   // Darker paper surface
          },
          text: {
            primary: '#ffffff',    // White for main text
            secondary: '#bdbdbd', // Light grey for secondary text
          },
        }),
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 500, fontSize: '1.25rem' },
    h6: { fontWeight: 500, fontSize: '1.1rem' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
        containedPrimary: {
          color: '#fff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
            : '0px 4px 20px rgba(0, 0, 0, 0.2)', 
        },
      },
    },
  },
});

export default getTheme;