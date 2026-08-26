"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
  running: "👟",
  "sports wear": "🎽",
  basketball: "🏀",
  volleyball: "🏐",
  tennis: "🎾",
  cycling: "🚴",
  accessories: "🎒",
};

export default function SportsCategoryExplorer() {
  const [categories, setCategories] = useState<CategoryTile[]>([]);
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

  if (categories.length === 0) return null;

  return (
    <div className="w-full my-8">
      <div className="flex items-end justify-between mb-5 gap-3">
        <div>
          <h2 className="sk-section-title text-xl sm:text-[26px] text-zinc-900 dark:text-white">
            Explore Sports
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Football, cricket, badminton, fitness, running & outdoor gear
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 group shrink-0"
        >
          <span>All Categories</span>
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={cat.link}
            className="group relative bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-orange-400/50 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-1 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/15 dark:to-red-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-2xl mb-2.5 group-hover:scale-110 transition-transform duration-300">
              {cat.icon}
            </div>

            <h3 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight group-hover:text-orange-600 transition-colors font-display">
              {cat.name}
            </h3>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
              {cat.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
