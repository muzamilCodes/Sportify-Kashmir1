"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Flame, 
  Footprints, 
  Trophy,
  Dumbbell,
  Goal,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CricketIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11.5 12.5 6 18c-2.5-1.5-5-.5-7 2 2.5 1.5 5 .5 7-2l5.5-5.5Z" />
    <path d="m12 12 5.5-5.5c2.5 1.5 5 .5 7-2-2.5-1.5-5-.5-7 2L12 12Z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const ShuttlecockIcon = ({ size = 18 }: { size?: number }) => (
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
  borderColor: string;
  badge?: string;
  badgeBg?: string;
  icon: React.ReactNode;
}

export default function AmazonQuickCategories() {
  const { t } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories: QuickCategory[] = [
    {
      id: "pay",
      name: "Pay",
      sublabel: "Sportify Pay",
      href: "/profile?tab=wallet",
      bgGradient: "from-amber-500/15 via-yellow-500/10 to-amber-500/5 dark:from-amber-950/60 dark:to-yellow-950/60",
      borderColor: "border-amber-400/50 dark:border-amber-600/50",
      badge: "₹50 Back",
      badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-black",
      icon: (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ffc220] to-amber-300 flex items-center justify-center shadow-xs border border-amber-400">
          <span className="text-[10px] font-black text-gray-950 tracking-tighter">pay</span>
        </div>
      ),
    },
    {
      id: "blog",
      name: "Blog",
      sublabel: "Sports Guides",
      href: "/blog",
      bgGradient: "from-orange-500/15 via-amber-500/10 to-orange-500/5 dark:from-orange-950/60 dark:to-amber-950/60",
      borderColor: "border-orange-400/50 dark:border-orange-600/50",
      badge: "NEW",
      badgeBg: "bg-gradient-to-r from-orange-500 to-red-500 text-white font-black",
      icon: (
        <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-300 flex items-center justify-center border border-orange-400/30">
          <BookOpen size={16} />
        </div>
      ),
    },
    {
      id: "cricket",
      name: "Cricket",
      sublabel: "Willow Bats",
      href: "/products?search=cricket",
      bgGradient: "from-emerald-500/15 via-green-500/10 to-emerald-500/5 dark:from-emerald-950/60 dark:to-green-950/60",
      borderColor: "border-emerald-400/50 dark:border-emerald-600/50",
      badge: "Pure",
      badgeBg: "bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold",
      icon: (
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center border border-emerald-400/30">
          <CricketIcon size={16} />
        </div>
      ),
    },
    {
      id: "deals",
      name: "Bazaar",
      sublabel: "Crazy Deals",
      href: "/sale",
      bgGradient: "from-rose-500/15 via-red-500/10 to-pink-500/5 dark:from-rose-950/60 dark:to-red-950/60",
      borderColor: "border-red-400/50 dark:border-red-600/50",
      badge: "70% OFF",
      badgeBg: "bg-gradient-to-r from-red-600 to-rose-600 text-white font-black animate-pulse",
      icon: (
        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-400/30">
          <Flame size={16} className="text-red-500 fill-red-500" />
        </div>
      ),
    },
    {
      id: "football",
      name: "Football",
      sublabel: "Match Gear",
      href: "/products?search=football",
      bgGradient: "from-sky-500/15 via-blue-500/10 to-sky-500/5 dark:from-sky-950/60 dark:to-blue-950/60",
      borderColor: "border-sky-400/50 dark:border-sky-600/50",
      badge: "Top Gear",
      badgeBg: "bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold",
      icon: (
        <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-300 flex items-center justify-center border border-sky-400/30">
          <Goal size={16} />
        </div>
      ),
    },
    {
      id: "badminton",
      name: "Badminton",
      sublabel: "Rackets",
      href: "/products?search=badminton",
      bgGradient: "from-teal-500/15 via-cyan-500/10 to-teal-500/5 dark:from-teal-950/60 dark:to-cyan-950/60",
      borderColor: "border-teal-400/50 dark:border-teal-600/50",
      badge: "Pro",
      badgeBg: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold",
      icon: (
        <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center border border-teal-400/30">
          <ShuttlecockIcon size={16} />
        </div>
      ),
    },
    {
      id: "gym",
      name: "Gym",
      sublabel: "Fitness Gear",
      href: "/products?search=gym",
      bgGradient: "from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:from-amber-950/60 dark:to-orange-950/60",
      borderColor: "border-amber-400/50 dark:border-amber-600/50",
      icon: (
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center border border-amber-400/30">
          <Dumbbell size={16} />
        </div>
      ),
    },
    {
      id: "shoes",
      name: "Shoes",
      sublabel: "Spikes & Turf",
      href: "/products?search=shoes",
      bgGradient: "from-violet-500/15 via-purple-500/10 to-violet-500/5 dark:from-violet-950/60 dark:to-purple-950/60",
      borderColor: "border-violet-400/50 dark:border-violet-600/50",
      badge: "Studs",
      badgeBg: "bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold",
      icon: (
        <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-300 flex items-center justify-center border border-violet-400/30">
          <Footprints size={16} />
        </div>
      ),
    },
    {
      id: "trophies",
      name: "Awards",
      sublabel: "Trophies",
      href: "/products?search=trophies",
      bgGradient: "from-yellow-500/15 via-amber-500/10 to-yellow-500/5 dark:from-yellow-950/60 dark:to-amber-950/60",
      borderColor: "border-yellow-400/50 dark:border-yellow-600/50",
      badge: "Cup",
      badgeBg: "bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold",
      icon: (
        <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-amber-600 dark:text-amber-300 flex items-center justify-center border border-yellow-400/30">
          <Trophy size={16} />
        </div>
      ),
    },
  ];

  // Auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const autoScroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && scrollRef.current) {
        const el = scrollRef.current;
        el.scrollLeft += (35 * delta) / 1000;

        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }

      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  // Manual scroll triggers
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: "smooth" });
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 3000);
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 3000);
    }
  };

  // Duplicate items for infinite seamless right-to-left loop
  const displayItems = [...categories, ...categories, ...categories];

  return (
    <div
      className="w-full bg-[#f3f4f6]/95 dark:bg-gray-900/95 py-2 border-b border-gray-300/80 dark:border-gray-800 relative overflow-hidden select-none group/ribbon"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Left Quick Navigation Arrow Button */}
      <button
        type="button"
        onClick={handleScrollLeft}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-85 group-hover/ribbon:opacity-100"
        aria-label="Scroll categories left"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Right Quick Navigation Arrow Button */}
      <button
        type="button"
        onClick={handleScrollRight}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer opacity-85 group-hover/ribbon:opacity-100"
        aria-label="Scroll categories right"
      >
        <ChevronRight size={16} />
      </button>

      {/* Edge Gradient Masks for Smooth Fade In/Out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#f3f4f6] dark:from-gray-900 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#f3f4f6] dark:from-gray-900 to-transparent z-10" />

      {/* Right-to-Left Continuous Moving Track with Instant Manual Scroll */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto scrollbar-none px-6 py-0.5 scroll-smooth"
      >
        {displayItems.map((cat, idx) => (
          <Link
            key={`${cat.id}-${idx}`}
            href={cat.href}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-b ${cat.bgGradient} bg-white/70 dark:bg-gray-800/70 backdrop-blur-xs border ${cat.borderColor} shadow-xs shrink-0 w-[72px] sm:w-[76px] text-center hover:scale-106 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 relative group`}
          >
            {/* Top Badge */}
            {cat.badge && (
              <span
                className={`absolute -top-2 right-0.5 text-[7.5px] font-black px-1.5 py-0.2 rounded-full shadow-xs uppercase tracking-tighter ${cat.badgeBg} border border-white/40 dark:border-black/30`}
              >
                {cat.badge}
              </span>
            )}

            {/* Icon */}
            <div className="my-0.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              {cat.icon}
            </div>

            {/* Main Label */}
            <span className="text-[11px] font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              {cat.name}
            </span>

            {/* Sublabel */}
            <span className="text-[8.5px] font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[66px] leading-none mt-0.5">
              {cat.sublabel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
