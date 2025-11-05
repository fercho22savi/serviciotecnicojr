const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// --- Configuration ---
const SOURCE_LANG_FILE = path.join(__dirname, 'src', 'locales', 'en', 'translation.json');
const TARGET_LANG_FILE = path.join(__dirname, 'src', 'locales', 'es', 'translation.json');
const TARGET_LANG_CODE = 'es'; // Spanish
const FUNCTION_URL = 'https://us-central1-serviciotecnicojr-187663-9a086.cloudfunctions.net/translateText'; // Corrected URL

// --- Helper Functions ---

/**
 * Flattens a nested JSON object into a single-level object with dot-separated keys.
 * e.g., { a: { b: 'c' } } => { 'a.b': 'c' }
 */
const flattenObject = (obj, parentKey = '', result = {}) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
};

/**
 * Unflattens a single-level object with dot-separated keys back into a nested JSON object.
 * e.g., { 'a.b': 'c' } => { a: { b: 'c' } }
 */
const unflattenObject = (obj) => {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const keys = key.split('.');
      keys.reduce((acc, currentKey, index) => {
        if (index === keys.length - 1) {
          acc[currentKey] = obj[key];
        } else {
          acc[currentKey] = acc[currentKey] || {};
        }
        return acc[currentKey];
      }, result);
    }
  }
  return result;
};

/**
 * Translates a single string value using the Cloud Function.
 */
const translateValue = async (value) => {
  // Don't translate placeholders like {{variable}}
  if (typeof value !== 'string' || /{{.*}}/.test(value) || !value.trim()) {
    return value;
  }
  try {
    console.log(`Translating: "${value}"...`);
    const response = await axios.post(FUNCTION_URL, {
      text: value,
      targetLang: TARGET_LANG_CODE,
    });
    const translatedText = response.data.translation;
    console.log(`   -> Got: "${translatedText}"`);
    return translatedText;
  } catch (error) {
    console.error(`Error translating "${value}":`, error.response ? error.response.data : error.message);
    return value; // Return original value on error
  }
};

// --- Main Execution ---

const main = async () => {
  try {
    console.log('Starting translation process...');

    // 1. Read the source language file
    const sourceContent = await fs.readFile(SOURCE_LANG_FILE, 'utf8');
    const sourceData = JSON.parse(sourceContent);

    // 2. Flatten the JSON structure to handle nested keys
    const flatSource = flattenObject(sourceData);
    const translatedData = {};

    // 3. Iterate and translate each value
    for (const key in flatSource) {
      translatedData[key] = await translateValue(flatSource[key]);
    }

    // 4. Unflatten the translated data back to its original structure
    const finalJson = unflattenObject(translatedData);

    // 5. Write the new translated file
    await fs.writeFile(TARGET_LANG_FILE, JSON.stringify(finalJson, null, 4), 'utf8');

    console.log(`\nTranslation complete! File saved to ${TARGET_LANG_FILE}`);

  } catch (error) {
    console.error('\nAn error occurred during the translation process:', error);
  }
};

main();
