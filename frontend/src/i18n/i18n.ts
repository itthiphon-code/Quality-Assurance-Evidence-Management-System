import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import th from "./locales/th.json";

export const SUPPORTED_LANGUAGES = ["th", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      th: { translation: th },
      en: { translation: en },
    },
    lng: localStorage.getItem("qaems-lang") ?? "th",
    fallbackLng: "th",
    supportedLngs: SUPPORTED_LANGUAGES,
    detection: {
      // ค่าเริ่มต้นต้องเป็นไทยเสมอ ไม่ว่าภาษาของเบราว์เซอร์/OS จะเป็นอะไร
      // ใช้ค่าที่ผู้ใช้เลือกไว้ (localStorage) เท่านั้น ไม่ตรวจจับจาก navigator
      order: ["localStorage"],
      lookupLocalStorage: "qaems-lang",
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

document.documentElement.lang = i18n.language?.startsWith("en") ? "en" : "th";

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng.startsWith("en") ? "en" : "th";
});

export default i18n;
