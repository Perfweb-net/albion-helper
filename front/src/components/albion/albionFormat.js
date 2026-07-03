// Helpers de formatage partagés par les vues PvP (kills, morts, batailles).

// Couleurs de qualité Albion (1 Normal → 5 Chef-d'œuvre), standard killboard.
export const QUALITY_COLORS = {
    1: 'transparent',
    2: '#4eea4e',
    3: '#2db6f5',
    4: '#d35eff',
    5: '#ffd700',
};

export const QUALITY_LABELS = {
    1: 'Normale', 2: 'Bonne', 3: 'Excellente', 4: 'Exceptionnelle', 5: "Chef-d'œuvre",
};

// 1 234 567 → "1.2M", 12 345 → "12.3k"
export const fmtFame = (n) => {
    if (n === null || n === undefined) return '—';
    const v = Number(n);
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
    return v.toLocaleString('fr-FR');
};

// ISO → "13/06 23:25"
export const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
};

// "heure" courte pour les listes denses → "23:25"
export const fmtTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// Tier lisible depuis un uniqueName (T7_2H_CLAYMORE@2 → "T7.2")
export const tierFromType = (type) => {
    if (!type) return '';
    const m = type.match(/^T(\d)/);
    const ench = type.match(/@(\d)/);
    if (!m) return '';
    return `T${m[1]}${ench ? `.${ench[1]}` : ''}`;
};
