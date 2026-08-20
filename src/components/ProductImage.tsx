"use client";

import { useEffect, useMemo, useState } from "react";
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
 * Universal Image component for Sportify Kashmir.
 * Guarantees display of product, category, brand, Cloudinary, Unsplash, and local /uploads/ images.
 */
export default function ProductImage({
  product,
  src,
  url,
  alt = "Product Image",
  className = "object-contain",
  priority = false,
  fill,
  width,
  height,
  loading,
}: ProductImageProps) {
  const target = src || url || product;
  const initialSource = useMemo(() => resolveProductImage(target), [target]);
  const [imgSrc, setImgSrc] = useState<string>(initialSource);

  useEffect(() => {
    const resolved = resolveProductImage(target);
    setImgSrc(resolved || FALLBACK_IMAGE);
  }, [target]);

  const isFill = fill !== undefined ? fill : !Boolean(width && height);
  const safeAlt = alt || "Product Image";
  const displaySrc = imgSrc || FALLBACK_IMAGE;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={safeAlt}
      width={!isFill ? width : undefined}
      height={!isFill ? height : undefined}
      loading={priority ? "eager" : loading || "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      className={`${isFill ? "absolute inset-0 w-full h-full" : ""} ${className}`}
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
