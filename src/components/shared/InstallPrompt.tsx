"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Download,
  Share,
  Plus,
  Smartphone,
  Monitor,
  CheckCircle,
  Sparkles,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Zap,
  BellRing,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "qrcode";

type PlatformType = "android" | "ios" | "desktop" | "qr";

/**
 * InstallPrompt
 * Comprehensive, bulletproof "Install App" / "Add to Home Screen" component.
 * - Captures native beforeinstallprompt instantly from window.__pwaInstallPrompt.
 * - 1-Tap native installation with success celebration & toast notifications.
 * - Multi-platform support: Android, iOS Safari, Desktop Chrome/Edge, In-App browsers.
 * - Generates live QR Code for desktop users to scan & install on their mobile phones.
 * - Direct Copy App Link & WhatsApp / Web Share functionality.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformType>("android");
  const [detectedOS, setDetectedOS] = useState<"android" | "ios" | "desktop" | "inapp">("desktop");
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Skip audits and bots
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

    // 2. Check if already installed & running in standalone mode
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://"));
    setIsStandalone(Boolean(standalone));
    if (standalone) return;

    // 3. Detect Platform & Browser
    const ua = navigator.userAgent || "";
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /Android/i.test(ua);
    const isInApp = /FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Snapchat/i.test(ua);

    setIsInAppBrowser(isInApp);

    if (isInApp) {
      setDetectedOS("inapp");
      setActiveTab(isIosDevice ? "ios" : "android");
    } else if (isIosDevice) {
      setDetectedOS("ios");
      setActiveTab("ios");
    } else if (isAndroidDevice) {
      setDetectedOS("android");
      setActiveTab("android");
    } else {
      setDetectedOS("desktop");
      setActiveTab("desktop");
    }

    // 4. Generate QR Code for Mobile Installation
    try {
      const currentOrigin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "https://sportify-kashmir1.vercel.app";
      QRCode.toDataURL(currentOrigin, {
        width: 220,
        margin: 1.5,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => {});
    } catch (_) {}

    // 5. Check if window.__pwaInstallPrompt was already captured by early script
    if (typeof window !== "undefined" && (window as any).__pwaInstallPrompt) {
      setDeferredPrompt((window as any).__pwaInstallPrompt);
    }

    // 6. Listen for Chrome/Edge/Android beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).__pwaInstallPrompt = e;
      setDeferredPrompt(e);
    };

    const handlePromptAvailable = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail);
      }
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowBanner(false);
      setIsModalOpen(false);
      setDeferredPrompt(null);
      if (typeof window !== "undefined") {
        (window as any).__pwaInstallPrompt = null;
      }
      toast.success("Sportify Kashmir App installed successfully! 🎉");
    };

    const handleManualTrigger = () => {
      setIsModalOpen(true);
      setShowBanner(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("pwa-prompt-available", handlePromptAvailable);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("show-pwa-install", handleManualTrigger);

    // 7. Auto-show bottom banner gently after 2.5 seconds if not dismissed this session
    const sessionDismissed = sessionStorage.getItem("sportify-install-minimized");
    let timer: NodeJS.Timeout | null = null;
    if (!sessionDismissed) {
      timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("pwa-prompt-available", handlePromptAvailable);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("show-pwa-install", handleManualTrigger);
    };
  }, []);

  // Handle 1-Tap Installation Action
  const handleInstallClick = useCallback(async () => {
    const promptEvent =
      deferredPrompt || (typeof window !== "undefined" ? (window as any).__pwaInstallPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          toast.success("Installing Sportify Kashmir App... Welcome! 🎉");
          setShowBanner(false);
          setIsModalOpen(false);
          setDeferredPrompt(null);
          if (typeof window !== "undefined") {
            (window as any).__pwaInstallPrompt = null;
          }

          // Trigger festive confetti
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (_) {}
        } else {
          toast("You can install anytime from the menu or bottom button.", {
            icon: "ℹ️",
          });
        }
      } catch (err) {
        console.debug("PWA prompt error:", err);
        setIsModalOpen(true);
        setShowBanner(false);
      }
    } else {
      // Open the comprehensive installation modal
      setIsModalOpen(true);
      setShowBanner(false);
    }
  }, [deferredPrompt]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem("sportify-install-minimized", "true");
  };

  const handleCopyLink = async () => {
    try {
      const url =
        typeof window !== "undefined" ? window.location.origin : "https://sportify-kashmir1.vercel.app";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("App link copied! Paste in Chrome / Safari to install.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleShareApp = async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://sportify-kashmir1.vercel.app";
    const shareData = {
      title: "Sportify Kashmir — Official App",
      text: "Install the official Sportify Kashmir app for fast shopping, live tracking & 1-tap access!",
      url: origin,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (_) {}
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareData.text}\n${shareData.url}`
      )}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!mounted || isStandalone) return null;

  return (
    <>
      {/* ─── 1. Persistent Floating "Install App" Quick Pill Button (Desktop) ─── */}
      {!showBanner && !isModalOpen && (
        <button
          type="button"
          onClick={() => {
            if (deferredPrompt) {
              handleInstallClick();
            } else {
              setIsModalOpen(true);
            }
          }}
          className="fixed bottom-6 right-20 md:right-22 z-30 hidden md:flex items-center gap-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2.5 rounded-full shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-xs border border-white/25 cursor-pointer group"
          aria-label="Install Sportify Kashmir App"
        >
          <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-white/60 shadow-xs">
            <Image
              src="/icons/icon-192x192.png"
              alt="Sportify"
              width={20}
              height={20}
              className="object-cover"
            />
          </div>
          <span className="tracking-wide">Install App</span>
          <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* ─── 2. Auto Bottom Floating Banner ─── */}
      {showBanner && (
        <div
          className="fixed bottom-20 md:bottom-24 left-3 right-3 md:left-auto md:right-6 md:w-[390px] z-40 animate-slide-up"
          role="region"
          aria-label="App Installation Banner"
        >
          <div className="bg-[var(--color-bg-elevated)] border-2 border-orange-500/40 dark:border-orange-500/30 rounded-3xl shadow-[0_12px_40px_rgba(249,115,22,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-4 relative overflow-hidden backdrop-blur-2xl transition-all">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 animate-pulse" />

            {/* Close / Minimize Button */}
            <button
              type="button"
              onClick={handleDismissBanner}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[var(--color-bg-tertiary)] hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
              aria-label="Close banner"
            >
              <X size={15} />
            </button>

            {/* Content Clickable Header */}
            <div
              onClick={handleInstallClick}
              className="flex items-center gap-3.5 mb-3.5 cursor-pointer select-none group"
            >
              {/* App Icon with Glow */}
              <div className="relative w-13 h-13 rounded-2xl overflow-hidden shadow-md shadow-orange-500/25 shrink-0 border-2 border-orange-500/40 bg-white group-hover:scale-105 transition-transform">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Sportify Kashmir App Icon"
                  width={52}
                  height={52}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[var(--color-text-primary)] text-base leading-tight truncate group-hover:text-orange-500 transition-colors">
                    Sportify Kashmir
                  </h3>
                  <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                    App
                  </span>
                </div>
                <p className="text-[var(--color-text-secondary)] text-xs mt-0.5 font-medium leading-snug">
                  Fast shopping, live tracking & 1-tap access!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border-primary)]">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md shadow-orange-500/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Download size={15} className="animate-bounce" />
                <span>{deferredPrompt ? "Install App (1-Tap)" : "Install App Now"}</span>
              </button>

              <button
                type="button"
                onClick={handleDismissBanner}
                className="px-3.5 py-2.5 rounded-xl border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-semibold text-xs transition cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Full App Installation Center Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in"
          />

          {/* Modal Card */}
          <div className="relative bg-[var(--color-bg-elevated)] border border-[var(--color-border-primary)] rounded-3xl shadow-2xl p-5 sm:p-6 w-full max-w-lg overflow-hidden z-10 animate-scale-in max-h-[92vh] flex flex-col">
            {/* Top Orange Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto pr-1 space-y-4 pt-1">
              {/* Header with App Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20 border-2 border-orange-500/40 bg-white shrink-0">
                  <Image
                    src="/icons/icon-512x512.png"
                    alt="Sportify Kashmir Logo"
                    width={72}
                    height={72}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-[var(--color-text-primary)] text-lg sm:text-xl leading-tight">
                      Sportify Kashmir App
                    </h3>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-xs mt-1 leading-relaxed">
                    Kashmir&apos;s premier sports destination — 1-tap access, live updates & instant launch.
                  </p>
                </div>
              </div>

              {/* 1-Tap Native Install Button (If supported by current browser) */}
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3.5 px-4 rounded-2xl font-black text-sm shadow-xl shadow-orange-500/30 hover:shadow-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <Sparkles size={18} className="animate-spin text-amber-200" />
                  <span>Install Sportify Kashmir App (1-Click)</span>
                  <Download size={18} />
                </button>
              )}

              {/* In-App Browser Warning (e.g. Instagram, Facebook, WhatsApp) */}
              {isInAppBrowser && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <ExternalLink size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">In-App Browser Detected:</strong>
                    Instagram / WhatsApp blocks app installation. Tap the <strong>(⋮ or ⋯)</strong> in the top-right and select <strong>&quot;Open in Chrome / Safari&quot;</strong> to install.
                  </div>
                </div>
              )}

              {/* Platform Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg-tertiary)] rounded-2xl border border-[var(--color-border-primary)] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("android")}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "android"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md font-extrabold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Android</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ios")}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "ios"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md font-extrabold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <Smartphone size={14} />
                  <span>iPhone / iPad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("desktop")}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "desktop"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md font-extrabold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <Monitor size={14} />
                  <span>Desktop</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("qr")}
                  className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "qr"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md font-extrabold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  <QrCode size={14} />
                  <span>Scan QR</span>
                </button>
              </div>

              {/* ─── TAB 1: ANDROID GUIDE ─── */}
              {activeTab === "android" && (
                <div className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl p-4 text-xs animate-fade-in">
                  <div className="font-extrabold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
                    <Smartphone size={16} className="text-orange-500" />
                    How to Install on Android (Chrome / Samsung / Edge):
                  </div>

                  <ol className="space-y-2.5 text-[var(--color-text-secondary)] font-medium pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Tap the <strong>Menu (3 dots ⋮)</strong> in the top-right corner of Google Chrome.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Tap <strong>&quot;Install&quot;</strong>. Sportify Kashmir App icon will appear on your home screen!
                      </span>
                    </li>
                  </ol>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-2 px-3 rounded-xl border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] font-bold text-xs text-[var(--color-text-primary)] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>{copied ? "Copied!" : "Copy App Link"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareApp}
                      className="flex-1 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Share size={14} />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAB 2: iOS GUIDE ─── */}
              {activeTab === "ios" && (
                <div className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl p-4 text-xs animate-fade-in">
                  <div className="font-extrabold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
                    <Smartphone size={16} className="text-orange-500" />
                    How to Install on iPhone / iPad (Safari):
                  </div>

                  <ol className="space-y-2.5 text-[var(--color-text-secondary)] font-medium pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Open in <strong>Safari</strong> and tap the <strong>Share</strong> button <Share size={14} className="inline text-orange-500 mx-1" /> at the bottom toolbar.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <Plus size={14} className="inline text-orange-500 mx-1" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Tap <strong>&quot;Add&quot;</strong> in the top-right corner.
                      </span>
                    </li>
                  </ol>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-2 px-3 rounded-xl border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] font-bold text-xs text-[var(--color-text-primary)] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>{copied ? "Copied!" : "Copy Link for Safari"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareApp}
                      className="flex-1 py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Share size={14} />
                      <span>Share App</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: DESKTOP GUIDE ─── */}
              {activeTab === "desktop" && (
                <div className="space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl p-4 text-xs animate-fade-in">
                  <div className="font-extrabold text-[var(--color-text-primary)] text-sm flex items-center gap-2">
                    <Monitor size={16} className="text-orange-500" />
                    How to Install on Chrome, Edge & Desktop:
                  </div>

                  <ol className="space-y-2.5 text-[var(--color-text-secondary)] font-medium pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Look at the <strong>right side of your address bar (URL bar)</strong> at the top of your browser.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Click the <strong>Install App icon (💻 ⬇ or ⊕)</strong> and confirm <strong>&quot;Install&quot;</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        OR click browser menu <strong>(⋮ or ⋯)</strong> &rarr; <strong>&quot;Save and share&quot;</strong> &rarr; <strong>&quot;Install Sportify Kashmir&quot;</strong>.
                      </span>
                    </li>
                  </ol>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("qr")}
                      className="flex-1 py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-orange-500/30"
                    >
                      <QrCode size={14} />
                      <span>Scan QR for Mobile</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 py-2 px-3 rounded-xl border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] font-bold text-xs text-[var(--color-text-primary)] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>{copied ? "Copied!" : "Copy App Link"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── TAB 4: SCAN QR CODE ─── */}
              {activeTab === "qr" && (
                <div className="text-center space-y-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl p-4 text-xs animate-fade-in">
                  <div className="font-extrabold text-[var(--color-text-primary)] text-sm flex items-center justify-center gap-2">
                    <QrCode size={16} className="text-orange-500" />
                    Scan with Phone Camera to Install
                  </div>
                  <p className="text-[var(--color-text-secondary)]">
                    Point your smartphone camera at the QR code below to instantly open & install Sportify Kashmir on your phone:
                  </p>

                  <div className="flex justify-center my-2">
                    {qrCodeDataUrl ? (
                      <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-orange-500/30">
                        <img
                          src={qrCodeDataUrl}
                          alt="Sportify Kashmir App QR Code"
                          width={160}
                          height={160}
                          className="rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                        Loading QR...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="py-2 px-4 rounded-xl border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] font-bold text-xs text-[var(--color-text-primary)] flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>{copied ? "Link Copied!" : "Copy App URL"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareApp}
                      className="py-2 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Share size={14} />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Benefits Feature Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[var(--color-bg-tertiary)] rounded-2xl text-[11px] text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-2 font-medium">
                  <Zap size={14} className="text-amber-500 shrink-0" />
                  <span>1-Tap Instant Launch</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Layers size={14} className="text-blue-500 shrink-0" />
                  <span>Zero Storage (PWA)</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <BellRing size={14} className="text-orange-500 shrink-0" />
                  <span>Live Order Tracking</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck size={14} className="text-green-500 shrink-0" />
                  <span>100% Safe & Official</span>
                </div>
              </div>
            </div>

            {/* Footer Dismiss Action */}
            <div className="mt-4 pt-3 border-t border-[var(--color-border-primary)] flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-tertiary)]">
                Version 2.4 • Progressive Web App
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
