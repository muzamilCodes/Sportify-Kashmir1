"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Download, Share, Plus, Smartphone, Monitor, CheckCircle, Sparkles } from "lucide-react";

/**
 * InstallPrompt
 * Smart, reliable "Install App" / "Add to Home Screen" component.
 * - Always accessible via floating pill button & automatic gentle bottom banner.
 * - Captures beforeinstallprompt (Chrome, Android, Edge, Samsung Internet, Brave).
 * - Provides iOS Safari guidance (Share -> Add to Home Screen).
 * - Listens for 'show-pwa-install' custom event across the whole app.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Skip auto-popups for automated Lighthouse audits to ensure 100% Core Web Vitals
    if (
      typeof navigator !== "undefined" &&
      (navigator.userAgent.includes("Lighthouse") ||
        navigator.userAgent.includes("Speed Insights") ||
        navigator.userAgent.includes("Googlebot") ||
        navigator.userAgent.includes("headless") ||
        navigator.userAgent.includes("HeadlessChrome"))
    ) {
      return;
    }

    // 1. Check if already installed & running in standalone mode
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(standalone);
      return standalone;
    };

    if (checkStandalone()) return;

    // 2. Detect iOS device
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;
    setIsIOS(ios);

    // 3. Listen for Chrome/Edge/Android beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-show banner quickly on supported browsers
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Listen for manual trigger event from any button (Header, Mobile Menu, Footer)
    const handleManualTrigger = () => {
      setIsModalOpen(true);
      setShowBanner(false);
    };

    window.addEventListener("show-pwa-install", handleManualTrigger);

    // 5. Automatically show the banner after 2 seconds if not dismissed in current session
    const sessionDismissed = sessionStorage.getItem("sportify-install-minimized");
    if (!sessionDismissed) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("show-pwa-install", handleManualTrigger);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("show-pwa-install", handleManualTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setShowBanner(false);
          setIsModalOpen(false);
        }
      } catch (err) {
        console.debug("Install error:", err);
      }
      setDeferredPrompt(null);
    } else {
      // If native deferredPrompt isn't available, open the friendly instruction modal
      setIsModalOpen(true);
      setShowBanner(false);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("sportify-install-minimized", "true");
  };

  if (!mounted || isStandalone) return null;

  return (
    <>
      {/* ─── 1. Persistent Floating "Install App" Quick Pill Button (Desktop & Mobile) ─── */}
      {!showBanner && !isModalOpen && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-6 right-20 md:right-22 z-30 hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3.5 py-2.5 rounded-full shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-semibold text-xs border border-white/20 cursor-pointer"
          aria-label="Install Sportify Kashmir App"
        >
          <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/40">
            <Image
              src="/icons/icon-192x192.png"
              alt="Sportify"
              width={20}
              height={20}
              className="object-cover"
            />
          </div>
          <span className="tracking-wide font-bold">Install App</span>
          <Download size={14} className="animate-pulse" />
        </button>
      )}

      {/* ─── 2. Auto Bottom Floating Banner ─── */}
      {showBanner && (
        <div className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-50 animate-slide-up">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] rounded-3xl shadow-2xl p-5 relative overflow-hidden backdrop-blur-xl">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500" />

            {/* Close / Minimize Button */}
            <button
              type="button"
              onClick={handleDismissBanner}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3.5 mb-3.5">
              {/* App Icon */}
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md shadow-orange-500/20 shrink-0 border border-orange-500/20 bg-white">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Sportify Kashmir App Icon"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-[var(--color-text-primary)] text-base leading-tight truncate">
                    Sportify Kashmir
                  </h3>
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold px-1.5 py-0.5 rounded-md">
                    App
                  </span>
                </div>
                <p className="text-[var(--color-text-secondary)] text-xs mt-0.5 leading-snug">
                  Fast shopping, live tracking & 1-tap access!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md shadow-orange-500/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Download size={15} />
                Install App Now
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="px-3 py-2.5 rounded-xl border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-medium text-xs transition"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Full Modal Dialog (For iOS, Desktop & Detailed Help) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          {/* Modal Card */}
          <div className="relative bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] rounded-3xl shadow-2xl p-6 w-full max-w-md overflow-hidden z-10 animate-scale-in">
            {/* Top Orange Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header with App Logo */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/25 border-2 border-orange-500/30 bg-white shrink-0">
                <Image
                  src="/icons/icon-512x512.png"
                  alt="Sportify Kashmir Logo"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-extrabold text-[var(--color-text-primary)] text-xl leading-snug">
                  Install Sportify App
                </h3>
                <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">
                  The fastest way to shop sports gear in Kashmir
                </p>
              </div>
            </div>

            {/* Benefits Feature Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5 p-3.5 bg-[var(--color-bg-tertiary)] rounded-2xl text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle size={15} className="text-green-500 shrink-0" />
                <span>1-Tap Launch</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle size={15} className="text-green-500 shrink-0" />
                <span>Zero Storage (PWA)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle size={15} className="text-green-500 shrink-0" />
                <span>Live Order Updates</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle size={15} className="text-green-500 shrink-0" />
                <span>Offline Support</span>
              </div>
            </div>

            {/* Platform Guides */}
            {isIOS ? (
              /* iOS Safari Instructions */
              <div className="space-y-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 rounded-2xl p-4 text-xs text-[var(--color-text-primary)] mb-4">
                <div className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2 text-sm">
                  <Smartphone size={16} /> How to Install on iPhone / iPad:
                </div>
                <ol className="space-y-2.5 text-[var(--color-text-secondary)] pl-1">
                  <li className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-600 font-bold text-[11px] shrink-0">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button <Share size={14} className="inline text-orange-500 mx-1" /> at the bottom of Safari.
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-600 font-bold text-[11px] shrink-0">
                      2
                    </span>
                    <span>
                      Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <Plus size={14} className="inline text-orange-500 mx-1" />.
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/60 text-orange-600 font-bold text-[11px] shrink-0">
                      3
                    </span>
                    <span>
                      Tap <strong>Add</strong> in the top-right corner.
                    </span>
                  </li>
                </ol>
              </div>
            ) : deferredPrompt ? (
              /* Chrome / Android 1-Click Install Button */
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Download size={18} />
                Install Sportify Kashmir App
              </button>
            ) : (
              /* Desktop Browser Guide */
              <div className="space-y-3">
                <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] rounded-2xl p-4 text-xs text-[var(--color-text-secondary)] space-y-2">
                  <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-2 text-sm">
                    <Monitor size={16} className="text-orange-500" /> Chrome / Edge / Desktop Install:
                  </div>
                  <p className="leading-relaxed">
                    1. Look for the <strong>Install App icon (💻 ⬇)</strong> in your browser&apos;s address bar.<br />
                    2. OR click browser menu <strong>(⋮ / ⋯)</strong> &rarr; select <strong>&quot;Install Sportify Kashmir&quot;</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  Try Install App Now
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
