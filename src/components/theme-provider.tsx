import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

import {
  ColorSchemeContext,
  COLOR_SCHEME_KEY,
  getInitialScheme,
} from '@/components/theme/color-scheme-context';
import type { ColorScheme } from '@/components/theme/color-scheme-context';

const ColorSchemeProvider = ({
  children,
  defaultScheme,
}: {
  children: ReactNode;
  defaultScheme: ColorScheme;
}) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() =>
    getInitialScheme(defaultScheme)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-color', colorScheme);
    window.localStorage.setItem(COLOR_SCHEME_KEY, colorScheme);
  }, [colorScheme]);

  const value = useMemo(() => ({ colorScheme, setColorScheme }), [colorScheme]);

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export function ThemeProvider({
  children,
  defaultColorScheme = 'azure',
  ...props
}: ThemeProviderProps & { defaultColorScheme?: ColorScheme }) {
  return (
    <NextThemesProvider {...props}>
      <ColorSchemeProvider defaultScheme={defaultColorScheme}>
        {children}
      </ColorSchemeProvider>
    </NextThemesProvider>
  );
}
