"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { resolveProductImage } from "@/lib/imageHelper";

const FALLBACK_IMAGE = "/placeholder.svg";

export type ProductImageProps = {
  product?: unknown;
  src?: string;
  url?: string;
  alt?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
};

/**
 * Universal High-Performance Lazy-Loaded Image Component for Sportify Kashmir.
 * Features:
 * - IntersectionObserver based true on-demand lazy loading (250px rootMargin prefetch)
 * - Zero Layout Shift (CLS 0.00) with fixed aspect ratio
 * - Asynchronous decoding (decoding="async") to keep main thread 60fps smooth
 * - Progressive smooth fade-in on load
 * - Automatic broken image fallback recovery
 */
function ProductImageComponent({
  product,
  src,
  url,
  alt = "Sportify Kashmir product",
  className = "object-contain",
  priority = false,
  fill = false,
  width = 300,
  height = 300,
  loading,
}: ProductImageProps) {
  const target = src || url || product;
  const initialSource = useMemo(() => resolveProductImage(target), [target]);
  const [imgSrc, setImgSrc] = useState<string>(initialSource);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resolved = resolveProductImage(target);
    setImgSrc(resolved || FALLBACK_IMAGE);
  }, [target]);

  // IntersectionObserver: Only mount/fetch image when scrolled within 250px of viewport
  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "250px 0px", // Prefetch 250px before entering screen
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const safeAlt = alt || "Sportify Kashmir product gear";
  const displaySrc = imgSrc || FALLBACK_IMAGE;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex items-center justify-center ${
        fill ? "w-full h-full" : ""
      }`}
      style={{ aspectRatio: "1 / 1" }}
    >
      {/* Sleek Skeleton Loading Placeholder before image finishes downloading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100/80 dark:bg-zinc-800/80 animate-pulse rounded-lg" />
      )}

      {isVisible && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displaySrc}
          alt={safeAlt}
          width={width}
          height={height}
          loading={priority ? "eager" : loading || "lazy"}
          fetchPriority={priority ? "high" : "low"}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            const targetEl = e.currentTarget;
            if (!targetEl.src.endsWith(FALLBACK_IMAGE)) {
              targetEl.src = FALLBACK_IMAGE;
              setImgSrc(FALLBACK_IMAGE);
            }
            setIsLoaded(true);
          }}
          className={`${
            fill ? "w-full h-full" : ""
          } ${className} transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

const ProductImage = React.memo(ProductImageComponent);
export default ProductImage;
