import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import np from "./locales/np/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      np: { translation: np },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "np"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"], // saves language automatically
      lookupLocalStorage: "app_lang", // key name
    },
  });

export default i18n;
