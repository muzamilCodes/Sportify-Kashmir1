"use client";

import Image from "next/image";
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
 * Handles productId.productImgUrls[0], category/brand images, Cloudinary,
 * local disk /uploads/, Unsplash, and external HTTPS URLs safely.
 */
export default function ProductImage({
  product,
  src,
  url,
  alt = "Product Image",
  sizes = "(max-width: 768px) 100vw, 300px",
  className = "object-contain",
  priority = false,
  fill,
  width,
  height,
  loading,
}: ProductImageProps) {
  const target = src || url || product;
  const resolvedSource = useMemo(() => resolveProductImage(target), [target]);
  const [currentSrc, setCurrentSrc] = useState<string>(resolvedSource);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSrc(resolvedSource);
    setHasError(false);
  }, [resolvedSource]);

  const safeAlt = alt || "Product Image";
  const imageSrc = hasError || !currentSrc ? FALLBACK_IMAGE : currentSrc;

  // Determine fill mode if not explicitly passed
  const isFill = fill !== undefined ? fill : !Boolean(width && height);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(FALLBACK_IMAGE);
    }
  };

  if (!isFill && width && height) {
    return (
      <Image
        src={imageSrc}
        alt={safeAlt}
        width={width}
        height={height}
        unoptimized
        referrerPolicy="no-referrer"
        priority={priority}
        loading={priority ? undefined : loading || "lazy"}
        className={className}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={safeAlt}
      fill
      sizes={sizes}
      unoptimized
      referrerPolicy="no-referrer"
      priority={priority}
      loading={priority ? undefined : loading || "lazy"}
      className={className}
      onError={handleError}
    />
  );
}
