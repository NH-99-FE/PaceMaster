import { createContext, useContext } from 'react';

export type ColorScheme = 'azure' | 'citrus' | 'slate' | 'rose';

type ColorSchemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

export const COLOR_SCHEME_KEY = 'app-color-scheme';

export const getInitialScheme = (fallback: ColorScheme) => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const stored = window.localStorage.getItem(
    COLOR_SCHEME_KEY
  ) as ColorScheme | null;
  return stored ?? fallback;
};

export const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(
  null
);

export const useColorScheme = () => {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error('useColorScheme must be used within ThemeProvider');
  }
  return ctx;
};
