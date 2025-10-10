import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import "react-datepicker/dist/react-datepicker.css";
import './i18n'; // <-- Importar la configuración de i18next

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
