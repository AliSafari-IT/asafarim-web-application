import { createContext, ReactNode, useState, useEffect } from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('smv-theme') as ThemeType | null;
    return savedTheme || 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('smv-theme', newTheme);
      return newTheme;
    });
  };

  const updateTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('smv-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Apply theme class to body for backward compatibility with existing components
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
