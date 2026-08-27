"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Flame } from "lucide-react";
import { cachedJson } from "@/lib/clientCache";

interface DbCategory {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  subcategories?: string[];
}

interface CategoryTile {
  id: string;
  name: string;
  count: string;
  icon: string;
  link: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  cricket: "🏏",
  football: "⚽",
  badminton: "🏸",
  "gym & fitness": "🏋️",
  gym: "🏋️",
  fitness: "🏋️",
  running: "👟",
  "sports wear": "🎽",
  apparel: "🎽",
  basketball: "🏀",
  volleyball: "🏐",
  tennis: "🎾",
  cycling: "🚴",
  accessories: "🎒",
};

export default function SportsCategoryExplorer() {
  const [categories, setCategories] = useState<CategoryTile[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const [catData, prodData] = await Promise.all([
          cachedJson<any>(`${API_URL}/category/all`),
          cachedJson<any>(`${API_URL}/product/getAll`),
        ]);

        if (isMounted && catData?.success && Array.isArray(catData.data)) {
          const prods: any[] = prodData?.success && Array.isArray(prodData.data) ? prodData.data : [];

          const tiles: CategoryTile[] = catData.data.map((cat: DbCategory) => {
            const count = prods.filter((p) => {
              const pCat = typeof p.category === "object" ? p.category?.name : p.category;
              return pCat?.toLowerCase() === cat.name?.toLowerCase();
            }).length;

            const iconKey = cat.name?.toLowerCase() || "";
            const icon = CATEGORY_ICONS[iconKey] || "🏆";

            return {
              id: cat._id,
              name: cat.name,
              count: `${count} Items`,
              icon,
              link: `/products?category=${encodeURIComponent(cat.name)}`,
            };
          });

          setCategories(tiles);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  // Smooth continuous Auto-Scroll from Right to Left
  useEffect(() => {
    if (categories.length === 0) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const autoScroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && scrollRef.current) {
        const el = scrollRef.current;
        // Scroll 40 pixels per second
        el.scrollLeft += (40 * delta) / 1000;

        // Loop around seamlessly
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, categories.length]);

  // Manual instant scroll buttons (No waiting)
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 3000);
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 3000);
    }
  };

  if (categories.length === 0) return null;

  // Duplicate items for infinite seamless scroll
  const displayItems = [...categories, ...categories, ...categories];

  return (
    <div className="w-full my-8 relative group/explorer">
      {/* ─── Header Section with Fast Navigation Buttons ─── */}
      <div className="flex items-end justify-between mb-4 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 border border-orange-500/20">
            <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span>Kashmir Valley Sports</span>
          </div>
          <h2 className="sk-section-title text-xl sm:text-[26px] text-zinc-900 dark:text-white">
            Explore Sports
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Football, cricket, badminton, fitness, running &amp; outdoor gear
          </p>
        </div>

        {/* Right Controls: Arrow Buttons + All Categories */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Manual Arrow Buttons for Instant Navigation (No waiting) */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-850 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <button
              type="button"
              onClick={handleScrollLeft}
              className="p-1.5 rounded-lg hover:bg-orange-500/10 text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 active:scale-90 transition cursor-pointer"
              aria-label="Scroll sports categories left"
              title="Previous categories"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              className="p-1.5 rounded-lg hover:bg-orange-500/10 text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 active:scale-90 transition cursor-pointer"
              aria-label="Scroll sports categories right"
              title="Next categories"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <Link
            href="/products"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 group hover:underline"
          >
            <span>All Categories</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ─── Single-Line Continuous Stream with Left/Right Floating Buttons ─── */}
      <div
        className="relative -mx-3 px-3 sm:-mx-6 sm:px-6 py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left Floating Quick Scroll Button */}
        <button
          type="button"
          onClick={handleScrollLeft}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-white shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover/explorer:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Floating Quick Scroll Button */}
        <button
          type="button"
          onClick={handleScrollRight}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-zinc-800/95 text-zinc-800 dark:text-white shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-80 group-hover/explorer:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>

        {/* Soft Left & Right Fade Masks */}
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent z-10 pointer-events-none" />

        {/* Scrollable Ribbon Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-1 scroll-smooth select-none"
        >
          {displayItems.map((cat, idx) => (
            <Link
              key={`${cat.id}-${idx}`}
              href={cat.link}
              className="group shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl px-4 py-3 border border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:shadow-xl hover:border-orange-500/60 transition-all duration-300 flex items-center gap-3.5 hover:-translate-y-0.5 min-w-[170px] sm:min-w-[190px] cursor-pointer"
            >
              {/* Category Emoji Icon Box */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/60 dark:to-zinc-800 border border-orange-200/60 dark:border-orange-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-xs shrink-0">
                <span>{cat.icon}</span>
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0">
                <h3 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate font-display">
                  {cat.name}
                </h3>
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {cat.count}
                </span>
              </div>

              {/* Subtle chevron arrow */}
              <ChevronRight
                size={14}
                className="text-zinc-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all ml-auto shrink-0"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
