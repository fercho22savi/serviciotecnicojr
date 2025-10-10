import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  // Carga las traducciones desde la carpeta `public/locales`
  .use(HttpApi)
  // Detecta el idioma del navegador
  .use(LanguageDetector)
  // Pasa i18n a react-i18next
  .use(initReactI18next)
  // Configuración inicial
  .init({
    // Idiomas soportados
    supportedLngs: ['en'],
    // Idioma por defecto
    fallbackLng: 'en',
    // Opciones para la detección de idioma
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    // Dónde encontrar los archivos de traducción
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    react: {
        useSuspense: false, //  <-- Evita errores de Suspense en la carga inicial
    }
  });

export default i18n;
