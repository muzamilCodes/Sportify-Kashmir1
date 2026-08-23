"use client";

import { useEffect } from "react";

/**
 * PWARegister
 * Registers the Service Worker (/sw.js) for offline caching and PWA installation.
 * Keeps Service Worker active so browsers detect PWA installability.
 */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          // Check for worker updates
          registration.addEventListener("updatefound", () => {
            const worker = registration.installing;
            worker?.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                window.dispatchEvent(new Event("pwa-update-available"));
              }
            });
          });
        })
        .catch((err) => {
          console.debug("Service Worker registration skipped/failed:", err);
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}

