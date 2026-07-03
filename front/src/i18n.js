import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Base de l'API (sert aussi de source pour les langues ajoutées depuis le BO).
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Langues empaquetées au build : servent de repli hors-ligne / au premier rendu.
// Les langues ajoutées via le back office sont chargées dynamiquement depuis l'API.
const loadBundled = () => {
    const context = require.context('./locales', true, /translation\.json$/);
    const resources = {};
    context.keys().forEach((key) => {
        const lang = key.split('/')[1]; // "./fr/translation.json" -> "fr"
        resources[lang] = { translation: context(key) };
    });
    return resources;
};

const bundled = loadBundled();

const labelFor = (code) => {
    try {
        return new Intl.DisplayNames([code], { type: 'language' }).of(code) || code;
    } catch {
        return code;
    }
};

// Liste empaquetée (synchrone) — repli si l'API est indisponible.
export const availableLanguages = Object.keys(bundled).map((code) => ({
    code,
    label: labelFor(code),
}));

/**
 * Liste complète des langues, y compris celles créées dans le back office.
 * Retombe sur la liste empaquetée en cas d'échec réseau.
 */
export const fetchAvailableLanguages = async () => {
    try {
        const res = await fetch(`${API_BASE}/locales`);
        if (!res.ok) throw new Error('locales fetch failed');
        const data = await res.json();
        return (data.locales || []).map((l) => ({
            code: l.code,
            label: labelFor(l.code),
            reference: !!l.reference,
        }));
    } catch {
        return availableLanguages;
    }
};

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: bundled,
        // Combine les ressources empaquetées (fr/en) et le backend HTTP pour les autres.
        partialBundledLanguages: true,
        fallbackLng: 'fr',
        // Une valeur vide (clé non encore traduite) est traitée comme manquante -> repli sur fr.
        returnEmptyString: false,
        interpolation: { escapeValue: false },
        backend: {
            loadPath: `${API_BASE}/locales/{{lng}}`,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nLang',
        },
    });

export default i18n;
