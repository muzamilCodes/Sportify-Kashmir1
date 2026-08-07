"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";

const SplashScreen = dynamic(() => import("@/components/shared/SplashScreen"), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/shared/InstallPrompt"), { ssr: false });
const MobileBottomNav = dynamic(() => import("@/components/shared/MobileBottomNav"), { ssr: false });
const ScrollToTop = dynamic(() => import("@/components/shared/ScrollToTop"), { ssr: false });

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
      <SplashScreen />
      {children}
      <MobileBottomNav />
      <ScrollToTop />
      <InstallPrompt />
    </ThemeProvider>
  );
}
