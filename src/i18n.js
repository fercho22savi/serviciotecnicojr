import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly to bundle them with the app
import translationEN from '../public/locales/en/translation.json';
import translationES from '../public/locales/es/translation.json';

// Prepare the resources object for i18next
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources, // Pass the bundled translations
    fallbackLng: 'es',
    debug: true, // Enable debug mode

    // Configure the language detector
    detection: {
      order: ['localStorage', 'navigator'], // Check localStorage first, then the browser language
      caches: ['localStorage'], // Save the chosen language to localStorage
    },

    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
