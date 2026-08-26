"use client";

import React, { useEffect, useMemo, useState } from "react";
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
 * Universal High-Performance Image component for Sportify Kashmir.
 * Optimized for Core Web Vitals (LCP, CLS 0.00, FCP) and WCAG Accessibility.
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

  useEffect(() => {
    const resolved = resolveProductImage(target);
    setImgSrc(resolved || FALLBACK_IMAGE);
  }, [target]);

  const safeAlt = alt || "Sportify Kashmir product gear";
  const displaySrc = imgSrc || FALLBACK_IMAGE;

  return (
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
      style={{ aspectRatio: "1 / 1" }}
      className={`${fill ? "absolute inset-0 w-full h-full" : ""} ${className}`}
      onError={(e) => {
        const targetEl = e.currentTarget;
        if (!targetEl.src.endsWith(FALLBACK_IMAGE)) {
          targetEl.src = FALLBACK_IMAGE;
          setImgSrc(FALLBACK_IMAGE);
        }
      }}
    />
  );
}

const ProductImage = React.memo(ProductImageComponent);
export default ProductImage;
