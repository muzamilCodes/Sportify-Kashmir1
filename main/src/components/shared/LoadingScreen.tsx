"use client";

import { Trophy } from "lucide-react";

/**
 * LoadingScreen
 * Premium full-page loading indicator with branded gradient spinner.
 * Used for page transitions and initial data loading.
 */
export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="text-center">
        {/* Branded spinner */}
        <div className="relative inline-block mb-6">
          {/* Outer ring */}
          <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          {/* Spinning gradient arc */}
          <div
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent animate-spin"
            style={{
              borderTopColor: "#f97316",
              borderRightColor: "#ef4444",
              animationDuration: "0.8s",
            }}
          />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-orange-500 animate-pulse" />
          </div>
        </div>

        <p className="text-[var(--color-text-secondary)] font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
