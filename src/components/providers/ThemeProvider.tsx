"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  systemTheme: "light" | "dark";
  resolvedTheme: "light" | "dark";
  themes: string[];
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  systemTheme: "light",
  resolvedTheme: "light",
  themes: ["light", "dark", "system"],
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  // Read stored theme on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setThemeState(stored);
      }
    } catch {
      // Ignore localStorage access errors
    }

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mql.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [storageKey]);

  // Apply theme to document element
  const resolvedTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system" && enableSystem) {
      return systemTheme;
    }
    return theme === "dark" ? "dark" : "light";
  }, [theme, enableSystem, systemTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (attribute === "class") {
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }
  }, [resolvedTheme, attribute]);

  const setTheme = useCallback(
    (newTheme: string) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Ignore localStorage access errors
      }
    },
    [storageKey]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      systemTheme,
      resolvedTheme,
      themes: ["light", "dark", "system"],
    }),
    [theme, setTheme, systemTheme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
