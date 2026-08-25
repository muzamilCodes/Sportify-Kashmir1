import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sportify-kashmir1.vercel.app";
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://sportify-kashmir1.onrender.com"
      : "http://localhost:4000")
  ).replace(/\/$/, "");

  // Static core routes
  const routes = [
    "",
    "/products",
    "/categories",
    "/sale",
    "/new-arrivals",
    "/about",
    "/contact",
    "/faq",
    "/size-guide",
    "/product-guides",
    "/maintenance-tips",
    "/bulk-purchases",
    "/team-orders",
    "/wholesale",
    "/privacy-policy",
    "/terms-conditions",
    "/shipping-policy",
    "/return-policy",
    "/cancellation-policy",
    "/exchange-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.8,
  }));

  // Fetch real products for dynamic sitemap URLs
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/product/getAll`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      productRoutes = data.data.map((prod: any) => ({
        url: `${baseUrl}/product/${prod._id}`,
        lastModified: prod.updatedAt || new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));
    }
  } catch {
    // Graceful fallback if API unavailable during build
  }

  return [...routes, ...productRoutes];
}
