"use client";

import Link from "next/link";
import { 
  Flame, 
  Footprints, 
  Trophy,
  Dumbbell,
  Goal,
  BookOpen
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CricketIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11.5 12.5 6 18c-2.5-1.5-5-.5-7 2 2.5 1.5 5 .5 7-2l5.5-5.5Z" />
    <path d="m12 12 5.5-5.5c2.5 1.5 5 .5 7-2-2.5-1.5-5-.5-7 2L12 12Z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ShuttlecockIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v6" />
    <path d="m6 8 6-6 6 6" />
    <path d="M4 14a8 8 0 0 0 16 0" />
    <circle cx="12" cy="18" r="3" />
  </svg>
);

interface QuickCategory {
  id: string;
  name: string;
  sublabel: string;
  href: string;
  bgGradient: string;
  badge?: string;
  badgeBg?: string;
  icon: React.ReactNode;
}

export default function AmazonQuickCategories() {
  const { t } = useLanguage();

  const categories: QuickCategory[] = [
    {
      id: "pay",
      name: "Pay",
      sublabel: "Sportify Pay",
      href: "/profile?tab=wallet",
      bgGradient: "from-amber-100 to-yellow-200 dark:from-amber-950/70 dark:to-yellow-900/70",
      badge: "₹50 Back",
      badgeBg: "bg-amber-600 text-white",
      icon: (
        <div className="w-8 h-8 rounded-full bg-[#ffc220] flex items-center justify-center shadow-xs border border-amber-400">
          <span className="text-[10px] font-black text-gray-900 tracking-tighter">pay</span>
        </div>
      ),
    },
    {
      id: "blog",
      name: "Blog",
      sublabel: "Sports Guides",
      href: "/blog",
      bgGradient: "from-orange-50 to-amber-100 dark:from-orange-950/70 dark:to-amber-900/70",
      badge: "NEW",
      badgeBg: "bg-orange-600 text-white",
      icon: (
        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-300">
          <BookOpen size={17} />
        </div>
      ),
    },
    {
      id: "cricket",
      name: "Cricket",
      sublabel: "Willow Bats",
      href: "/products?search=cricket",
      bgGradient: "from-emerald-50 to-green-100 dark:from-emerald-950/70 dark:to-green-900/70",
      badge: "Pure",
      badgeBg: "bg-emerald-600 text-white",
      icon: (
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
          <CricketIcon size={17} />
        </div>
      ),
    },
    {
      id: "deals",
      name: "Bazaar",
      sublabel: "Crazy Deals",
      href: "/sale",
      bgGradient: "from-rose-50 to-pink-100 dark:from-rose-950/70 dark:to-pink-900/70",
      badge: "70% OFF",
      badgeBg: "bg-red-600 text-white",
      icon: (
        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <Flame size={17} className="animate-pulse" />
        </div>
      ),
    },
    {
      id: "football",
      name: "Football",
      sublabel: "Match Gear",
      href: "/products?search=football",
      bgGradient: "from-sky-50 to-blue-100 dark:from-sky-950/70 dark:to-blue-900/70",
      icon: (
        <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-300">
          <Goal size={17} />
        </div>
      ),
    },
    {
      id: "badminton",
      name: "Badminton",
      sublabel: "Rackets",
      href: "/products?search=badminton",
      bgGradient: "from-teal-50 to-cyan-100 dark:from-teal-950/70 dark:to-cyan-900/70",
      icon: (
        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-300">
          <ShuttlecockIcon size={17} />
        </div>
      ),
    },
    {
      id: "gym",
      name: "Gym",
      sublabel: "Fitness Gear",
      href: "/products?search=gym",
      bgGradient: "from-amber-50 to-orange-100 dark:from-amber-950/70 dark:to-orange-900/70",
      icon: (
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-300">
          <Dumbbell size={17} />
        </div>
      ),
    },
    {
      id: "shoes",
      name: "Shoes",
      sublabel: "Spikes & Turf",
      href: "/products?search=shoes",
      bgGradient: "from-violet-50 to-purple-100 dark:from-violet-950/70 dark:to-purple-900/70",
      icon: (
        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-300">
          <Footprints size={17} />
        </div>
      ),
    },
    {
      id: "trophies",
      name: "Awards",
      sublabel: "Trophies",
      href: "/products?search=trophies",
      bgGradient: "from-yellow-50 to-amber-100 dark:from-yellow-950/70 dark:to-amber-900/70",
      icon: (
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-300">
          <Trophy size={17} />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-[#f3f4f6] dark:bg-gray-900 py-1.5 border-b border-gray-300/70 dark:border-gray-800">
      <div className="flex items-center gap-2 px-2 overflow-x-auto scrollbar-none snap-x snap-mandatory">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl bg-gradient-to-b ${cat.bgGradient} border border-white/80 dark:border-gray-700/60 shadow-xs shrink-0 w-[68px] text-center hover:scale-102 transition-transform active:scale-98 snap-start relative`}
          >
            {/* Top Tag Badge */}
            {cat.badge && (
              <span className={`absolute -top-1.5 right-0.5 text-[8px] font-bold px-1 py-0.2 rounded-full shadow-xs ${cat.badgeBg}`}>
                {cat.badge}
              </span>
            )}

            <div className="my-0.5 flex items-center justify-center">
              {cat.icon}
            </div>

            <span className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">
              {cat.name}
            </span>
            <span className="text-[9px] text-gray-600 dark:text-gray-400 font-medium truncate max-w-[62px] leading-none mt-0.5">
              {cat.sublabel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
