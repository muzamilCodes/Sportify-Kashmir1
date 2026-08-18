"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            registration.addEventListener("updatefound", () => {
              const worker = registration.installing;
              worker?.addEventListener("statechange", () => {
                if (worker.state === "installed" && navigator.serviceWorker.controller) {
                  window.dispatchEvent(new Event("pwa-update-available"));
                }
              });
            });
          })
          .catch(() => undefined);
      };
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
