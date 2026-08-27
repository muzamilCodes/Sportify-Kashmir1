"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  User, 
  Wallet, 
  ShoppingCart, 
  Menu, 
  Sparkles,
  Compass,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCartCount } from "@/components/providers/CartCountProvider";

const RufusAIAssistant = dynamic(
  () => import("@/components/shared/RufusAIAssistant"),
  { ssr: false }
);

/**
 * MobileBottomNav
 * Ultra-Modern Glassmorphic Mobile Navigation Bar (<768px).
 * 6 Primary Action Tabs:
 * 1. Home
 * 2. You (Profile / Account)
 * 3. Wallet (Sportify Pay & Cashback)
 * 4. Cart (With real-time animated badge)
 * 5. Menu (Opens Side Drawer & Full Sports Catalog)
 * 6. Rufus (AI Sports Assistant with multi-color gradient ring)
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCartCount();
  const [isRufusOpen, setIsRufusOpen] = useState(false);

  // Hide on admin, product details, and checkout pages
  const isExcludedPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/product/") ||
    pathname.startsWith("/checkout");
  if (isExcludedPage) return null;

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("toggleAmazonSideDrawer"));
  };

  const isHome = pathname === "/";
  const isProfile = pathname.startsWith("/profile") && !pathname.includes("tab=wallet");
  const isWallet = pathname.includes("tab=wallet") || pathname.startsWith("/transactions");
  const isCart = pathname.startsWith("/cart");

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom select-none">
        <div className="bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-6px_25px_rgba(0,0,0,0.5)] transition-colors duration-200">
          <div className="flex items-center justify-around px-1 py-1.5 max-w-md mx-auto">
            {/* 1. Home */}
            <Link
              href="/"
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 flex-1 min-w-[48px] active:scale-90 ${
                isHome
                  ? "text-orange-600 dark:text-orange-400 font-black"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {isHome && (
                <span className="absolute -top-1.5 w-7 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-xs" />
              )}
              <div className={`p-1 rounded-xl transition-transform duration-200 ${isHome ? "bg-orange-500/10 scale-105" : ""}`}>
                <Home size={20} strokeWidth={isHome ? 2.6 : 1.9} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">Home</span>
            </Link>

            {/* 2. You (Profile) */}
            <Link
              href="/profile"
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 flex-1 min-w-[48px] active:scale-90 ${
                isProfile
                  ? "text-orange-600 dark:text-orange-400 font-black"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {isProfile && (
                <span className="absolute -top-1.5 w-7 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-xs" />
              )}
              <div className={`p-1 rounded-xl transition-transform duration-200 ${isProfile ? "bg-orange-500/10 scale-105" : ""}`}>
                <User size={20} strokeWidth={isProfile ? 2.6 : 1.9} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">You</span>
            </Link>

            {/* 3. Wallet */}
            <Link
              href="/profile?tab=wallet"
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 flex-1 min-w-[48px] active:scale-90 ${
                isWallet
                  ? "text-orange-600 dark:text-orange-400 font-black"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {isWallet && (
                <span className="absolute -top-1.5 w-7 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-xs" />
              )}
              <div className={`p-1 rounded-xl transition-transform duration-200 ${isWallet ? "bg-orange-500/10 scale-105" : ""}`}>
                <Wallet size={20} strokeWidth={isWallet ? 2.6 : 1.9} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">Pay</span>
            </Link>

            {/* 4. Cart */}
            <Link
              href="/cart"
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 flex-1 min-w-[48px] active:scale-90 ${
                isCart
                  ? "text-orange-600 dark:text-orange-400 font-black"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {isCart && (
                <span className="absolute -top-1.5 w-7 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-xs" />
              )}
              <div className="relative p-1">
                <ShoppingCart size={20} strokeWidth={isCart ? 2.6 : 1.9} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[9px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-md animate-pulse ring-1 ring-white dark:ring-zinc-900">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">Cart</span>
            </Link>

            {/* 5. Menu (Side Drawer Trigger) */}
            <button
              type="button"
              onClick={handleOpenMenu}
              className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 flex-1 min-w-[48px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 active:scale-90 cursor-pointer"
            >
              <div className="p-1">
                <Menu size={20} strokeWidth={1.9} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">Menu</span>
            </button>

            {/* 6. Rufus (AI Shopping Specialist) */}
            <button
              type="button"
              onClick={() => setIsRufusOpen(true)}
              className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 flex-1 min-w-[48px] text-orange-600 dark:text-orange-400 active:scale-90 cursor-pointer group"
            >
              <div className="relative p-1">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Sparkles size={14} className="animate-spin-slow" />
                </div>
                {/* Glowing notification ping dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-white dark:ring-zinc-900 animate-ping" />
              </div>
              <span className="text-[10px] mt-0.5 font-black text-orange-600 dark:text-orange-400 tracking-tight">
                Rufus AI
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Rufus AI Assistant Modal */}
      <RufusAIAssistant isOpen={isRufusOpen} onClose={() => setIsRufusOpen(false)} />
    </>
  );
}
