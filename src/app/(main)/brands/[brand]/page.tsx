"use client";

import { ArrowLeft, Loader2, ShoppingBag, Star, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EmptyState from "@/components/shared/EmptyState";
import ProductCard from "@/components/ProductCard";

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
  const [wishlist, setWishlist] = useState<string[]>([]);

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
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        setWishlist([]);
      }
    }
  }, []);

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
      } catch (err: any) {
        setError(err.message || "Failed to load brand details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrandPage();
  }, [slug]);

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)]">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <EmptyState
            variant="products"
            title="Brand Not Found"
            description={error || "We could not find the requested brand page."}
            actionLabel="View all brands"
            actionHref="/brands"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-6 sm:py-8">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-1.5 text-[13px] sm:text-[14px] font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Brands
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3.5 py-1.5 text-[13px] sm:text-[14px] font-semibold text-white transition hover:bg-orange-600 shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse All
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 sm:p-8 text-white shadow-md">
          <div className="max-w-2xl">
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-sm">
              <Tag className="h-3.5 w-3.5" />
              Official Brand
            </div>
            <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-extrabold tracking-tight">{brand?.name || formatLabel(slug)}</h1>
            <p className="mt-2 text-[14px] sm:text-[15px] text-white/90 leading-relaxed">{brand?.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                {brand?.rating?.toFixed(1) || "4.5"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 backdrop-blur-sm">
                <ShoppingBag className="h-3.5 w-3.5" />
                {products.length} Products
              </span>
              {brand?.discount ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 backdrop-blur-sm">
                  Up to {brand.discount}% OFF
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-gray-900 dark:text-white">
              Products from {brand?.name || formatLabel(slug)}
            </h2>
            <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">Explore gear & equipment from this brand.</p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No products are linked to this brand yet.</p>
              <Link href="/products" className="mt-3 inline-flex rounded-full bg-orange-500 px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-orange-600">
                Explore all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
              {products.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                const hasDiscount = !!(product.discount && product.discount > 0);

                return (
                  <ProductCard
                    key={product._id}
                    product={product as any}
                    discountedPrice={discountedPrice}
                    hasDiscount={hasDiscount}
                    wishlist={wishlist}
                    getImageUrl={getImageUrl}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
