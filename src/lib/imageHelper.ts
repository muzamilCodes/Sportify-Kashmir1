export const getApiUrl = (): string => {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  }
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
};

export const resolveProductImage = (product: any, customApiUrl?: string): string => {
  if (!product) return "/placeholder.svg";

  let raw = "";

  if (typeof product === "string") {
    raw = product;
  } else if (typeof product === "object") {
    if (Array.isArray(product.productImgUrls) && product.productImgUrls.length > 0) {
      raw = product.productImgUrls.find((u: any) => typeof u === "string" && u.trim().length > 0) || "";
    } else if (Array.isArray(product.images) && product.images.length > 0) {
      raw = product.images.find((u: any) => typeof u === "string" && u.trim().length > 0) || "";
    } else if (typeof product.productImgUrls === "string") {
      raw = product.productImgUrls;
    } else if (typeof product.image === "string") {
      raw = product.image;
    } else if (typeof product.img === "string") {
      raw = product.img;
    } else if (typeof product.url === "string") {
      raw = product.url;
    } else if (product.productId) {
      // Nested productId object or string
      return resolveProductImage(product.productId, customApiUrl);
    }
  }

  raw = (raw || "").trim();
  if (!raw) return "/placeholder.svg";

  // Absolute HTTP / HTTPS or Data URI
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }

  const apiUrl = (customApiUrl || getApiUrl()).replace(/\/$/, "");

  // Starts with /uploads/
  if (raw.startsWith("/uploads/")) {
    return `${apiUrl}${raw}`;
  }
  if (raw.startsWith("uploads/")) {
    return `${apiUrl}/${raw}`;
  }

  // Next.js local static assets (e.g. /placeholder.svg)
  if (raw.startsWith("/")) {
    return raw;
  }

  // Bare filename uploaded to backend
  return `${apiUrl}/uploads/${raw}`;
};
