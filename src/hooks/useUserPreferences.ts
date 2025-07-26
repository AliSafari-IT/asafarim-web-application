import { useAuth } from '../context/AuthContext';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useUserPreferences = () => {
  const { preferences, getPreferences, updatePreferences } = useAuth();
  const { theme, setTheme } = useContext(ThemeContext);

  const applyThemePreference = async () => {
    if (preferences?.theme && preferences.theme !== 'auto') {
      setTheme(preferences.theme);
    } else if (preferences?.theme === 'auto') {
      // Apply system theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  };

  const updateThemePreference = async (newTheme: 'light' | 'dark' | 'auto') => {
    const result = await updatePreferences({ theme: newTheme });
    if (result?.success) {
      if (newTheme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setTheme(newTheme);
      }
    }
    return result;
  };

  return {
    preferences,
    getPreferences,
    updatePreferences,
    applyThemePreference,
    updateThemePreference,
    currentTheme: theme,
  };
};
