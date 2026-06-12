import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Auto-discover locales: add any new language by dropping its folder in src/locales/
// then run: node scripts/add-language.js <code> <name>
const loadLocales = () => {
    const context = require.context('./locales', true, /translation\.json$/);
    const resources = {};
    context.keys().forEach((key) => {
        // key looks like "./fr/translation.json"
        const lang = key.split('/')[1];
        resources[lang] = { translation: context(key) };
    });
    return resources;
};

const resources = loadLocales();

// Available languages derived automatically from locales directory
export const availableLanguages = Object.keys(resources).map((code) => ({
    code,
    label: new Intl.DisplayNames([code], { type: 'language' }).of(code) || code,
}));

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        supportedLngs: Object.keys(resources),
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nLang',
        },
    });

export default i18n;
