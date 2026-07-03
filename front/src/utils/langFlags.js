// Drapeau emoji pour un code de langue (ISO 639-1). Utilisé dans le menu de langue.
// Pour les langues sans pays « évident », on choisit le pays le plus représentatif.
const FLAGS = {
    en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹', pt: '🇧🇷',
    ru: '🇷🇺', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', ar: '🇸🇦', hi: '🇮🇳',
    bn: '🇧🇩', ur: '🇵🇰', id: '🇮🇩', tr: '🇹🇷', vi: '🇻🇳', mr: '🇮🇳',
    te: '🇮🇳', ta: '🇮🇳', pl: '🇵🇱', nl: '🇳🇱', th: '🇹🇭', fa: '🇮🇷',
    uk: '🇺🇦', ro: '🇷🇴', el: '🇬🇷', sv: '🇸🇪', cs: '🇨🇿', hu: '🇭🇺',
};

export const langFlag = (code) => {
    if (!code) return '🏳️';
    const base = code.toLowerCase().split('-')[0];
    return FLAGS[base] || '🏳️';
};
