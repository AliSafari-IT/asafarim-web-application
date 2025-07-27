import { useAuth } from '../context/AuthContext';
import { useTheme } from '@asafarim/react-themes';

export const useUserPreferences = () => {
  const { preferences, getPreferences, updatePreferences } = useAuth();
  const { currentTheme, setTheme } = useTheme();

  const applyThemePreference = async () => {
    if (preferences?.theme && preferences.theme !== 'auto') {
      // Cast to the Theme type expected by your package
      setTheme(preferences.theme as any);
    } else if (preferences?.theme === 'auto') {
      // Apply system theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme((systemPrefersDark ? 'dark' : 'light') as any);
    }
  };

  const updateThemePreference = async (newTheme: 'light' | 'dark' | 'auto') => {
    const result = await updatePreferences({ theme: newTheme });
    if (result?.success) {
      if (newTheme === 'auto') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme((systemPrefersDark ? 'dark' : 'light') as any);
      } else {
        // Cast to the Theme type expected by your package
        setTheme(newTheme as any);
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
    currentTheme,
  };
};
