"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * ThemeToggle
 * Animated sun/moon toggle button for switching between light and dark mode.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return <div className={`w-10 h-10 ${className}`} aria-hidden="true" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group ${className}`}
      aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${currentTheme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon — visible in dark mode */}
        <Sun
          size={20}
          className={`absolute inset-0 text-yellow-500 transition-all duration-500 ${
            currentTheme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 rotate-90 scale-0"
          }`}
        />
        {/* Moon icon — visible in light mode */}
        <Moon
          size={20}
          className={`absolute inset-0 text-gray-700 transition-all duration-500 ${
            currentTheme === "light"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
        />
      </div>
    </button>
  );
}
