"use client";

import { useEffect } from "react";
import CompareBar from "@/components/CompareBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize cart from localStorage
    const cart = localStorage.getItem("cart");
    if (!cart) {
      localStorage.setItem("cart", JSON.stringify({ items: [] }));
    }
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] transition-colors duration-300">
      {children}
      <CompareBar />
    </main>
  );
}
