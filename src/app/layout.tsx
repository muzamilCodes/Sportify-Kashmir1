import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import ClientProviders from "@/components/providers/ClientProviders";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

/* ─── SEO & PWA Metadata ───────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Sportify Kashmir — Premium Sports Equipment & Apparel",
  description:
    "Kashmir's premier destination for sports gear, equipment, and athletic apparel. Cricket, Football, Basketball, Tennis, and more. Free shipping on orders above ₹999.",
  keywords:
    "sports equipment, cricket gear, football accessories, athletic wear, Kashmir sports, sportify kashmir, sports shop kashmir",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
  verification: {
    google: "SGFKbVbcg_kobHDJwrMpSDIszpsvZ-Dt7gBJ39tITdo",

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
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="SGFKbVbcg_kobHDJwrMpSDIszpsvZ-Dt7gBJ39tITdo" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preload" as="image" href="/hero-banner-1.webp" type="image/webp" fetchPriority="high" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script
          id="pwa-global-capture"
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaInstallPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-available', { detail: e }));
              });
              window.addEventListener('appinstalled', function() {
                window.__pwaInstallPrompt = null;
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              });
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              "name": "Sportify Kashmir",
              "image": "https://sportify-kashmir1.vercel.app/logo.png",
              "description": "Kashmir's premier destination for genuine handcrafted Kashmir willow cricket bats, football boots, badminton, gym fitness & athletic apparel.",
              "url": "https://sportify-kashmir1.vercel.app",
              "telephone": "+91-9682645127",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Main Market Sangam / Srinagar",
                "addressLocality": "Srinagar",
                "addressRegion": "Jammu and Kashmir",
                "postalCode": "190001",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 34.0837,
                "longitude": 74.7973
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "09:00",
                "closes": "21:00"
              },
              "priceRange": "₹₹",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://sportify-kashmir1.vercel.app/products?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </head>
      <body className={`${dmSans.className} bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)] transition-colors duration-300`} suppressHydrationWarning>
        <ClientProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
          >
            Skip to main content
          </a>
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
          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
        </ClientProviders>

      </body>
    </html>
  );
}
