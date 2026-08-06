"use client";

import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";

/**
 * InstallPrompt
 * Smart "Add to Home Screen" / "Install App" banner.
 * - Captures the `beforeinstallprompt` event on supported browsers.
 * - Shows iOS-specific instructions for Safari.
 * - Dismissable with "Don't show again" stored in localStorage.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem("sportify-install-dismissed");
    if (dismissed) return;

    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay showing the prompt for better UX
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Show iOS prompt after a delay
    if (ios) {
      setTimeout(() => setShowPrompt(true), 8000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("sportify-install-dismissed", "true");
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[100] animate-slide-up">
      <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] rounded-2xl shadow-2xl p-5 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Dismiss"
        >
          <X size={16} className="text-[var(--color-text-tertiary)]" />
        </button>

        <div className="flex items-start gap-4">
          {/* App icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Download className="w-7 h-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--color-text-primary)] text-base mb-1">
              Install Sportify Kashmir
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm mb-3 leading-relaxed">
              {isIOS
                ? "Add to your home screen for a native app experience."
                : "Install our app for faster access, offline support, and a native experience."}
            </p>

            {isIOS ? (
              /* iOS instructions */
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)] rounded-xl p-3">
                <Share size={16} className="text-orange-500 flex-shrink-0" />
                <span>
                  Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong>
                </span>
                <Plus size={14} className="text-orange-500 flex-shrink-0" />
              </div>
            ) : (
              /* Chrome/Edge install button */
              <button
                onClick={handleInstall}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Install App
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
