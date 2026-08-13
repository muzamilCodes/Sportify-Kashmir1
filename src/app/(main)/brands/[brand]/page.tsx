"use client";

import { ArrowLeft, Loader2, ShoppingBag, Star, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EmptyState from "@/components/shared/EmptyState";

interface BrandMeta {
  name: string;
  description: string;
  rating: number;
  discount?: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  stock: number;
  isAvailable: boolean;
  brand?: { _id?: string; name?: string } | string;
}

export default function BrandDetailPage() {
  const params = useParams<{ brand: string }>();
  const slug = params.brand;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<BrandMeta | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const formatLabel = (value: string) =>
    value
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${API_URL}/uploads/${url}`;
  };

  useEffect(() => {
    if (!slug) return;

    const fetchBrandPage = async () => {
      try {
        setLoading(true);
        setError(null);

        const [brandResponse, productResponse] = await Promise.all([
          fetch(`${API_URL}/brand/all`),
          fetch(`${API_URL}/product/getAll`),
        ]);

        const [brandResult, productResult] = await Promise.all([
          brandResponse.ok ? brandResponse.json() : Promise.resolve(null),
          productResponse.ok ? productResponse.json() : Promise.resolve(null),
        ]);

        const fallbackName = formatLabel(slug);
        const matchedBrand = brandResult?.success && Array.isArray(brandResult.data)
          ? brandResult.data.find((item: any) => slugify(item.name) === slug)
          : null;

        const displayBrand: BrandMeta = {
          name: matchedBrand?.name || fallbackName,
          description: matchedBrand?.description || `Browse premium ${fallbackName.toLowerCase()} equipment and apparel.`,
          rating: typeof matchedBrand?.rating === "number" ? matchedBrand.rating : 4.5,
          discount: typeof matchedBrand?.discount === "number" ? matchedBrand.discount : undefined,
        };

        setBrand(displayBrand);

        const allProducts = productResult?.success && Array.isArray(productResult.data) ? productResult.data : [];
        const matchedProducts = allProducts.filter((product: any) => {
          if (!product.isAvailable || product.isArchived) return false;

          const productBrand = product.brand;
          if (typeof productBrand === "string") {
            return slugify(productBrand) === slug || slugify(productBrand) === slugify(displayBrand.name);
          }
          if (productBrand && typeof productBrand === "object") {
            return slugify(productBrand.name || "") === slug || slugify(productBrand.name || "") === slugify(displayBrand.name);
          }
          return false;
        });

        setProducts(matchedProducts);

        if (!matchedBrand && matchedProducts.length === 0) {
          setError("This brand page is available, but we could not find any matching product data yet.");
        }
      } catch (err) {
        console.error("Error loading brand page:", err);
        setError("We couldn't load this brand right now. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandPage();
  }, [API_URL, slug]);

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="products"
        title={brand ? `${brand.name} is not fully set up yet` : "Brand not available"}
        description={error}
        actionLabel="Back to Brands"
        actionHref="/brands"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Brands
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse All Products
          </Link>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
              <Tag className="h-4 w-4" />
              Official Brand Page
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{brand?.name || formatLabel(slug)}</h1>
            <p className="mt-4 max-w-2xl text-lg text-white/90">{brand?.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                {brand?.rating?.toFixed(1) || "4.5"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                <ShoppingBag className="h-4 w-4" />
                {products.length} Products
              </span>
              {brand?.discount ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                  Up to {brand.discount}% OFF
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Products from {brand?.name || formatLabel(slug)}</h2>
              <p className="mt-1 text-gray-600">A focused collection from this brand.</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-gray-600">No products are linked to this brand yet.</p>
              <Link href="/products" className="mt-4 inline-flex rounded-full bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600">
                Explore all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                const hasDiscount = !!(product.discount && product.discount > 0);

                return (
                  <Link key={product._id} href={`/product/${product._id}`} className="group">
                    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={getImageUrl(product.productImgUrls?.[0] || "")}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 min-h-[44px] font-semibold text-gray-900 group-hover:text-orange-600">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600">₹{discountedPrice.toFixed(2)}</span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
