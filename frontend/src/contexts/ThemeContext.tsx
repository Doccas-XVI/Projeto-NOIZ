import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContextValue';

/**
 * Tema dark/light usa Context, não Zustand: é um valor que só a árvore
 * de componentes React precisa (aplica classe no <html>), não é
 * consultado fora de componentes como o token de auth é. Contexto
 * certo pro problema certo.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    localStorage.getItem('noiz-theme') === 'light' ? 'light' : 'dark',
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('noiz-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
