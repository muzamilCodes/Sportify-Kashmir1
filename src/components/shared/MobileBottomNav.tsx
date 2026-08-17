"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingCart, Heart, User } from "lucide-react";
import { useCartCount } from "@/components/providers/CartCountProvider";

function Link(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

/**
 * MobileBottomNav
 * Fixed bottom navigation bar for mobile devices (<768px).
 * Shows 5 tabs: Home, Categories, Cart (with badge), Wishlist, Account.
 * Always visible — never hides on scroll.
 * Hidden on admin pages.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCartCount();

  // Hide on admin pages
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) return null;

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/profile", label: "Account", icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom"
    >
      <div className="bg-[var(--color-bg-elevated)] border-t border-[var(--color-border-primary)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? "text-orange-500"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                )}

                <div className="relative">
                  <Icon
                    size={22}
                    className={`transition-transform duration-200 ${
                      isActive ? "scale-110" : ""
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Cart badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-scale-in">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-0.5 font-medium transition-colors ${
                    isActive ? "text-orange-500" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
