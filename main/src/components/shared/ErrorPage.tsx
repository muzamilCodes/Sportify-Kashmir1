"use client";

import Link from "next/link";
import { Home, RefreshCw, AlertTriangle, WifiOff, FileQuestion } from "lucide-react";

/**
 * ErrorPage
 * Reusable error display component with branded sports-themed design.
 * Supports 404, 500, and network error variants.
 */

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

const errorConfig: Record<number, { emoji: string; title: string; description: string; icon: React.ReactNode }> = {
  404: {
    emoji: "🏟️",
    title: "Page Not Found",
    description: "Looks like this page has left the playing field. The URL you're looking for doesn't exist or has been moved.",
    icon: <FileQuestion className="w-16 h-16" />,
  },
  500: {
    emoji: "🔧",
    title: "Technical Foul",
    description: "Something went wrong on our end. Our team is working to fix it. Please try again in a moment.",
    icon: <AlertTriangle className="w-16 h-16" />,
  },
  503: {
    emoji: "📡",
    title: "You're Offline",
    description: "It looks like you've lost your internet connection. Please check your network and try again.",
    icon: <WifiOff className="w-16 h-16" />,
  },
};

export default function ErrorPage({
  statusCode = 500,
  title,
  description,
  showRetry = true,
  onRetry,
}: ErrorPageProps) {
  const config = errorConfig[statusCode] || errorConfig[500];

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 animate-fade-in-up">
      <div className="text-center max-w-lg">
        {/* Error icon */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-full flex items-center justify-center">
            <div className="text-orange-500">
              {config.icon}
            </div>
          </div>
          {/* Status code badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
            {statusCode}
          </div>
        </div>

        {/* Error emoji */}
        <div className="text-5xl mb-4">{config.emoji}</div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">
          {title || config.title}
        </h1>

        {/* Description */}
        <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-md mx-auto leading-relaxed">
          {description || config.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home size={18} />
            Go Home
          </Link>

          {showRetry && (
            <button
              onClick={onRetry || (() => window.location.reload())}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--color-border-primary)] text-[var(--color-text-primary)] rounded-full font-semibold hover:border-orange-500 hover:text-orange-500 transition-all duration-300"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
