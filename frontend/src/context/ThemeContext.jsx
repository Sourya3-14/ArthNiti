import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "arthniti_theme";

const getSystemPreference = () => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const ThemeProvider = ({ children }) => {
  // Explicit theme choice: 'system', 'light', or 'dark'
  // Explicit choices have priority over browser default. Default is 'system'.
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        return saved;
      }
    } catch (e) {
      console.warn("Could not read theme from localStorage", e);
    }
    return "system";
  });

  // Resolved actual active appearance: 'light' or 'dark'
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return getSystemPreference();
  });

  const setTheme = (newTheme) => {
    if (!["system", "light", "dark"].includes(newTheme)) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Could not write theme to localStorage", e);
    }
  };

  // Synchronize DOM classes whenever explicit theme or browser media changes
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark) => {
      if (isDark) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
        setResolvedTheme("dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        setResolvedTheme("light");
      }
    };

    if (theme === "dark") {
      applyTheme(true);
      return;
    }

    if (theme === "light") {
      applyTheme(false);
      return;
    }

    // Default 'system' mode: tracks the browser/OS theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(mediaQuery.matches);

    const handleMediaChange = (event) => {
      applyTheme(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
