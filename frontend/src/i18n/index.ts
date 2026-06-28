/**
 * NusaQuest RPG — i18n Configuration
 * Setup i18next for bilingual support (Indonesian + English).
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import id from "./id.json";
import en from "./en.json";

i18n.use(initReactI18next).init({
  resources: {
    id: { translation: id },
    en: { translation: en },
  },
  lng: "id",
  fallbackLng: "id",
  interpolation: { escapeValue: false },
});

export default i18n;
