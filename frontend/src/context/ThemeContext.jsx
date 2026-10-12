import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEME_PALETTES = {
  royalGold: {
    id: 'royalGold',
    name: '24K Sovereign Gold',
    label: 'Deep Obsidian Black & 24K Polished Gold',
    primary: '#d4af37',
    primaryDark: '#b38728',
    primaryLight: '#fde68a',
    accent: '#f59e0b',
    bgDark: '#070709',
    cardDark: '#0e0e13',
    bgTint: 'rgba(212, 175, 55, 0.08)',
    borderGlow: 'rgba(212, 175, 55, 0.35)',
    plateGradient: 'linear-gradient(135deg, #d4af37, #fef3c7, #aa820a)',
    plateColor: '#121212',
    gradientText: 'from-amber-300 via-yellow-200 to-amber-500',
    blobColors: ['#d4af37', '#b38728', '#f59e0b'],
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  },
  antiqueBrass: {
    id: 'antiqueBrass',
    name: 'Heritage Antique Brass',
    label: 'Hand-Rubbed Vintage Brass & Obsidian',
    primary: '#e0a96d',
    primaryDark: '#b87333',
    primaryLight: '#fae3c6',
    accent: '#d97706',
    bgDark: '#080706',
    cardDark: '#12100d',
    bgTint: 'rgba(224, 169, 109, 0.08)',
    borderGlow: 'rgba(224, 169, 109, 0.35)',
    plateGradient: 'linear-gradient(135deg, #c5832b, #f3cf98, #8c4a10)',
    plateColor: '#120d06',
    gradientText: 'from-amber-200 via-orange-200 to-amber-600',
    blobColors: ['#e0a96d', '#b87333', '#c5832b'],
    badgeClass: 'bg-amber-600/15 text-amber-200 border-amber-600/40',
  },
  champagneGold: {
    id: 'champagneGold',
    name: 'Champagne White Gold',
    label: 'Subtle Platinum Champagne & Jet Black',
    primary: '#f3e5ab',
    primaryDark: '#c2b280',
    primaryLight: '#fffdf0',
    accent: '#e6c280',
    bgDark: '#070708',
    cardDark: '#0d0d10',
    bgTint: 'rgba(243, 229, 171, 0.08)',
    borderGlow: 'rgba(243, 229, 171, 0.35)',
    plateGradient: 'linear-gradient(135deg, #e6d79e, #ffffff, #b8a66d)',
    plateColor: '#0a0a0c',
    gradientText: 'from-yellow-100 via-amber-200 to-yellow-400',
    blobColors: ['#f3e5ab', '#c2b280', '#e6c280'],
    badgeClass: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/40',
  },
  obsidianFoil: {
    id: 'obsidianFoil',
    name: 'Midnight Black & Gold Foil',
    label: 'Pure Obsidian Velvet with Heavy 24K Inlay',
    primary: '#fbbf24',
    primaryDark: '#92400e',
    primaryLight: '#fef08a',
    accent: '#d97706',
    bgDark: '#050506',
    cardDark: '#0a0a0d',
    bgTint: 'rgba(251, 191, 36, 0.08)',
    borderGlow: 'rgba(251, 191, 36, 0.4)',
    plateGradient: 'linear-gradient(135deg, #18181b, #09090b, #27272a)',
    plateColor: '#fbbf24',
    gradientText: 'from-amber-400 via-yellow-300 to-amber-500',
    blobColors: ['#fbbf24', '#d97706', '#78350f'],
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('shreeji_gold_theme');
      return saved && THEME_PALETTES[saved] ? saved : 'royalGold';
    } catch {
      return 'royalGold';
    }
  });

  const theme = THEME_PALETTES[currentTheme] || THEME_PALETTES.royalGold;

  useEffect(() => {
    localStorage.setItem('shreeji_gold_theme', currentTheme);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-dark', theme.primaryDark);
    root.style.setProperty('--color-primary-light', theme.primaryLight);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-bg-tint', theme.bgTint);
    root.style.setProperty('--color-border-glow', theme.borderGlow);
    root.style.setProperty('--color-bg-dark', theme.bgDark);
  }, [currentTheme, theme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, theme, themes: THEME_PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
