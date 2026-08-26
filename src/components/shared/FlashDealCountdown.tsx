"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, Flame, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";
import ProductImage from "@/components/ProductImage";

export default function FlashDealCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => String(num).padStart(2, "0");

  return (
    <section className="mb-14 cv-auto">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-650 via-orange-600 to-amber-600 text-white p-6 sm:p-10 shadow-2xl border border-red-500/40">
        {/* Background glow circle */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Urgency & Countdown Timer */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 text-white text-xs font-black uppercase tracking-wider backdrop-blur-xs">
                <Flame size={14} className="text-yellow-300 fill-yellow-300 animate-bounce" />
                <span>Midnight Flash Drop</span>
              </span>
              <span className="text-xs font-bold text-yellow-200">
                ⚡ 24-Hour Valley Express Delivery
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Handcrafted Sangam Willow Master Edition
            </h3>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xl">
              Thick 42mm edges, balanced duckbill pickup &amp; pre-knocked sweet spot. Limited batch drop for Valley tournament players.
            </p>

            {/* Live Ticking Countdown Clock Boxes */}
            <div className="pt-2 flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-18 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                <span className="text-xl sm:text-2xl font-black font-mono">
                  {formatDigit(timeLeft.hours)}
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-300">Hours</span>
              </div>
              <span className="text-2xl font-black text-white/80">:</span>
              <div className="flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-18 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                <span className="text-xl sm:text-2xl font-black font-mono">
                  {formatDigit(timeLeft.minutes)}
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-300">Mins</span>
              </div>
              <span className="text-2xl font-black text-white/80">:</span>
              <div className="flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-18 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20">
                <span className="text-xl sm:text-2xl font-black font-mono text-yellow-300">
                  {formatDigit(timeLeft.seconds)}
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-300">Secs</span>
              </div>
            </div>

            {/* Limited Stock Claim Bar */}
            <div className="space-y-1.5 max-w-md pt-1">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-yellow-200">🔥 86% Claimed</span>
                <span className="text-white">Only 4 Units Left in Srinagar Hub!</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden p-0.5">
                <div className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full w-[86%] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Column: Flash Price Card & Buy Button */}
          <div className="lg:col-span-5 bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/20 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-yellow-300 tracking-wider">
                  Flash Deal Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">₹1,999</span>
                  <span className="text-base text-white/60 line-through">₹3,999</span>
                  <span className="text-xs font-extrabold bg-yellow-400 text-black px-2 py-0.5 rounded-md">
                    50% OFF
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-yellow-300 font-bold">
                🏏
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/products?search=kashmir+willow"
                className="w-full py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                <Zap size={16} className="text-orange-600 fill-orange-600" />
                <span>Claim Flash Deal Now (₹1,999)</span>
              </Link>
              <p className="text-[11px] text-white/80 text-center font-medium">
                ✓ Cash on Delivery Available across all J&amp;K Pincodes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
