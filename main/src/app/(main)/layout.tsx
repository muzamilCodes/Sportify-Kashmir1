"use client";

import { useEffect } from "react";

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

  return <main className="min-h-screen bg-gray-50">{children}</main>;
}
