import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sportify-kashmir1.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin/*", "/profile", "/cart", "/checkout", "/orders"],
      },
      {
        userAgent: ["GPTBot", "ChatGPT-User", "Google-Extended", "PerplexityBot", "ClaudeBot", "Applebot-Extended"],
        allow: ["/", "/products", "/product/*", "/blog", "/blog/*", "/categories"],
        disallow: ["/admin/", "/checkout", "/orders"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
