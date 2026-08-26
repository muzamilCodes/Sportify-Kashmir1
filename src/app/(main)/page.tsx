"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Truck, 
  Shield, 
  Clock, 
  Award,
  ChevronRight,
  ArrowRight,
  ShoppingCart
} from "lucide-react";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/shared/SkeletonLoaders";
import { resolveProductImage } from "@/lib/imageHelper";
import { cachedJson, setCachedJson } from "@/lib/clientCache";
import AmazonHeroCarousel from "@/components/AmazonHeroCarousel";
import { useLanguage } from "@/context/LanguageContext";

// High Performance: Lazy-load below-the-fold interactive widgets to reduce initial bundle & TBT
const AmazonRecommendationCards = dynamic(() => import("@/components/AmazonRecommendationCards"), { ssr: false });
const SportsCategoryExplorer = dynamic(() => import("@/components/SportsCategoryExplorer"), { ssr: false });
const SportsGearQuiz = dynamic(() => import("@/components/SportsGearQuiz"), { ssr: false });
const RecentlyViewed = dynamic(() => import("@/components/RecentlyViewed"), { ssr: false });
const HomeBlogSection = dynamic(() => import("@/components/HomeBlogSection"), { ssr: false });

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  colors: string[];
  sizes: string[];
  isAvailable: boolean;
  stock: number;
  category?: { _id: string; name: string } | string;
  onSale?: boolean;
  createdAt: string;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [storeBanner, setStoreBanner] = useState<string | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Safe image helper
  const getImageUrl = (imgUrl: string) => {
    return resolveProductImage(imgUrl, API_URL);
  };

  // Safe price calculation
  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  useEffect(() => {
    let isMounted = true;
    fetchProducts();
    
    // Fetch public store settings for hero promo banner with deduplication
    cachedJson<any>(`${API_URL}/admin/public/settings`)
      .then((res) => {
        if (isMounted && res?.success && res.data?.bannerUrl) {
          const bUrl = res.data.bannerUrl.startsWith("http") || res.data.bannerUrl.startsWith("data:")
            ? res.data.bannerUrl
            : `${API_URL}${res.data.bannerUrl}`;
          setStoreBanner(bUrl);
        }
      })
      .catch(() => {});

    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        setWishlist([]);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await cachedJson<any>(`${API_URL}/product/getAll`);

      if (result?.success && result.data) {
        const rawList = Array.isArray(result.data) ? result.data : result.data?.items || [];
        rawList.forEach((p: any) => {
          if (p?._id) {
            setCachedJson(`${API_URL}/product/get/${p._id}`, { success: true, data: p }, 120_000);
          }
        });
        const availableProducts = rawList.filter(
          (product: any) => product.isAvailable !== false && !product.isArchived
        );
        setProducts(availableProducts);
        
        // Featured products (newest first, 5 products)
        const featured = [...availableProducts]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);
        setFeaturedProducts(featured.length > 0 ? featured : availableProducts.slice(0, 5));
        
        // Sale products (products with discount or onSale flag)
        const sale = availableProducts.filter((p: any) => p.onSale === true || (p.discount && p.discount > 0)).slice(0, 5);
        setSaleProducts(sale.length > 0 ? sale : availableProducts.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let updatedWishlist: string[];
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
      toast.success("Removed from wishlist");
    } else {
      updatedWishlist = [...wishlist, productId];
      toast.success("Added to wishlist");
    }
    
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Network error. Try again.");
    }
  };

  const handleBuyNow = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to purchase");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.dispatchEvent(new Event("cartUpdated"));
        window.location.href = "/checkout";
      } else {
        toast.error(data.message || "Failed to process");
      }
    } catch (error) {
      console.error("Error with buy now:", error);
      toast.error("Network error. Try again.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-16">
      {/* 1. Amazon Prime / Flipkart Inspired Hero Section */}
      <AmazonHeroCarousel />

      {/* Main Content Container with negative top margin to blend into hero banner on desktop */}
      <div className="container max-w-[1500px] mx-auto px-3 sm:px-4 md:px-6 relative z-20">
        {/* 2. Amazon 3-Column Multi-Card Recommendation Widgets */}
        <AmazonRecommendationCards />

        {/* 3. Sports Category Explorer */}
        <SportsCategoryExplorer />

        {/* 4. Featured Products Grid */}
        <section className="mb-14 cv-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="sk-section-title text-[22px] sm:text-[26px] md:text-[30px] text-zinc-900 dark:text-white">
                {t("home.featuredProducts")}
              </h2>
              <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                New arrivals &amp; trending picks for athletes
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline group"
            >
              <span>{t("home.viewAll")}</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <ProductGridSkeleton count={5} />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {featuredProducts.map((product, idx) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                const hasDiscount = (product.discount ?? 0) > 0;

                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    priority={idx < 2}
                    discountedPrice={discountedPrice}
                    hasDiscount={hasDiscount}
                    wishlist={wishlist}
                    getImageUrl={getImageUrl}
                    handleAddToCart={handleAddToCart}
                    handleBuyNow={handleBuyNow}
                    toggleWishlist={toggleWishlist}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                No featured products available at the moment.
              </p>
            </div>
          )}
        </section>

        {/* 5. Interactive Sports Gear Matcher Quiz */}
        <div className="cv-auto">
          <SportsGearQuiz />
        </div>

        {/* 6. Special Sale Section (Flash Deals) */}
        {saleProducts.length > 0 && (
          <section className="mb-14 cv-auto">
            <div className="flex justify-between items-end mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 dark:bg-red-950/60 border border-red-500/30 text-red-600 dark:text-red-400 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                  <span>⚡ Special Deals</span>
                </div>
                <h2 className="sk-section-title text-[22px] sm:text-[26px] md:text-[30px] text-zinc-900 dark:text-white">
                  Limited Time Offers
                </h2>
                <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Exclusive discounts on Kashmir willow, football studs &amp; sportswear
                </p>
              </div>
              <Link
                href="/sale"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline group"
              >
                <span>Explore All Deals</span>
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {saleProducts.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                const hasDiscount = (product.discount ?? 0) > 0;

                return (
                  <ProductCard
                    key={product._id}
                    product={product}
                    discountedPrice={discountedPrice}
                    hasDiscount={hasDiscount}
                    wishlist={wishlist}
                    getImageUrl={getImageUrl}
                    handleAddToCart={handleAddToCart}
                    handleBuyNow={handleBuyNow}
                    toggleWishlist={toggleWishlist}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Recently Viewed Products (Dynamic) */}
        <div className="cv-auto">
          <RecentlyViewed products={products} />
        </div>

        {/* 8. Kashmir Sports Blog & Equipment Guides */}
        <div className="cv-auto">
          <HomeBlogSection />
        </div>

        {/* 9. Trust & Value Features Grid */}
        <section className="mt-8 mb-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 cv-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {t("features.fastDelivery.title")}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {t("features.fastDelivery.desc")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {t("features.genuineGear.title")}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {t("features.genuineGear.desc")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {t("features.support.title")}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {t("features.support.desc")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {t("features.authenticWillow.title")}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {t("features.authenticWillow.desc")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
