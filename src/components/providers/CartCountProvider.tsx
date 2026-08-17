"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type CartCountContextValue = {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
};

const CartCountContext = createContext<CartCountContextValue | null>(null);
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export function CartCountProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/getCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      const products = result.success && result.data?.products ? result.data.products : [];
      setCartCount(products.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 1), 0));
    } catch {
      // Cart count is non-critical UI; keep the last known value on transient errors.
    }
  }, []);

  useEffect(() => {
    // Admin pages do not render the public navigation and should not fetch a cart.
    if (pathname.startsWith("/admin")) return;

    void refreshCartCount();
    const handleCartUpdate = () => void refreshCartCount();
    const handleAuthUpdate = () => void refreshCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("authUpdated", handleAuthUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("authUpdated", handleAuthUpdate);
    };
  // The provider is persistent across client-side navigation. Do not include
  // pathname here: every route change must not become a cart request.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCartCount]);

  const value = useMemo(() => ({ cartCount, refreshCartCount }), [cartCount, refreshCartCount]);
  return <CartCountContext.Provider value={value}>{children}</CartCountContext.Provider>;
}

export function useCartCount() {
  const context = useContext(CartCountContext);
  if (!context) throw new Error("useCartCount must be used inside CartCountProvider");
  return context;
}
