"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

/**
 * ScrollToTop
 * Floating button that appears after scrolling 300px.
 * Positioned above MobileBottomNav on mobile.
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 animate-scale-in"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
