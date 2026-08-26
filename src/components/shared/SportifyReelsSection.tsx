"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  ShoppingBag,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { soundEffects } from "@/lib/audioHelper";

interface SportifyReel {
  id: string;
  title: string;
  author: string;
  location: string;
  views: string;
  likes: number;
  thumbnail: string;
  badge: string;
  product: {
    name: string;
    price: number;
    link: string;
    image: string;
  };
}

const REELS_DATA: SportifyReel[] = [
  {
    id: "reel-1",
    title: "10,000 Stroke Machine Knocking at Sangam Willow Factory 🏏",
    author: "Master Craftsman Bashir",
    location: "Sangam, Anantnag",
    views: "42.8K",
    likes: 3840,
    thumbnail: "/hero-banner-1.webp",
    badge: "Bat Crafting",
    product: {
      name: "SG Player Edition Kashmir Willow Bat",
      price: 3499,
      link: "/products?search=kashmir+willow",
      image: "/hero-banner-1.webp",
    },
  },
  {
    id: "reel-2",
    title: "Top Corner Golazo on Srinagar Synthetic Turf Ground ⚽🔥",
    author: "Kashmir Football League",
    location: "TRC Ground, Srinagar",
    views: "31.2K",
    likes: 2910,
    thumbnail: "/hero-banner-2.webp",
    badge: "Match Highlight",
    product: {
      name: "Puma Future FG/AG Football Boots",
      price: 5999,
      link: "/products?search=football",
      image: "/hero-banner-2.webp",
    },
  },
  {
    id: "reel-3",
    title: "105 Meter Monster Six Over The Chinar Trees in Anantnag 🚀",
    author: "Valley Super League",
    location: "Bijebehara, Kashmir",
    views: "58.6K",
    likes: 6120,
    thumbnail: "/hero-banner-3.webp",
    badge: "Monster Six",
    product: {
      name: "SS Ton Matrix Willow Bat",
      price: 7499,
      link: "/products?search=cricket",
      image: "/hero-banner-3.webp",
    },
  },
  {
    id: "reel-4",
    title: "Testing 28lbs String Tension on Carbon Frame at -2°C 🏸❄️",
    author: "Kashmir Racket Academy",
    location: "Indoor Hall, Baramulla",
    views: "24.5K",
    likes: 1980,
    thumbnail: "/hero-banner-1.webp",
    badge: "Gear Test",
    product: {
      name: "Yonex Astrox 99 Pro Racket",
      price: 4999,
      link: "/products?search=badminton",
      image: "/hero-banner-1.webp",
    },
  },
];

export default function SportifyReelsSection() {
  const [activePlaying, setActivePlaying] = useState<string | null>(null);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});

  const togglePlay = (id: string) => {
    if (activePlaying === id) {
      setActivePlaying(null);
    } else {
      setActivePlaying(id);
      soundEffects.playBatPing("sweet-spot");
    }
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedReels((prev) => ({ ...prev, [id]: !prev[id] }));
    toast.success(likedReels[id] ? "Unliked reel" : "Liked Kashmir Action Reel! ❤️");
  };

  return (
    <section className="mb-14 cv-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-500/15 to-orange-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-wider mb-2">
            <Flame size={13} className="text-red-500 fill-red-500 animate-pulse" />
            <span>Kashmir Valley Action Reels</span>
          </div>
          <h2 className="sk-section-title text-[22px] sm:text-[26px] md:text-[30px] text-zinc-900 dark:text-white">
            Watch Gear in Action &amp; Buy
          </h2>
          <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real match highlights, bat knocking sounds, and turf skills across Jammu &amp; Kashmir
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline group shrink-0"
        >
          <span>Explore All Sports Catalog</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 4-Reel Responsive Grid (9:16 Vertical Video Look) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {REELS_DATA.map((reel) => {
          const isLiked = Boolean(likedReels[reel.id]);
          const isPlaying = activePlaying === reel.id;

          return (
            <div
              key={reel.id}
              onClick={() => togglePlay(reel.id)}
              className="relative aspect-[9/16] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-zinc-800"
            >
              {/* Background Thumbnail Image with zoom on hover */}
              <img
                src={reel.thumbnail}
                alt={reel.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? "scale-110" : "group-hover:scale-105"
                }`}
              />

              {/* Dark Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />

              {/* Top Tag & Views */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                  {reel.badge}
                </span>
                <span className="text-[10px] font-bold text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                  👁️ {reel.views}
                </span>
              </div>

              {/* Center Play/Pause Pulsing Button */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div
                  className={`w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all ${
                    isPlaying ? "opacity-0 scale-75" : "opacity-90 group-hover:scale-110"
                  }`}
                >
                  <Play size={20} className="fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Right Side Social Engagement Bar (Heart & Sound) */}
              <div className="absolute right-2.5 bottom-20 z-20 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => toggleLike(reel.id, e)}
                  className="flex flex-col items-center gap-0.5 text-white cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-transform active:scale-125 ${
                      isLiked ? "bg-red-600 text-white" : "bg-black/60 text-white hover:bg-black/80"
                    }`}
                  >
                    <Heart size={16} className={isLiked ? "fill-white text-white" : ""} />
                  </div>
                  <span className="text-[10px] font-bold">
                    {reel.likes + (isLiked ? 1 : 0)}
                  </span>
                </button>

                <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                  {isPlaying ? (
                    <Volume2 size={16} className="text-orange-400 animate-pulse" />
                  ) : (
                    <VolumeX size={16} className="text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Bottom Reel Content & Direct Shop Tag */}
              <div className="absolute bottom-3 inset-x-3 z-10 space-y-2">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-amber-300">
                    📍 {reel.location} • {reel.author}
                  </p>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug drop-shadow-md">
                    {reel.title}
                  </h4>
                </div>

                {/* Direct Pinned Product Tag Card */}
                <Link
                  href={reel.product.link}
                  onClick={(e) => e.stopPropagation()}
                  className="block p-2 rounded-xl bg-white/95 text-zinc-900 backdrop-blur-md hover:bg-white transition active:scale-97 shadow-lg group/prod"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold text-zinc-900 truncate">
                        {reel.product.name}
                      </p>
                      <p className="text-[11px] font-black text-orange-600">
                        ₹{reel.product.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase shrink-0 flex items-center gap-1">
                      <ShoppingBag size={11} />
                      <span>Buy</span>
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
