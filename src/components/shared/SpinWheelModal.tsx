"use client";

import { useState, useEffect } from "react";
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
  icon: string;
}

const SLICES: WheelSlice[] = [
  {
    label: "10% OFF",
    percent: 10,
    discount: "10% Instant Discount on All Gear",
    bg: "#ea580c",
    color: "#ffffff",
    icon: "🏏",
  },
  {
    label: "TRY AGAIN",
    percent: 0,
    discount: "Better Luck Next Time! Spin Again Tomorrow",
    bg: "#475569",
    color: "#ffffff",
    icon: "😔",
  },
  {
    label: "15% OFF",
    percent: 15,
    discount: "15% Mega Discount on Kashmir Willow",
    bg: "#f97316",
    color: "#ffffff",
    icon: "🔥",
  },
  {
    label: "10% OFF",
    percent: 10,
    discount: "10% Flat Discount on Sports Wear",
    bg: "#d97706",
    color: "#ffffff",
    icon: "⚡",
  },
  {
    label: "TRY AGAIN",
    percent: 0,
    discount: "Better Luck Next Time! Spin Again Tomorrow",
    bg: "#334155",
    color: "#ffffff",
    icon: "🎯",
  },
  {
    label: "12% OFF",
    percent: 12,
    discount: "12% Special Discount on Entire Order",
    bg: "#ef4444",
    color: "#ffffff",
    icon: "🏆",
  },
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
    // The center bisector of the winning slice (measured clockwise from 12 o'clock / 0 deg)
    const midAngle = winIndex * sliceAngle + sliceAngle / 2;

    // Target rotation: align midAngle exactly with the top pointer (0 deg / 12 o'clock)
    const baseSpins = 1800; // 5 full revolutions
    const currentMod = rotation % 360;
    const neededAngle = (360 - midAngle + 360) % 360;
    let additionalRotation = (360 - currentMod + neededAngle) % 360;
    if (additionalRotation === 0) additionalRotation = 360;

    const targetRotation = rotation + baseSpins + additionalRotation;
    setRotation(targetRotation);

    // Play spinning ticks
    const tickInterval = setInterval(() => {
      soundEffects.playWheelTick();
    }, 200);

    setTimeout(() => clearInterval(tickInterval), 3200);

    setTimeout(async () => {
      setIsSpinning(false);
      localStorage.setItem("sportify_last_spin_time", String(Date.now()));

      if (selected.percent === 0) {
        // Better Luck / Try Again: Absolutely NO coupon is generated or shown
        setBetterLuck(true);
        setActiveCoupon(null);
        toast.error("Better luck next time! You can spin again tomorrow.");
        return;
      }

      // Generate REAL single-use database coupon for this specific winning discount
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
          soundEffects.playCelebrationChime();
          toast.success(`🎉 You won ${selected.percent}% OFF! Use code ${fallbackCode}`);
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

  // Geometry for SVG Pie Slices
  const R = 120;
  const CX = 130;
  const CY = 130;

  const getCoordinatesForAngle = (angleDeg: number, radius = R) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + radius * Math.sin(rad),
      y: CY - radius * Math.cos(rad),
    };
  };

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full transition cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 shadow-inner">
              <Gift size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              Sportify Kashmir Lucky Spin
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[280px]">
              Spin the wheel to win 10% to 15% discount coupons. Each coupon is single-use and valid for 15 minutes!
            </p>

            {/* Wheel Container */}
            <div className="relative my-6 w-64 h-64 flex items-center justify-center select-none">
              {/* Pointer Indicator at Top (12 o'clock, pointing down) */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-xl">
                <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-md" />
                <div className="w-3 h-3 rounded-full bg-amber-300 -mt-6 border-2 border-amber-600 shadow-xs" />
              </div>

              {/* Rotating Wheel Container */}
              <div
                className="w-full h-full rounded-full shadow-2xl relative overflow-hidden"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 4s cubic-bezier(0.15, 0.85, 0.35, 1.02)" : "none",
                }}
              >
                <svg viewBox="0 0 260 260" className="w-full h-full">
                  <defs>
                    <filter id="sliceShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {/* Slices */}
                  {SLICES.map((s, idx) => {
                    const startAngle = idx * 60;
                    const endAngle = (idx + 1) * 60;
                    const midAngle = startAngle + 30;
                    const p1 = getCoordinatesForAngle(startAngle);
                    const p2 = getCoordinatesForAngle(endAngle);

                    const pathD = `M ${CX} ${CY} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;

                    return (
                      <g key={idx}>
                        {/* Slice Sector */}
                        <path
                          d={pathD}
                          fill={s.bg}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />

                        {/* Centered Spoke Content (Rotated along midAngle) */}
                        <g transform={`rotate(${midAngle}, ${CX}, ${CY})`}>
                          {/* Slice Icon */}
                          <text
                            x={CX}
                            y={CY - 90}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="12"
                            transform={`rotate(90, ${CX}, ${CY - 90})`}
                          >
                            {s.icon}
                          </text>

                          {/* Slice Label */}
                          <text
                            x={CX}
                            y={CY - 58}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={s.color}
                            fontSize={s.percent === 0 ? "8.5" : "11"}
                            fontWeight="900"
                            letterSpacing="0.4px"
                            transform={`rotate(90, ${CX}, ${CY - 58})`}
                            style={{ filter: "url(#sliceShadow)" }}
                          >
                            {s.label}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Outer Golden Ring with Accent Dots */}
                  <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f59e0b" strokeWidth="4" />
                  <circle cx={CX} cy={CY} r={R - 3} fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />

                  {/* Golden Outer Decorative Studs */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const dotPos = getCoordinatesForAngle(i * 30, R - 6);
                    return (
                      <circle
                        key={i}
                        cx={dotPos.x}
                        cy={dotPos.y}
                        r="2.5"
                        fill="#fef08a"
                        stroke="#b45309"
                        strokeWidth="0.8"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Center Hub */}
              <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-800 text-white font-black text-xs border-3 border-amber-400 shadow-2xl flex items-center justify-center z-20 pointer-events-none ring-2 ring-amber-300/30">
                <Sparkles size={16} className="text-amber-400 animate-spin duration-3000" />
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
              <div className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 space-y-2.5 animate-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto text-xl">
                  😔
                </div>
                <div>
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200 block">
                    Better Luck Next Time!
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    No coupon won on this spin. You can try your luck again tomorrow to win 10% to 15% discount coupons!
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
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
