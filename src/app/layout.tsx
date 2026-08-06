import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import ClientProviders from "@/components/providers/ClientProviders";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

/* ─── SEO & PWA Metadata ───────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Sportify Kashmir — Premium Sports Equipment & Apparel",
  description:
    "Kashmir's premier destination for sports gear, equipment, and athletic apparel. Cricket, Football, Basketball, Tennis, and more. Free shipping on orders above ₹999.",
  keywords:
    "sports equipment, cricket gear, football accessories, athletic wear, Kashmir sports, sportify kashmir, sports shop kashmir",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sportify Kashmir",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Sportify Kashmir",
    title: "Sportify Kashmir — Premium Sports Equipment & Apparel",
    description:
      "Kashmir's premier destination for premium sports equipment, athletic apparel, and expert advice.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sportify Kashmir — Premium Sports Equipment & Apparel",
    description:
      "Kashmir's premier destination for premium sports equipment, athletic apparel, and expert advice.",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Sportify Kashmir",
    "msapplication-TileColor": "#f97316",
    "msapplication-tap-highlight": "no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${inter.className} bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] transition-colors duration-300`}>
        <ClientProviders>
          <Header />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-primary)",
              },
              success: {
                style: {
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                },
              },
            }}
          />
          {children}
          <Footer />
        </ClientProviders>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('[SW] Registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('[SW] Registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
