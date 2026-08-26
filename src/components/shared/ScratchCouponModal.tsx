"use client";

import { useState, useEffect, useRef } from "react";
import { Gift, X, Sparkles, Copy, Check, Flame, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { soundEffects } from "@/lib/audioHelper";

export default function ScratchCouponModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScratched, setIsScratched] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const COUPON_CODE = "KASHMIR15";
  const DISCOUNT_TEXT = "15% OFF Everything";

  useEffect(() => {
    // Show automatically once every 24h if not scratched yet
    const hasSeen = localStorage.getItem("scratch_seen_v2");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Initialize Canvas Scratch Layer
  useEffect(() => {
    if (!isOpen || isScratched) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;

      // Draw metallic silver/orange gradient scratch layer
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#f97316");
      grad.addColorStop(0.5, "#ea580c");
      grad.addColorStop(1, "#c2410c");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Add shimmer pattern text on scratch layer
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ SCRATCH HERE WITH FINGER ✨", width / 2, height / 2 - 8);
      ctx.font = "11px sans-serif";
      ctx.fillText("Reveal Your Kashmir VIP Coupon", width / 2, height / 2 + 14);
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, isScratched]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2, false);
    ctx.fill();

    // Check scratch percentage threshold
    checkScratchPercentage(canvas, ctx);
  };

  const checkScratchPercentage = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentCount = 0;
      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) transparentCount++;
      }

      const percent = (transparentCount / (pixels.length / 16)) * 100;
      if (percent > 45 && !isScratched) {
        setIsScratched(true);
        soundEffects.playCelebrationChime();
        localStorage.setItem("scratch_seen_v2", "true");

        // Fire Confetti Cannon
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f97316", "#ef4444", "#fbbf24", "#ffffff"],
        });
      }
    } catch {}
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const copyCode = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      toast.success(`Coupon ${COUPON_CODE} copied! 15% discount applied at checkout.`);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      {/* Floating Trigger Pill on bottom-left */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 z-40 px-3.5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 border border-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-bounce"
        >
          <Gift size={16} className="animate-spin duration-3000" />
          <span>🎁 Scratch &amp; Win VIP Coupon</span>
        </button>
      )}

      {/* Main Scratch Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-zinc-900 text-white border border-orange-500/40 p-6 shadow-2xl space-y-4 text-center overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                localStorage.setItem("scratch_seen_v2", "true");
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800/80 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={12} />
                <span>Kashmir Athlete Mystery Gift</span>
              </span>
              <h3 className="text-xl font-black text-white">
                Scratch &amp; Unlock Discount!
              </h3>
              <p className="text-xs text-zinc-400">
                Swipe your finger or mouse across the card below to reveal your surprise discount.
              </p>
            </div>

            {/* Interactive Scratch Area */}
            <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-900 border-2 border-dashed border-orange-500/50 flex flex-col items-center justify-center p-4 shadow-inner select-none">
              {/* Underlying Revealed Coupon Reward */}
              <div className="space-y-1.5 pointer-events-none">
                <p className="text-xs font-black uppercase tracking-wider text-orange-400">
                  🎉 Congratulations!
                </p>
                <div className="text-2xl font-black text-white tracking-widest bg-orange-500/20 px-4 py-1 rounded-xl border border-orange-500/40">
                  {COUPON_CODE}
                </div>
                <p className="text-[11px] font-bold text-amber-300">
                  {DISCOUNT_TEXT} + Free Valley Delivery
                </p>
              </div>

              {/* Scratchable Canvas Layer */}
              {!isScratched && (
                <canvas
                  ref={canvasRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
              )}
            </div>

            {/* Action CTA */}
            {isScratched ? (
              <div className="space-y-2 pt-1 animate-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={copyCode}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition"
                >
                  {copied ? <Check size={16} className="text-white" /> : <Copy size={16} />}
                  <span>{copied ? "Coupon Code Copied!" : `Copy Code: ${COUPON_CODE}`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white font-semibold cursor-pointer underline"
                >
                  Start Shopping Now →
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400 font-medium">
                👆 Rub with finger / drag mouse across orange card to reveal!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
