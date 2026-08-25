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
  Sparkles 
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCartCount } from "@/components/providers/CartCountProvider";

const RufusAIAssistant = dynamic(
  () => import("@/components/shared/RufusAIAssistant"),
  { ssr: false }
);

/**
 * MobileBottomNav
 * Amazon-style Fixed bottom navigation bar for mobile devices (<768px).
 * Shows 6 tabs matching Amazon app:
 * 1. Home
 * 2. You (Account / Profile)
 * 3. Wallet (Sportify Pay / Balance)
 * 4. Cart (with red badge count)
 * 5. Menu (Opens Drawer / Categories)
 * 6. Rufus (AI Shopping Assistant with vibrant gradient dot)
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCartCount();
  const [isRufusOpen, setIsRufusOpen] = useState(false);

  // Hide on admin pages
  const isAdminPage = pathname.startsWith("/admin");
  if (isAdminPage) return null;

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("toggleAmazonSideDrawer"));
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
        <div className="bg-white dark:bg-[#131921] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between px-1.5 py-1">
            {/* 1. Home */}
            <Link
              href="/"
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 flex-1 min-w-[50px] ${
                pathname === "/"
                  ? "text-orange-500 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {pathname === "/" && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-orange-500 rounded-full" />
              )}
              <Home size={21} strokeWidth={pathname === "/" ? 2.5 : 1.8} />
              <span className="text-[10px] mt-0.5 leading-none">Home</span>
            </Link>

            {/* 2. You */}
            <Link
              href="/profile"
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 flex-1 min-w-[50px] ${
                pathname.startsWith("/profile") && !pathname.includes("tab=wallet")
                  ? "text-orange-500 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <User size={21} strokeWidth={pathname.startsWith("/profile") ? 2.5 : 1.8} />
              <span className="text-[10px] mt-0.5 leading-none">You</span>
            </Link>

            {/* 3. Wallet */}
            <Link
              href="/profile?tab=wallet"
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 flex-1 min-w-[50px] ${
                pathname.includes("tab=wallet") || pathname.startsWith("/transactions")
                  ? "text-orange-500 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Wallet size={21} strokeWidth={1.8} />
              <span className="text-[10px] mt-0.5 leading-none">Wallet</span>
            </Link>

            {/* 4. Cart */}
            <Link
              href="/cart"
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 flex-1 min-w-[50px] ${
                pathname.startsWith("/cart")
                  ? "text-orange-500 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <div className="relative">
                <ShoppingCart size={21} strokeWidth={pathname.startsWith("/cart") ? 2.5 : 1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 shadow-xs">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-none">Cart</span>
            </Link>

            {/* 5. Menu */}
            <button
              type="button"
              onClick={handleOpenMenu}
              className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 flex-1 min-w-[50px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer"
            >
              <Menu size={21} strokeWidth={1.8} />
              <span className="text-[10px] mt-0.5 leading-none">Menu</span>
            </button>

            {/* 6. Rufus (AI Assistant) */}
            <button
              type="button"
              onClick={() => setIsRufusOpen(true)}
              className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 flex-1 min-w-[50px] text-gray-700 dark:text-gray-300 hover:text-orange-500 cursor-pointer group"
            >
              <div className="relative">
                <Sparkles size={21} className="text-orange-500 group-hover:scale-110 transition-transform" />
                {/* Amazon Rufus Multi-color dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-amber-400 ring-1 ring-white dark:ring-gray-900 animate-pulse" />
              </div>
              <span className="text-[10px] mt-0.5 font-bold text-orange-600 dark:text-orange-400 leading-none">
                Rufus
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
