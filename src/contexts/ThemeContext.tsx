import React, { createContext, useContext, useEffect, useState } from 'react';
import { useHabitStore } from '../stores/habitStore';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, updatePreferences } = useHabitStore();
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const getEffectiveTheme = (): 'light' | 'dark' => {
      // If no theme is set in preferences, use system preference (auto behavior)
      if (!preferences.theme) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return preferences.theme === 'dark' ? 'dark' : 'light';
    };

    const updateEffectiveTheme = () => {
      const newTheme = getEffectiveTheme();
      setEffectiveTheme(newTheme);
      
      // Apply theme to document
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes only if no manual theme is set
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!preferences.theme) {
        updateEffectiveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.theme]);

  const setTheme = async (theme: Theme) => {
    await updatePreferences({ theme });
  };

  return (
    <ThemeContext.Provider value={{ theme: preferences.theme || 'light', effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};