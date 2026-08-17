"use client";

import { ThemeProvider } from "next-themes";
import SplashScreen from "@/components/shared/SplashScreen";
import InstallPrompt from "@/components/shared/InstallPrompt";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import ScrollToTop from "@/components/shared/ScrollToTop";
import { CartCountProvider } from "@/components/providers/CartCountProvider";

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

