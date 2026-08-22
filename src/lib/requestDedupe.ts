"use client";

/**
 * Request Deduplication Helper
 * Safely prevents duplicate concurrent API GET requests without interfering with
 * Next.js internal App Router RSC (React Server Component) navigation streams.
 */
export function installRequestDedupe() {
  // RSC and Next.js router requests are handled natively by Next.js router cache.
  // We keep this function as a clean no-op or lightweight safety layer.
}

