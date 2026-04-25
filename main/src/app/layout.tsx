import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sportify Kashmir - Premium Sports Equipment & Apparel",
  description:
    "Kashmir's premier destination for sports gear, equipment, and athletic apparel. Cricket, Football, Basketball, Tennis, and more.",
  keywords:
    "sports equipment, cricket gear, football accessories, athletic wear, Kashmir sports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <Header />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0ea5e9",
              color: "#fff",
            },
          }}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
