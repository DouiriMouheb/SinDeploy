// src/contexts/ThemeContext.jsx - Theme context with light mode as default
import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always use light mode
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
  }, []);

  const value = {
    isDarkMode: false,
    theme: "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
