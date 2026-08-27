"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Flame, Sparkles, Zap, ArrowRight } from "lucide-react";
import { resolveProductImage } from "@/lib/imageHelper";
import { cachedJson, setCachedJson } from "@/lib/clientCache";

interface DbProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  category?: { _id: string; name: string } | string;
  productImgUrls?: string[];
  images?: string[];
  isAvailable?: boolean;
  isArchived?: boolean;
}

interface RecommendationItem {
  id: string;
  type: "deal" | "trending" | "keep_shopping";
  tag: string;
  tagBg: string;
  title: string;
  productName: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  link: string;
  product: DbProduct;
}

export default function AmazonRecommendationCards() {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    let isMounted = true;
    const fetchRealRecommendations = async () => {
      try {
        const result = await cachedJson<any>(`${API_URL}/product/getAll`);
        const rawList = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.items)
          ? result.data.items
          : [];

        if (isMounted && rawList.length > 0) {
          const available: DbProduct[] = rawList.filter(
            (p: DbProduct) => p.isAvailable !== false && !p.isArchived
          );

          if (available.length === 0) return;

          // 1. Pick Deal Product (Highest Discount)
          const withDiscount = available
            .filter((p) => (p.discount || 0) > 0)
            .sort((a, b) => (b.discount || 0) - (a.discount || 0));
          const dealProd = withDiscount[0] || available[0];

          // 2. Pick Trending Product (Different from deal product)
          const remainingAfterDeal = available.filter((p) => p._id !== dealProd._id);
          const trendingProd = remainingAfterDeal[0] || available[0];

          // 3. Pick Keep Shopping Product (Different from both deal & trending)
          const remainingAfterBoth = remainingAfterDeal.filter((p) => p._id !== trendingProd._id);
          const keepShoppingProd = remainingAfterBoth[0] || remainingAfterDeal[0] || available[0];

          const realItems: RecommendationItem[] = [
            // Card 1: Today's Deal
            {
              id: dealProd._id,
              type: "deal",
              tag: "⚡ Lightning Deal",
              tagBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
              title: "Special Deal for You",
              productName: dealProd.name,
              image: resolveProductImage(dealProd),
              price: dealProd.discount
                ? Math.round(dealProd.price * (1 - dealProd.discount / 100))
                : dealProd.price,
              originalPrice: dealProd.discount ? dealProd.price : undefined,
              discountBadge: dealProd.discount ? `${dealProd.discount}% OFF` : undefined,
              link: `/product/${dealProd._id}`,
              product: dealProd,
            },
            // Card 2: Trending in Kashmir
            {
              id: trendingProd._id,
              type: "trending",
              tag: "🔥 Hot in Kashmir",
              tagBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
              title: "Trending in Valley",
              productName: trendingProd.name,
              image: resolveProductImage(trendingProd),
              price: trendingProd.discount
                ? Math.round(trendingProd.price * (1 - trendingProd.discount / 100))
                : trendingProd.price,
              originalPrice: trendingProd.discount ? trendingProd.price : undefined,
              discountBadge: trendingProd.discount ? `${trendingProd.discount}% OFF` : undefined,
              link: `/product/${trendingProd._id}`,
              product: trendingProd,
            },
            // Card 3: Handpicked / Keep Shopping
            {
              id: keepShoppingProd._id,
              type: "keep_shopping",
              tag: "✨ Picked for You",
              tagBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
              title: "Keep Shopping For",
              productName: keepShoppingProd.name,
              image: resolveProductImage(keepShoppingProd),
              price: keepShoppingProd.discount
                ? Math.round(keepShoppingProd.price * (1 - keepShoppingProd.discount / 100))
                : keepShoppingProd.price,
              originalPrice: keepShoppingProd.discount ? keepShoppingProd.price : undefined,
              discountBadge: keepShoppingProd.discount ? `${keepShoppingProd.discount}% OFF` : undefined,
              link: `/product/${keepShoppingProd._id}`,
              product: keepShoppingProd,
            },
          ];

          setItems(realItems);
        }
      } catch (err) {
        console.error("Failed to fetch recommendation products:", err);
      }
    };

    fetchRealRecommendations();
    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  const primeProductCache = (item: RecommendationItem) => {
    if (item.product?._id) {
      setCachedJson(`${API_URL}/product/get/${item.product._id}`, {
        success: true,
        data: item.product,
      }, 120_000);
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="w-full my-6 select-none relative group/recs">
      {/* Mobile Scroll Controls */}
      <div className="flex sm:hidden items-center justify-between mb-2.5 px-1">
        <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <Sparkles size={13} className="text-orange-500" />
          <span>Recommended for You</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleScrollLeft}
            className="p-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            aria-label="Previous card"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            className="p-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            aria-label="Next card"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1"
      >
        {items.map((item) => (
          <Link
            key={`${item.id}-${item.type}`}
            href={item.link}
            onMouseEnter={() => primeProductCache(item)}
            onTouchStart={() => primeProductCache(item)}
            onClick={() => primeProductCache(item)}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-xs border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between shrink-0 w-[270px] sm:w-auto snap-start hover:shadow-xl hover:border-orange-500/50 transition-all duration-300 group hover:-translate-y-1"
          >
            {/* Top Tag & Card Title */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${item.tagBg}`}
                >
                  {item.tag}
                </span>
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center">
                  <span>View</span>
                  <ChevronRight size={12} />
                </span>
              </div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
                {item.title}
              </h3>
            </div>

            {/* Product Photo Box with Zero CLS */}
            <div className="w-full h-44 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-800/80 dark:to-zinc-850 rounded-xl overflow-hidden flex items-center justify-center p-3 relative group-hover:scale-[1.02] transition-transform duration-300 border border-zinc-100 dark:border-zinc-800">
              <img
                src={item.image}
                alt={item.productName}
                width={260}
                height={176}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
              />

              {/* Discount Badge */}
              {item.discountBadge && (
                <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
                  {item.discountBadge}
                </div>
              )}
            </div>

            {/* Bottom Product Details */}
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors font-display">
                {item.productName}
              </p>

              {/* Price & Savings */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                  ₹{item.price.toLocaleString("en-IN")}
                </span>
                {item.originalPrice && (
                  <span className="text-xs text-zinc-400 line-through">
                    ₹{item.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Save ₹{(item.originalPrice - item.price).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Prime 24h Badge */}
              <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                <span className="bg-zinc-950 text-white px-1.5 py-0.2 rounded text-[8px] font-black tracking-tight">
                  PRIME
                </span>
                <span>24h Valley Delivery</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
