"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartCountProvider } from "@/components/providers/CartCountProvider";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { installRequestDedupe } from "@/lib/requestDedupe";

// High Performance: Dynamic client-only imports to remove blocking hydration from critical path
const ScrollToTop = dynamic(() => import("@/components/shared/ScrollToTop"), { ssr: false });
const RouteChangeHandler = dynamic(() => import("@/components/shared/RouteChangeHandler"), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/shared/InstallPrompt"), { ssr: false });
const PWARegister = dynamic(() => import("@/components/shared/PWARegister"), { ssr: false });
const FloatingWhatsApp = dynamic(() => import("@/components/shared/FloatingWhatsApp"), { ssr: false });
const LiveSalesPopup = dynamic(() => import("@/components/shared/LiveSalesPopup"), { ssr: false });
const SpinWheelModal = dynamic(() => import("@/components/shared/SpinWheelModal"), { ssr: false });

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isIdleLoaded, setIsIdleLoaded] = useState(false);

  useEffect(() => {
    installRequestDedupe();

    // Defer non-critical background widgets after main UI hydration (Instant 60fps start)
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => setIsIdleLoaded(true), { timeout: 2000 });
    } else {
      const timer = setTimeout(() => setIsIdleLoaded(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <CartCountProvider>
          {children}
          <MobileBottomNav />
          <ScrollToTop />
          <RouteChangeHandler />
          <InstallPrompt />
          <PWARegister />
          {isIdleLoaded && (
            <>
              <FloatingWhatsApp />
              <LiveSalesPopup />
              <SpinWheelModal />
            </>
          )}
        </CartCountProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
