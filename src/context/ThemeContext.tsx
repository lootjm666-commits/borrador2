import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'buhue_cyan' | 'fiscalia_navy' | 'grafito_stealth' | 'ministerial_light';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themeConfig: {
    name: string;
    bgMain: string;
    bgCard: string;
    bgHover: string;
    border: string;
    accent: string;
    accentGlow: string;
    textPrimary: string;
    textSecondary: string;
    badgeBg: string;
  };
}

const THEME_CONFIGS: Record<AppTheme, ThemeContextType['themeConfig']> = {
  buhue_cyan: {
    name: 'Táctico BUHUE (Cian Neón)',
    bgMain: '#050914',
    bgCard: '#0A1224',
    bgHover: '#101E38',
    border: '#162744',
    accent: '#00D8F6',
    accentGlow: 'rgba(0, 216, 246, 0.25)',
    textPrimary: '#F0F9FF',
    textSecondary: '#7DD3FC',
    badgeBg: 'rgba(0, 216, 246, 0.12)'
  },
  fiscalia_navy: {
    name: 'Azul Mando Fiscalía',
    bgMain: '#0B132B',
    bgCard: '#111D3E',
    bgHover: '#1C2C59',
    border: '#233870',
    accent: '#3B82F6',
    accentGlow: 'rgba(59, 130, 246, 0.25)',
    textPrimary: '#FFFFFF',
    textSecondary: '#93C5FD',
    badgeBg: 'rgba(59, 130, 246, 0.15)'
  },
  grafito_stealth: {
    name: 'Grafito Inteligencia',
    bgMain: '#0B0D11',
    bgCard: '#13171F',
    bgHover: '#1B212D',
    border: '#242D3D',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    badgeBg: 'rgba(16, 185, 129, 0.15)'
  },
  ministerial_light: {
    name: 'Claro Ministerial (Oficina)',
    bgMain: '#F1F5F9',
    bgCard: '#FFFFFF',
    bgHover: '#E2E8F0',
    border: '#CBD5E1',
    accent: '#0369A1',
    accentGlow: 'rgba(3, 105, 161, 0.2)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    badgeBg: 'rgba(3, 105, 161, 0.1)'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      return (localStorage.getItem('buhue_theme') as AppTheme) || 'buhue_cyan';
    } catch {
      return 'buhue_cyan';
    }
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('buhue_theme', newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig: THEME_CONFIGS[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
