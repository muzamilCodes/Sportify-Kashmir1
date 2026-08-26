"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Sparkles, Gift, Check, Copy, ArrowRight, Clock, Flame, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { soundEffects } from "@/lib/audioHelper";

interface WheelSlice {
  label: string;
  percent: number;
  discount: string;
  bg: string;
  color: string;
}

const SLICES: WheelSlice[] = [
  { label: "10% OFF", percent: 10, discount: "10% Instant Discount on All Gear", bg: "#ea580c", color: "#ffffff" },
  { label: "BETTER LUCK", percent: 0, discount: "Better Luck Next Time! Spin Again Tomorrow", bg: "#475569", color: "#ffffff" },
  { label: "15% OFF", percent: 15, discount: "15% Mega Discount on Kashmir Willow", bg: "#f97316", color: "#ffffff" },
  { label: "10% OFF", percent: 10, discount: "10% Flat Discount on Sports Wear", bg: "#d97706", color: "#ffffff" },
  { label: "BETTER LUCK", percent: 0, discount: "Better Luck Next Time! Spin Again Tomorrow", bg: "#334155", color: "#ffffff" },
  { label: "12% OFF", percent: 12, discount: "12% Special Discount on Entire Order", bg: "#ef4444", color: "#ffffff" },
];

interface ActiveSpinCoupon {
  code: string;
  discountPercent: number;
  discountTitle: string;
  expiresAt: number; // timestamp
}

export default function SpinWheelModal() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<ActiveSpinCoupon | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [betterLuck, setBetterLuck] = useState(false);
  const [hasAlreadySpunToday, setHasAlreadySpunToday] = useState(false);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Check 1-spin daily limit and active coupons
  useEffect(() => {
    const lastSpunTime = localStorage.getItem("sportify_last_spin_time");
    if (lastSpunTime && Date.now() - Number(lastSpunTime) < 24 * 60 * 60 * 1000) {
      setHasAlreadySpunToday(true);
    } else {
      setHasAlreadySpunToday(false);
    }
  }, [isOpen]);

  // Load existing coupon and setup 15-min countdown
  useEffect(() => {
    const saved = localStorage.getItem("sportify_spin_coupon_v3");
    if (saved) {
      try {
        const parsed: ActiveSpinCoupon = JSON.parse(saved);
        const now = Date.now();
        if (parsed.expiresAt > now) {
          setActiveCoupon(parsed);
          setRemainingSeconds(Math.floor((parsed.expiresAt - now) / 1000));
        } else {
          setIsExpired(true);
          localStorage.removeItem("sportify_spin_coupon_v3");
        }
      } catch {}
    }
  }, []);

  // Ticking Timer
  useEffect(() => {
    if (!activeCoupon) return;

    const interval = setInterval(() => {
      const diff = Math.floor((activeCoupon.expiresAt - Date.now()) / 1000);
      if (diff <= 0) {
        setRemainingSeconds(0);
        setIsExpired(true);
        setActiveCoupon(null);
        localStorage.removeItem("sportify_spin_coupon_v3");
        clearInterval(interval);
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCoupon]);

  const handleSpin = async () => {
    if (isSpinning || activeCoupon) return;

    // Check if user spun in the last 24 hours
    const lastSpunTime = localStorage.getItem("sportify_last_spin_time");
    if (lastSpunTime && Date.now() - Number(lastSpunTime) < 24 * 60 * 60 * 1000 && !activeCoupon) {
      toast.error("You have already spun today! Come back tomorrow.");
      return;
    }

    setIsSpinning(true);
    setBetterLuck(false);

    // Pick a winning index
    const winIndex = Math.floor(Math.random() * SLICES.length);
    const selected = SLICES[winIndex];

    const sliceAngle = 360 / SLICES.length;
    // Calculate rotation: 5 full turns (1800 deg) + angle for the slice
    const targetRotation = 1800 + (360 - winIndex * sliceAngle - sliceAngle / 2);
    setRotation(targetRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      localStorage.setItem("sportify_last_spin_time", String(Date.now()));

      if (selected.percent === 0) {
        // Better Luck Next Time
        setBetterLuck(true);
        toast.error("Better luck next time! You can spin again tomorrow.");
        return;
      }

      // Generate REAL single-use database coupon for this specific user
      try {
        const res = await fetch(`${API_URL}/coupon/spin-generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discountPercent: selected.percent }),
        });

        const data = await res.json();
        if (data.success && data.data?.code) {
          const newCouponData: ActiveSpinCoupon = {
            code: data.data.code,
            discountPercent: selected.percent,
            discountTitle: selected.discount,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes strict
          };

          setActiveCoupon(newCouponData);
          setRemainingSeconds(15 * 60);
          setIsExpired(false);
          localStorage.setItem("sportify_spin_coupon_v3", JSON.stringify(newCouponData));

          soundEffects.playCelebrationChime();

          // Confetti blast
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#f97316", "#ef4444", "#fbbf24", "#ffffff"],
            });
          } catch {}

          toast.success(`🎉 You won ${selected.percent}% OFF! Use code ${data.data.code}`);
        } else {
          // Fallback if backend error
          const fallbackCode = `SPIN${selected.percent}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const newCouponData: ActiveSpinCoupon = {
            code: fallbackCode,
            discountPercent: selected.percent,
            discountTitle: selected.discount,
            expiresAt: Date.now() + 15 * 60 * 1000,
          };
          setActiveCoupon(newCouponData);
          setRemainingSeconds(15 * 60);
          localStorage.setItem("sportify_spin_coupon_v3", JSON.stringify(newCouponData));
        }
      } catch (err) {
        console.error("Spin coupon error:", err);
      }
    }, 4000);
  };

  const handleCopyCode = () => {
    if (!activeCoupon) return;
    navigator.clipboard.writeText(activeCoupon.code);
    setCopied(true);
    toast.success(`Coupon code ${activeCoupon.code} copied!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Badge on Bottom-Left */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-4 z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-1.5 text-xs font-black tracking-wide hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/40 ring-4 ring-amber-400/20 animate-pulse"
        aria-label="Spin and Win discounts"
      >
        <Gift size={16} className="animate-bounce" />
        {activeCoupon ? (
          <span className="inline-flex items-center gap-1 font-mono">
            <span>🎁 {activeCoupon.discountPercent}% OFF</span>
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px] text-yellow-300">
              {formatTimer(remainingSeconds)}
            </span>
          </span>
        ) : (
          <span className="inline">Spin &amp; Win 🎁</span>
        )}
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <Gift size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Sportify Kashmir Lucky Spin
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[280px]">
              Spin the wheel to win 10% to 15% discount coupons. Each coupon is single-use and valid for 15 minutes!
            </p>

            {/* Wheel Container */}
            <div className="relative my-6 w-56 h-56 flex items-center justify-center">
              {/* Pointer Indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

              {/* Rotating Wheel Circle */}
              <div
                className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl relative overflow-hidden transition-all ease-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionDuration: isSpinning ? "4s" : "0s",
                }}
              >
                {SLICES.map((s, idx) => {
                  const angle = (360 / SLICES.length) * idx;
                  return (
                    <div
                      key={idx}
                      className="absolute inset-0 origin-center flex items-start justify-center pt-2 font-black text-[9px] tracking-tight"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: s.bg,
                        color: s.color,
                        clipPath: "polygon(50% 50%, 0% 0%, 100% 0%)",
                      }}
                    >
                      <span className="mt-2 block rotate-90 transform uppercase font-extrabold">
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center Hub */}
              <div className="absolute w-12 h-12 rounded-full bg-gray-900 text-white font-black text-xs border-2 border-amber-400 shadow-xl flex items-center justify-center z-10 pointer-events-none">
                <Sparkles size={16} className="text-amber-400" />
              </div>
            </div>

            {/* Active Won Coupon State */}
            {activeCoupon ? (
              <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border border-orange-200 dark:border-orange-900/60 shadow-xs animate-in zoom-in-95 duration-200 space-y-3">
                <div>
                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    🎉 Congratulations! You Won {activeCoupon.discountPercent}% OFF
                  </span>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white mt-0.5">
                    {activeCoupon.discountTitle}
                  </h4>
                </div>

                {/* 15-Minute Expiry Countdown Bar */}
                <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono font-black">
                  <Clock size={14} className="animate-pulse" />
                  <span>Code Expires In: {formatTimer(remainingSeconds)}</span>
                </div>

                {/* Unique Promo Code Box */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-dashed border-orange-400">
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 block font-medium">Your Unique Code (Single-Use):</span>
                    <span className="text-base font-mono font-black text-orange-600 tracking-wider">
                      {activeCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 transition cursor-pointer active:scale-95"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                  🔒 Single-device protection: Only you can use this code at checkout on min order ₹499.
                </p>

                <button
                  onClick={() => {
                    handleCopyCode();
                    setIsOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full py-2.5 bg-gray-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Shop Now &amp; Apply at Checkout</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : betterLuck ? (
              <div className="w-full p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  😔 Better Luck Next Time!
                </span>
                <p className="text-[11px] text-gray-500">
                  You can spin the wheel again tomorrow to win 10% or 15% discount coupons.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  Continue Browsing Gear
                </button>
              </div>
            ) : isExpired ? (
              <div className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 space-y-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  ⏰ Previous Coupon Expired
                </span>
                <p className="text-[11px] text-gray-500">
                  The 15-minute validity window has expired. You can spin again tomorrow!
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : hasAlreadySpunToday ? (
              <div className="w-full p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-center space-y-1.5 animate-in zoom-in-95 duration-200">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 block">
                  🛑 Daily Limit: 1 Spin Per User
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  You have already used your free lucky spin for today. Come back tomorrow for another chance!
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full mt-2 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-500 hover:to-red-600 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={18} />
                <span>{isSpinning ? "Spinning the Wheel..." : "Spin the Wheel Now!"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
