"use client";

import { ThemeProvider } from "next-themes";
import SplashScreen from "@/components/shared/SplashScreen";
import InstallPrompt from "@/components/shared/InstallPrompt";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { CartCountProvider } from "@/components/providers/CartCountProvider";
import { installRequestDedupe } from "@/lib/requestDedupe";

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
      <CartCountProvider>
        <SplashScreen />
        {children}
        <MobileBottomNav />
        <ScrollToTop />
        <InstallPrompt />
      </CartCountProvider>
    </ThemeProvider>
  );
}

