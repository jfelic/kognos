import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useMediaQuery, CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  actualMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load theme preference from localStorage on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('kognos-theme-preference') as ThemeMode;
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setModeState(savedMode);
      }
    } catch (error) {
      console.warn('Failed to load theme preference from localStorage:', error);
    }
  }, []);

  // Save theme preference to localStorage when it changes
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('kognos-theme-preference', newMode);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
  };

  // Determine the actual theme mode to use
  const actualMode: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return mode;
  }, [mode, prefersDarkMode]);

  // Create the MUI theme
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: actualMode,
      },
    });
  }, [actualMode]);

  const contextValue = useMemo(() => ({
    mode,
    setMode,
    actualMode,
  }), [mode, actualMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};