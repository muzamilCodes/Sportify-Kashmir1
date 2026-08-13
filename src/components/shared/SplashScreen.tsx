"use client";

import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

/**
 * SplashScreen
 * Full-screen branded splash shown on first visit per session.
 * Keeps the brand moment lightweight and non-blocking.
 */
export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only show once per session
    const hasShown = sessionStorage.getItem("sportify-splash-shown");
    if (hasShown) return;

    setShow(true);
    sessionStorage.setItem("sportify-splash-shown", "true");

    // Keep it very brief so it never feels like a loading blocker.
    const fadeTimer = setTimeout(() => setFadeOut(true), 120);
    const removeTimer = setTimeout(() => setShow(false), 220);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 transition-opacity duration-300 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      } pointer-events-none`}
      aria-hidden="true"
    >
      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="text-center">
        {/* Logo icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm animate-scale-in">
            <Trophy className="w-14 h-14 text-white drop-shadow-lg" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-ping" style={{ animationDuration: "1.5s" }} />
        </div>

        {/* Brand text */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 animate-fade-in-up">
          Sportify <span className="text-white/90">Kashmir</span>
        </h1>
        <p className="text-white/70 text-lg font-medium animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          Sports Excellence Delivered
        </p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-white rounded-full animate-bounce-soft"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
