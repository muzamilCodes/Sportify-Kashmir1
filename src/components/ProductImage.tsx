"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { resolveProductImage } from "@/lib/imageHelper";

const FALLBACK_IMAGE = "/placeholder.svg";

type ProductImageProps = {
  product: unknown;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/** Renders productId.productImgUrls[0] for local, Cloudinary and Unsplash images. */
export default function ProductImage({
  product,
  alt,
  sizes,
  className = "object-contain",
  priority = false,
}: ProductImageProps) {
  const resolvedSource = useMemo(() => resolveProductImage(product), [product]);
  const [source, setSource] = useState(resolvedSource);

  useEffect(() => setSource(resolvedSource), [resolvedSource]);

  return (
    <Image
      src={source}
      alt={alt}
      fill
      sizes={sizes}
      // The CDN already transforms product images. Avoid a Next image optimizer
      // failure hiding a valid remote API URL.
      unoptimized
      priority={priority}
      className={className}
      onError={() => {
        if (source !== FALLBACK_IMAGE) setSource(FALLBACK_IMAGE);
      }}
    />
  );
}
