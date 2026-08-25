"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Gift, Check, Copy, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface WheelSlice {
  label: string;
  code: string;
  discount: string;
  bg: string;
  color: string;
}

const SLICES: WheelSlice[] = [
  { label: "15% OFF", code: "KASHMIR15", discount: "15% Instant Discount", bg: "#f97316", color: "#ffffff" },
  { label: "₹150 OFF", code: "SPORTIFY150", discount: "₹150 Flat Off on ₹999+", bg: "#10b981", color: "#ffffff" },
  { label: "FREE SHIPPING", code: "FREESHIP", discount: "Free Valley Express Shipping", bg: "#3b82f6", color: "#ffffff" },
  { label: "10% OFF", code: "WILLOW10", discount: "10% Off on Cricket Gear", bg: "#8b5cf6", color: "#ffffff" },
  { label: "FREE GRIP", code: "FREEGIFT", discount: "Free Extra Rubber Grip with Bat", bg: "#ec4899", color: "#ffffff" },
  { label: "20% VIP", code: "KASHMIRVIP", discount: "20% Mega VIP Discount", bg: "#f59e0b", color: "#111827" },
];

export default function SpinWheelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [winningSlice, setWinningSlice] = useState<WheelSlice | null>(null);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user already won
    const savedWin = localStorage.getItem("spinWheelWin");
    if (savedWin) {
      try {
        setWinningSlice(JSON.parse(savedWin));
        setHasSpun(true);
      } catch {}
    }
  }, []);

  const handleSpin = async () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    setWinningSlice(null);

    // Pick a winning index (favor 15% or ₹150 OFF)
    const winIndex = Math.floor(Math.random() * SLICES.length);
    const selected = SLICES[winIndex];

    const sliceAngle = 360 / SLICES.length;
    // Calculate rotation: 5 full turns (1800 deg) + angle for the slice
    const targetRotation = 1800 + (360 - winIndex * sliceAngle - sliceAngle / 2);
    setRotation(targetRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      setHasSpun(true);
      setWinningSlice(selected);
      localStorage.setItem("spinWheelWin", JSON.stringify(selected));

      // Trigger Confetti
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      toast.success(`🎉 You won ${selected.discount}!`);
    }, 4000);
  };

  const handleCopyCode = () => {
    if (!winningSlice) return;
    navigator.clipboard.writeText(winningSlice.code);
    setCopied(true);
    toast.success(`Coupon code ${winningSlice.code} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Trigger Badge (Positioned Bottom-Left to avoid overlap) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-4 z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-1.5 text-xs font-black tracking-wide hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/40 ring-4 ring-amber-400/20 animate-pulse"
        aria-label="Spin and Win discounts"
      >
        <Gift size={16} className="animate-bounce" />
        <span className="inline">Spin & Win 🎁</span>
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
              Spin the wheel to unlock exclusive discounts & free perks on authentic sports gear!
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
                      className="absolute inset-0 origin-center flex items-start justify-center pt-2 font-black text-[10px] tracking-tight"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        backgroundColor: s.bg,
                        color: s.color,
                        clipPath: "polygon(50% 50%, 0% 0%, 100% 0%)",
                      }}
                    >
                      <span className="mt-2 block rotate-90 transform">{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Center Hub */}
              <div className="absolute w-12 h-12 rounded-full bg-gray-900 text-white font-black text-xs border-2 border-amber-400 shadow-xl flex items-center justify-center z-10 pointer-events-none">
                <Sparkles size={16} className="text-amber-400" />
              </div>
            </div>

            {/* Result or Spin Button */}
            {winningSlice ? (
              <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border border-orange-200 dark:border-orange-900/60 shadow-xs animate-in zoom-in-95 duration-200">
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                  🎉 Congratulations! You Won
                </span>
                <h4 className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                  {winningSlice.discount}
                </h4>

                {/* Promo Code Box */}
                <div className="my-3 flex items-center justify-between bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-dashed border-orange-400">
                  <div className="text-left">
                    <span className="text-[10px] text-gray-400 block font-medium">Coupon Code:</span>
                    <span className="text-sm font-mono font-black text-orange-600 tracking-wider">
                      {winningSlice.code}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Shop Now & Apply Code</span>
                  <ArrowRight size={14} />
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
