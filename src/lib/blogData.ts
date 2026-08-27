export interface BlogPost {
  _id: string;
  postTitle: string;
  shortDesc?: string;
  postDesc: string;
  postImgUrl?: string | null;
  postAuthorId?: {
    _id?: string;
    username?: string;
    email?: string;
  };
  category?: string[] | string;
  hashTags?: string[] | string;
  views?: number;
  likes?: number;
  readTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export const getBlogImageUrl = (url?: string | null): string | null => {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();
  // Filter out any unsplash dummy placeholders
  if (trimmed.includes("unsplash.com") || trimmed.includes("placeholder")) return null;
  
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // High-Definition Optimization for Cloudinary images (avoids downsampling/blur)
    if (trimmed.includes("cloudinary.com") && trimmed.includes("/image/upload/") && !trimmed.includes("/f_auto")) {
      return trimmed.replace("/image/upload/", "/image/upload/f_auto,q_auto:best/");
    }
    return trimmed;
  }
  
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  if (trimmed.startsWith("/")) return `${apiUrl}${trimmed}`;
  return `${apiUrl}/uploads/${trimmed}`;
};

export const formatBlogDate = (dateStr?: string): string => {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Recently";
  }
};

export const calculateReadTime = (text?: string): string => {
  if (!text) return "3 min read";
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 180);
  return `${Math.max(1, minutes)} min read`;
};
