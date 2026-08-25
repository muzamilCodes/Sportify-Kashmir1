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
      className="fixed bottom-36 md:bottom-22 right-4 md:right-4 z-30 w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-95 animate-scale-in cursor-pointer border border-white/20"
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
