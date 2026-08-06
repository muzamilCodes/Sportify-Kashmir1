"use client";

import ErrorPage from "@/components/shared/ErrorPage";

/**
 * Global Error Boundary
 * Catches runtime errors and displays a branded error page
 * with retry functionality.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      statusCode={500}
      title="Technical Foul"
      description="Something unexpected happened. Don't worry — our team is on it. Try refreshing the page."
      showRetry
      onRetry={reset}
    />
  );
}
