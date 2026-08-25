"use client";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import InstallPrompt from "@/components/shared/InstallPrompt";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import ScrollToTop from "@/components/shared/ScrollToTop";
import RouteChangeHandler from "@/components/shared/RouteChangeHandler";
import { CartCountProvider } from "@/components/providers/CartCountProvider";
import { installRequestDedupe } from "@/lib/requestDedupe";
import PWARegister from "@/components/shared/PWARegister";

import dynamic from "next/dynamic";
import { LanguageProvider } from "@/context/LanguageContext";

const FloatingWhatsApp = dynamic(() => import("@/components/shared/FloatingWhatsApp"), { ssr: false });
const LiveSalesPopup = dynamic(() => import("@/components/shared/LiveSalesPopup"), { ssr: false });
const SpinWheelModal = dynamic(() => import("@/components/shared/SpinWheelModal"), { ssr: false });

/**
 * ClientProviders
 * Wraps all client-side providers and persistent UI components.
 * Separated from the root layout to keep it a Server Component.
 */
export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Install before any child page effects can issue browser requests.
  installRequestDedupe();

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
          <FloatingWhatsApp />
          <LiveSalesPopup />
          <SpinWheelModal />
        </CartCountProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
