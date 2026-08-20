export const getApiUrl = (): string => {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
};

const PLACEHOLDER_IMAGE = "/placeholder.svg";

/**
 * Robustly extracts raw image string from various possible property structures.
 */
export function extractRawImage(input: any, depth = 0): string {
  if (!input || depth > 5) return "";

  // If input is an array, inspect elements
  if (Array.isArray(input)) {
    for (const item of input) {
      const extracted = extractRawImage(item, depth + 1);
      if (extracted) return extracted;
    }
    return "";
  }

  // If input is already a string
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return "";
    // If it's a 24-character hexadecimal MongoDB ObjectId, it's an ID, not an image filename/URL
    if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
      return "";
    }
    return trimmed;
  }

  if (typeof input === "object") {
    // 1. Direct productImgUrls array or string (exact API response structure: productId.productImgUrls[0])
    if (input.productImgUrls) {
      const extracted = extractRawImage(input.productImgUrls, depth + 1);
      if (extracted) return extracted;
    }

    // 2. Direct images array or string
    if (input.images) {
      const extracted = extractRawImage(input.images, depth + 1);
      if (extracted) return extracted;
    }

    // 3. Nested productId property (CartItem / OrderItem)
    if (input.productId) {
      const extracted = extractRawImage(input.productId, depth + 1);
      if (extracted) return extracted;
    }

    // 4. Nested product property
    if (input.product) {
      const extracted = extractRawImage(input.product, depth + 1);
      if (extracted) return extracted;
    }

    // 5. Nested item property
    if (input.item) {
      const extracted = extractRawImage(input.item, depth + 1);
      if (extracted) return extracted;
    }

    // 6. Singular image and brand/category fields
    const candidates = [
      input.productImgUrl,
      input.productImage,
      input.image,
      input.logo,
      input.categoryImg,
      input.img,
      input.url,
      input.secure_url,
      input.src,
      input.photo,
      input.banner,
      input.cover,
      input.avatar,
      input.thumbnail,
      input.thumbnailUrl,
    ];

    for (const candidate of candidates) {
      if (candidate) {
        const extracted = extractRawImage(candidate, depth + 1);
        if (extracted) return extracted;
      }
    }
  }

  return "";
}

/**
 * Universal resolver to format any image string/object into a valid browser-loadable URL.
 */
export const resolveProductImage = (product: any, customApiUrl?: string): string => {
  if (!product) return PLACEHOLDER_IMAGE;

  let raw = extractRawImage(product);
  if (!raw) return PLACEHOLDER_IMAGE;

  // Older records may contain Windows-style paths. Normalize them.
  raw = raw.replace(/\\/g, "/");

  // Absolute HTTP / HTTPS or Data URI / Blob
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }

  // Protocol-relative URLs (e.g. //images.unsplash.com/...)
  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  const apiUrl = (customApiUrl || getApiUrl()).replace(/\/$/, "");

  // Starts with /uploads/
  if (raw.startsWith("/uploads/")) {
    return `${apiUrl}${raw}`;
  }
  if (raw.startsWith("uploads/")) {
    return `${apiUrl}/${raw}`;
  }

  // Next.js local static assets (e.g. /placeholder.svg, /hero-sports.png)
  if (raw.startsWith("/")) {
    return raw;
  }

  // Image files (with extension)
  const isImageFile = /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i.test(raw);
  if (isImageFile) {
    return `${apiUrl}/uploads/${raw}`;
  }

  return PLACEHOLDER_IMAGE;
};
