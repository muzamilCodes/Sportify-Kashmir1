"use client";

import Link from "next/link";
import { ShoppingBag, Heart, Search, Package, FileText } from "lucide-react";
import type { ReactNode } from "react";

/**
 * EmptyState
 * Reusable component for displaying empty state messages with icon, title,
 * description, and optional CTA. Sports-themed variants included.
 */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  variant?: "default" | "cart" | "wishlist" | "search" | "orders" | "products";
}

const variantConfig = {
  default: {
    icon: <Package className="w-12 h-12" />,
    gradient: "from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800",
    iconColor: "text-gray-400 dark:text-gray-500",
  },
  cart: {
    icon: <ShoppingBag className="w-12 h-12" />,
    gradient: "from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20",
    iconColor: "text-orange-400",
  },
  wishlist: {
    icon: <Heart className="w-12 h-12" />,
    gradient: "from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20",
    iconColor: "text-pink-400",
  },
  search: {
    icon: <Search className="w-12 h-12" />,
    gradient: "from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
    iconColor: "text-blue-400",
  },
  orders: {
    icon: <Package className="w-12 h-12" />,
    gradient: "from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20",
    iconColor: "text-purple-400",
  },
  products: {
    icon: <ShoppingBag className="w-12 h-12" />,
    gradient: "from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
    iconColor: "text-green-400",
  },
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  const config = variantConfig[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
      {/* Icon container */}
      <div
        className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-6`}
      >
        <div className={config.iconColor}>
          {icon || config.icon}
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--color-text-secondary)] max-w-md mb-6">
          {description}
        </p>
      )}

      {/* CTA */}
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
