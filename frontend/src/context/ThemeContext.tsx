import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Load from local storage or default to Urban Blue
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('app-theme') || '#073159';
  });

  useEffect(() => {
    // 1. Save to local storage
    localStorage.setItem('app-theme', themeColor);

    // 2. Update CSS Variable globally
    document.documentElement.style.setProperty('--primary', themeColor);
    
    // 3. Optional: Calculate a lighter shade for backgrounds if needed (simplified here)
    // You can add more logic here to set --primary-light, etc.
  }, [themeColor]);

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};