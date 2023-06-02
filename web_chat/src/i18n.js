import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {}, // We'll initialize this with our translation files later
    fallbackLng: "en", // Use English if the detected language is not available
    interpolation: {
      escapeValue: false // React already does escaping
    }
  });

export default i18n;
