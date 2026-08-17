"use client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const pending = new Map<string, Promise<Response>>();
const recentResponses = new Map<string, { response: Response; expiresAt: number }>();
const API_CACHE_WINDOW_MS = 750;
let installed = false;

function requestKey(input: RequestInfo | URL, init?: RequestInit) {
  const request = input instanceof Request ? input : null;
  const url = new URL(request?.url || String(input), window.location.origin);
  const method = (init?.method || request?.method || "GET").toUpperCase();
  const headers = new Headers(init?.headers || request?.headers);
  const isRsc = url.searchParams.has("_rsc") || headers.get("RSC") === "1";

  // _rsc is a cache-busting token. It must not make two identical router
  // prefetches look like different requests.
  if (isRsc) url.searchParams.delete("_rsc");

  return [
    method,
    url.toString(),
    headers.get("authorization") || "",
    headers.get("RSC") || "",
    headers.get("Next-Router-Prefetch") || "",
    headers.get("Next-Router-State-Tree") || "",
  ].join("\n");
}

function cloneResponse(response: Response) {
  return response.clone();
}

/**
 * Coalesces duplicate browser GETs caused by Strict Mode, remounts, and
 * overlapping App Router prefetches. POST/PUT/PATCH/DELETE invalidate the
 * short-lived API response cache so mutations remain immediately visible.
 */
export function installRequestDedupe() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : null;
    const method = (init?.method || request?.method || "GET").toUpperCase();
    const url = request?.url || String(input);
    const isApiRequest = url.startsWith(API_URL);
    const headers = new Headers(init?.headers || request?.headers);
    const isRscRequest = new URL(url, window.location.origin).searchParams.has("_rsc") || headers.get("RSC") === "1";

    if (!isApiRequest && !isRscRequest) return originalFetch(input, init);

    if (method !== "GET" && method !== "HEAD") {
      recentResponses.clear();
      return originalFetch(input, init);
    }

    // Do not coalesce requests with caller-controlled cancellation signals.
    if (init?.signal || request?.signal) return originalFetch(input, init);

    const key = requestKey(input, init);
    const now = Date.now();
    const cached = isApiRequest ? recentResponses.get(key) : undefined;
    if (cached && cached.expiresAt > now) return Promise.resolve(cloneResponse(cached.response));

    const existing = pending.get(key);
    if (existing) return existing.then(cloneResponse);

    const requestPromise = originalFetch(input, init).then((response) => {
      if (isApiRequest) {
        recentResponses.set(key, { response: response.clone(), expiresAt: Date.now() + API_CACHE_WINDOW_MS });
      }
      return response;
    }).finally(() => pending.delete(key));

    pending.set(key, requestPromise);
    return requestPromise.then(cloneResponse);
  };
}
