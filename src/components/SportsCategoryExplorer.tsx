"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
    const fetchCategories = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/category/all`),
          fetch(`${API_URL}/product/getAll`),
        ]);

        const catData = await catRes.json();
        const prodData = await prodRes.json();

        if (catData.success && Array.isArray(catData.data)) {
          const prods: any[] = prodData.success && Array.isArray(prodData.data) ? prodData.data : [];

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
  }, [API_URL]);

  if (categories.length === 0) return null;

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Explore Sports Departments</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Authentic equipment for Kashmiri athletes, clubs, and academies
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 group"
        >
          <span>All Departments</span>
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={cat.link}
            className="group relative bg-white dark:bg-gray-900 rounded-2xl p-3.5 border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-1 overflow-hidden cursor-pointer"
          >
            {/* Top Accent Icon Circle */}
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl shadow-inner mb-2.5 group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>

            <h3 className="text-xs font-black text-gray-900 dark:text-white leading-tight group-hover:text-orange-600 transition-colors">
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
