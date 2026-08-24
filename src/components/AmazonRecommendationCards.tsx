"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, Flame, Tag } from "lucide-react";
import { resolveProductImage } from "@/lib/imageHelper";

interface DbProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  category?: { _id: string; name: string } | string;
  productImgUrls: string[];
}

interface RecommendationItem {
  id: string;
  type: "keep_shopping" | "deal" | "trending";
  title: string;
  productName: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  link: string;
}

export default function AmazonRecommendationCards() {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    const fetchRealRecommendations = async () => {
      try {
        const res = await fetch(`${API_URL}/product/getAll`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const prods: DbProduct[] = data.data;

          // Pick 3 real products: 1 deal (highest discount), 2 keep shopping
          const sortedByDiscount = [...prods].sort((a, b) => (b.discount || 0) - (a.discount || 0));
          const dealProd = sortedByDiscount[0];
          const recProd1 = prods[1] || prods[0];
          const recProd2 = prods[2] || prods[0];

          const realItems: RecommendationItem[] = [
            {
              id: recProd1._id,
              type: "keep_shopping",
              title: "Keep shopping for",
              productName: recProd1.name,
              image: resolveProductImage(recProd1),
              price: recProd1.price,
              link: `/product/${recProd1._id}`,
            },
            {
              id: recProd2._id,
              type: "keep_shopping",
              title: "Trending in Kashmir",
              productName: recProd2.name,
              image: resolveProductImage(recProd2),
              price: recProd2.price,
              link: `/product/${recProd2._id}`,
            },
            {
              id: dealProd._id,
              type: "deal",
              title: "Deal for you",
              productName: dealProd.name,
              image: resolveProductImage(dealProd),
              price: dealProd.discount ? Math.round(dealProd.price * (1 - dealProd.discount / 100)) : dealProd.price,
              originalPrice: dealProd.price,
              discountBadge: dealProd.discount ? `${dealProd.discount}% off` : "Special Offer",
              link: `/product/${dealProd._id}`,
            },
          ];

          setItems(realItems);
        }
      } catch (err) {
        console.error("Failed to fetch recommendation products:", err);
      }
    };

    fetchRealRecommendations();
  }, [API_URL]);

  if (items.length === 0) return null;

  return (
    <div className="w-full py-3 bg-[#f3f4f6] dark:bg-gray-950 rounded-2xl">
      <div className="container mx-auto px-2.5 sm:px-4">
        {/* Horizontal scroll cards on mobile, 3-col on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="bg-white dark:bg-gray-900 rounded-2xl p-3.5 shadow-sm border border-gray-200/70 dark:border-gray-800 flex flex-col justify-between shrink-0 w-[240px] sm:w-auto snap-start hover:shadow-md transition group"
            >
              {/* Top Title */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white tracking-tight">
                  {item.title}
                </h3>
                {item.type === "deal" && (
                  <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Flame size={11} /> Limited
                  </span>
                )}
              </div>

              {/* Product Photo Box */}
              <div className="w-full h-40 bg-gray-50 dark:bg-gray-800/80 rounded-xl overflow-hidden flex items-center justify-center p-2 relative group-hover:scale-101 transition-transform">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-full h-full object-contain rounded-lg"
                />

                {/* Discount Tag */}
                {item.discountBadge && (
                  <div className="absolute bottom-2 left-2 bg-[#cc0c39] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                    {item.discountBadge}
                  </div>
                )}
              </div>

              {/* Bottom Details */}
              <div className="mt-2.5">
                <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-orange-600 transition-colors">
                  {item.productName}
                </p>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    ₹{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-[11px] font-bold text-[#007185] dark:text-[#00a8e1] flex items-center gap-0.5 group-hover:underline">
                  <span>See more details</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
