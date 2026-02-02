import { createContext, useContext, useEffect, useState } from "react";
import { switchTheme } from "react-theme-switch-animation";

/**
 * @typedef {'light' | 'dark' | 'system'} ThemePreference
 * @typedef {'light' | 'dark'} ResolvedTheme
 */

/**
 * @typedef {Object} ThemeContextValue
 * @property {ThemePreference} preference
 * @property {ResolvedTheme} theme
 * @property {(preference: ThemePreference) => void} setPreference
 */

const ThemeContext = createContext(
  /** @type {ThemeContextValue | null} */ (null),
);

const STORAGE_KEY = "catalogy-theme";

/**
 * Get initial theme preference from localStorage or default to 'system'
 * @returns {ThemePreference}
 */
function getInitialPreference() {
  if (typeof window === "undefined") return "system";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

/**
 * Resolve system preference to actual theme
 * @returns {ResolvedTheme}
 */
function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Theme provider component
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(getInitialPreference);
  const [resolvedTheme, setResolvedTheme] = useState(
    /** @type {ResolvedTheme} */ ("light"),
  );

  // Resolve theme based on preference
  useEffect(() => {
    const resolved = preference === "system" ? getSystemTheme() : preference;
    setResolvedTheme(resolved);

    // Apply theme class to document
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
  }, [preference]);

  // Listen for system theme changes when preference is 'system'
  useEffect(() => {
    if (preference !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const newTheme = e.matches ? "dark" : "light";
      setResolvedTheme(newTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  /**
   * Set theme preference and persist to localStorage with animation
   * @param {ThemePreference} newPreference
   */
  const setPreference = (newPreference) => {
    const newResolvedTheme =
      newPreference === "system" ? getSystemTheme() : newPreference;

    // Animate theme transition
    switchTheme({
      theme: newResolvedTheme,
      transitionDuration: 300,
      reverse: newResolvedTheme === "light", // Reverse animation when going to light mode
    });

    setPreferenceState(newPreference);
    localStorage.setItem(STORAGE_KEY, newPreference);
  };

  return (
    <ThemeContext.Provider
      value={{
        preference,
        theme: resolvedTheme,
        setPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @returns {ThemeContextValue}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
