import { useTheme } from '@mui/material';

/**
 * Couleurs vives (vert/rouge/bleu/orange) utilisées pour les stats (profit,
 * morts, prix...) partout dans l'app — choisies pour un fond sombre
 * (contraste 6.8-11:1). Sur fond clair, ces mêmes teintes tombent à 1.6-2.6:1
 * (illisibles, sous le seuil AA de 3:1) : on bascule sur une variante plus
 * sombre, dérivée du thème quand elle existe.
 */
export function useAccentColors() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    return {
        green: isDark ? '#4ade80' : theme.palette.success.dark,
        red: isDark ? '#f87171' : theme.palette.error.dark,
        blue: isDark ? '#60a5fa' : theme.palette.info.dark,
        blueLight: isDark ? '#93c5fd' : theme.palette.info.dark,
        orange: isDark ? '#f97316' : '#9a3412',
    };
}
