import { createTheme, alpha } from '@mui/material/styles';

const GOLD = '#c9a84c';
const GOLD_LIGHT = '#e8c96b';
const GOLD_DARK = '#8b6914';
const GOLD_BORDER = 'rgba(201, 168, 76, 0.35)';

const CINZEL = '"Cinzel", "Georgia", serif';
const CINZEL_DECO = '"Cinzel Decorative", "Georgia", serif';
const CRIMSON = '"Crimson Text", "Georgia", serif';

const darkPalette = {
  mode: 'dark',
  primary: { main: GOLD, light: GOLD_LIGHT, dark: GOLD_DARK, contrastText: '#0d0d0d' },
  secondary: { main: '#9b3b3b', light: '#c45252', dark: '#6b2020', contrastText: '#fff' },
  background: { default: '#0a0805', paper: '#130f08' },
  // disabled relevé pour le contraste WCAG AA (4.5:1 sur fond #130f08) — audit axe-core du 12/06
  text: { primary: '#e8dcc8', secondary: '#b8a88a', disabled: '#9d8a64' },
  divider: GOLD_BORDER,
  success: { main: '#4a7c4a', light: '#6aad6a', dark: '#2f5c2f' },
  warning: { main: GOLD, light: GOLD_LIGHT, dark: GOLD_DARK },
  error: { main: '#9b3b3b', light: '#c45252', dark: '#6b2020' },
  info: { main: '#4a6fa5', light: '#6a8fc5', dark: '#2a4f85' },
};

const lightPalette = {
  mode: 'light',
  primary: { main: GOLD_DARK, light: GOLD, dark: '#5a4010', contrastText: '#fff' },
  secondary: { main: '#7a2a2a', light: '#a04040', dark: '#501a1a', contrastText: '#fff' },
  background: { default: '#f4ede0', paper: '#fdf7ec' },
  text: { primary: '#1a1005', secondary: '#5a4825', disabled: '#a08c6e' },
  divider: 'rgba(139, 105, 20, 0.25)',
  success: { main: '#3a6c3a', light: '#5a9c5a', dark: '#1f4c1f' },
  warning: { main: GOLD_DARK, light: GOLD, dark: '#5a4010' },
  error: { main: '#8b2020', light: '#b04040', dark: '#5a1010' },
  info: { main: '#3a5a95', light: '#5a7ab5', dark: '#1a3a75' },
};

const buildTheme = (mode) => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  const isDark = mode === 'dark';

  return createTheme({
    palette,
    typography: {
      fontFamily: CRIMSON,
      h1: { fontFamily: CINZEL_DECO, fontWeight: 700, fontSize: '2.4rem', letterSpacing: '0.04em' },
      h2: { fontFamily: CINZEL, fontWeight: 700, fontSize: '2rem', letterSpacing: '0.03em' },
      h3: { fontFamily: CINZEL, fontWeight: 600, fontSize: '1.75rem', letterSpacing: '0.02em' },
      h4: { fontFamily: CINZEL, fontWeight: 600, fontSize: '1.5rem', letterSpacing: '0.02em' },
      h5: { fontFamily: CINZEL, fontWeight: 600, fontSize: '1.2rem', letterSpacing: '0.01em' },
      h6: { fontFamily: CINZEL, fontWeight: 600, fontSize: '1rem', letterSpacing: '0.01em' },
      body1: { fontFamily: CRIMSON, fontSize: '1.05rem', lineHeight: 1.7 },
      body2: { fontFamily: CRIMSON, fontSize: '0.95rem', lineHeight: 1.6 },
      button: { fontFamily: CINZEL, fontWeight: 600, textTransform: 'none', letterSpacing: '0.06em', fontSize: '0.85rem' },
      caption: { fontFamily: CRIMSON, fontSize: '0.82rem', letterSpacing: '0.04em' },
      overline: { fontFamily: CINZEL, fontSize: '0.72rem', letterSpacing: '0.12em' },
    },
    shape: { borderRadius: 4 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? 'radial-gradient(ellipse at 20% 50%, rgba(40,28,5,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(30,20,5,0.3) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%)',
            scrollbarWidth: 'thin',
            scrollbarColor: `${GOLD_DARK} ${isDark ? '#1a1309' : '#e8dcc8'}`,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': { background: isDark ? '#1a1309' : '#e8dcc8' },
            '&::-webkit-scrollbar-thumb': { background: GOLD_DARK, borderRadius: 4 },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? 'linear-gradient(180deg, #0d0b06 0%, #1a1309 100%)'
              : 'linear-gradient(180deg, #2d1a00 0%, #3d2a08 100%)',
            borderBottom: `1px solid ${GOLD_BORDER}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.6), 0 1px 0 ${GOLD_BORDER}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark
              ? 'linear-gradient(145deg, #1c1508 0%, #221a0a 100%)'
              : 'linear-gradient(145deg, #fdf7ec 0%, #f7f0e2 100%)',
            border: `1px solid ${GOLD_BORDER}`,
            borderRadius: 6,
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.1)'
              : '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(201,168,76,0.2)',
            transition: 'all 0.25s ease',
            '&:hover': {
              borderColor: alpha(GOLD, 0.6),
              boxShadow: isDark
                ? '0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(201,168,76,0.08)'
                : '0 8px 24px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 4, fontFamily: CINZEL, letterSpacing: '0.06em', padding: '10px 24px', transition: 'all 0.2s ease' },
          contained: {
            background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
            color: '#0d0d0d',
            border: `1px solid ${GOLD}`,
            boxShadow: `0 2px 8px rgba(139,105,20,0.4)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
              boxShadow: `0 4px 16px rgba(201,168,76,0.5)`,
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
          outlined: {
            borderColor: GOLD_BORDER,
            color: isDark ? GOLD : GOLD_DARK,
            '&:hover': { borderColor: GOLD, backgroundColor: alpha(GOLD, 0.08) },
          },
          text: { color: isDark ? GOLD : GOLD_DARK, '&:hover': { backgroundColor: alpha(GOLD, 0.08) } },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              fontFamily: CRIMSON,
              fontSize: '1.05rem',
              '& fieldset': { borderColor: GOLD_BORDER },
              '&:hover fieldset': { borderColor: alpha(GOLD, 0.6) },
              '&.Mui-focused fieldset': { borderColor: GOLD, borderWidth: 1 },
            },
            '& .MuiInputLabel-root': {
              fontFamily: CINZEL,
              fontSize: '0.85rem',
              letterSpacing: '0.04em',
              '&.Mui-focused': { color: GOLD },
            },
            // L'encoche du contour (légende cachée qui calcule sa largeur) hérite
            // par défaut la police de MuiOutlinedInput-root (Crimson) au lieu de
            // celle du label (Cinzel + letter-spacing, plus large) — l'écart de
            // largeur grandit avec le texte, jusqu'à faire déborder le label
            // hors de l'encoche pour les libellés longs. On aligne les deux.
            '& .MuiOutlinedInput-notchedOutline legend': {
              fontFamily: CINZEL,
              letterSpacing: '0.04em',
              fontSize: '0.6375rem', // 0.85rem (label) × 0.75 (facteur de réduction MUI au focus)
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? '#0d0b06' : '#2d1a00',
            borderRight: `1px solid ${GOLD_BORDER}`,
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: GOLD_BORDER } } },
      MuiChip: {
        styleOverrides: {
          root: { fontFamily: CINZEL, fontSize: '0.75rem', letterSpacing: '0.05em', borderColor: GOLD_BORDER },
          filled: { backgroundColor: alpha(GOLD, 0.15), color: isDark ? GOLD : GOLD_DARK },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { fontFamily: CRIMSON, fontSize: '1rem', borderRadius: 4, border: '1px solid' },
          standardError: {
            borderColor: 'rgba(155,59,59,0.4)',
            backgroundColor: isDark ? 'rgba(60,15,15,0.8)' : 'rgba(180,60,60,0.08)',
          },
          standardSuccess: {
            borderColor: 'rgba(74,124,74,0.4)',
            backgroundColor: isDark ? 'rgba(15,45,15,0.8)' : 'rgba(60,120,60,0.08)',
          },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${GOLD_BORDER}` } } },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontFamily: CINZEL,
              fontSize: '0.8rem',
              letterSpacing: '0.06em',
              color: isDark ? GOLD : GOLD_DARK,
              borderBottom: `1px solid ${GOLD_BORDER}`,
              backgroundColor: isDark ? '#1a1309' : '#f0e8d4',
            },
          },
        },
      },
      MuiTableRow: { styleOverrides: { root: { '&:hover': { backgroundColor: alpha(GOLD, 0.05) } } } },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: isDark ? alpha(GOLD, 0.8) : GOLD_DARK,
            '&:hover': { backgroundColor: alpha(GOLD, 0.1), color: GOLD },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: CINZEL,
            fontSize: '0.85rem',
            letterSpacing: '0.03em',
            '&:hover': { backgroundColor: alpha(GOLD, 0.1) },
            '&.Mui-selected': { backgroundColor: alpha(GOLD, 0.15), '&:hover': { backgroundColor: alpha(GOLD, 0.2) } },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { backgroundColor: alpha(GOLD, 0.15) },
          bar: { backgroundColor: GOLD },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: CINZEL,
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            backgroundColor: isDark ? '#1c1508' : '#2d1a00',
            border: `1px solid ${GOLD_BORDER}`,
          },
        },
      },
    },
  });
};

export const darkTheme = buildTheme('dark');
export const lightTheme = buildTheme('light');
export default darkTheme;
