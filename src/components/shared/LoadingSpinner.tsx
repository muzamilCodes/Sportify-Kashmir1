import { Trophy } from "lucide-react";

/**
 * LoadingSpinner
 * Branded gradient spinner with trophy icon center.
 * Replaces the previous basic spinner.
 */
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-14 h-14 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        {/* Spinning gradient arc */}
        <div
          className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: "#f97316",
            borderRightColor: "#ef4444",
            animationDuration: "0.8s",
          }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-orange-500" />
        </div>
      </div>
    </div>
  );
}
