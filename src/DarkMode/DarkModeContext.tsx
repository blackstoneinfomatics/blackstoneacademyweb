// contexts/DarkModeContext.tsx
'use client';

import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface DarkModeContextProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextProps | undefined>(undefined);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(newMode)); // Persist the state in localStorage
      }
      return newMode;
    });
  }, []); // Empty dependency array, so this function is memoized

  return (
    <DarkModeContext.Provider value={useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode, toggleDarkMode])}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};
