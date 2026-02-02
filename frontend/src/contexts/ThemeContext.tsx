import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light original' | 'dark original';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'nutrition-tracker-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get theme from localStorage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (saved === 'light original' || saved === 'dark original') {
        return saved;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark original';
      }
    }
    return 'light original';
  });

  const isDark = theme === 'dark original';

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement;
    
    // Remove dark theme class
    root.classList.remove('dark-theme');
    
    // Add dark theme class if dark mode
    if (theme === 'dark original') {
      root.classList.add('dark-theme');
    }
    
    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
