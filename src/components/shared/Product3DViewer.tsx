"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Rotate3d,
  Sparkles,
  Maximize2,
  Minimize2,
  Info,
  CheckCircle2,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import ProductImage from "@/components/ProductImage";

interface Hotspot {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  title: string;
  desc: string;
  icon: string;
}

interface Product3DViewerProps {
  product: {
    _id: string;
    name: string;
    productImgUrls?: string[];
    price?: number;
  };
  onClose?: () => void;
}

const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    id: "handle",
    x: 50,
    y: 18,
    title: "12-Piece Cane Handle",
    desc: "Imported Singapore cane with 3 rubber inserts for maximum shock absorption and zero sting on mishits.",
    icon: "🏏",
  },
  {
    id: "edge",
    x: 68,
    y: 48,
    title: "42mm Massive Power Edges",
    desc: "Thick curved edge profile engineered to preserve blade mass for boundary power off miscues.",
    icon: "⚡",
  },
  {
    id: "sweetspot",
    x: 50,
    y: 62,
    title: "Extended Mid-Low Sweet Spot",
    desc: "Handcrafted convex spine curvature optimized for low Kashmir pitches and hard leather balls.",
    icon: "🎯",
  },
  {
    id: "toe",
    x: 50,
    y: 92,
    title: "Damp-Proof Toe Guard",
    desc: "Pre-fitted vulcanized rubber toe guard preventing moisture seepage from wet Kashmir morning dew.",
    icon: "🛡️",
  },
];

export default function Product3DViewer({ product, onClose }: Product3DViewerProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Smooth Auto-Rotate Animation
  useEffect(() => {
    if (!autoRotate || isDragging) return;

    let angle = rotation.y;
    const animate = () => {
      angle = (angle + 0.4) % 360;
      setRotation((prev) => ({ ...prev, y: angle }));
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [autoRotate, isDragging]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setRotation({
      x: Math.max(-25, Math.min(25, dragStartRef.current.rotX - deltaY * 0.3)),
      y: (dragStartRef.current.rotY + deltaX * 0.6) % 360,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
    setZoomLevel(1);
    setAutoRotate(true);
    setActiveHotspot(null);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-gray-950 via-zinc-900 to-black text-white border border-zinc-800 shadow-2xl p-4 sm:p-6 select-none">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-20 relative mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <Rotate3d size={18} className="animate-spin duration-10000" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>Interactive 3D / 360° Inspection</span>
              <span className="text-[10px] bg-gradient-to-r from-orange-500 to-red-500 text-white font-black px-2 py-0.5 rounded-full uppercase">
                4D Physics
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Drag to rotate 360° • Tap glowing pins to inspect master craft details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              autoRotate
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
            }`}
          >
            <Rotate3d size={13} />
            <span>{autoRotate ? "Auto-Spin: ON" : "Auto-Spin: OFF"}</span>
          </button>
          <button
            type="button"
            onClick={resetRotation}
            className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 border border-zinc-700 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* 3D Viewport Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full h-80 sm:h-[420px] rounded-2xl bg-radial from-zinc-850 via-zinc-900 to-black flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing border border-zinc-800/80 shadow-inner"
        style={{ perspective: "1000px" }}
      >
        {/* Dynamic Studio Ambient Lighting & Specular Reflection Grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-red-500/5 pointer-events-none" />
        <div
          className="absolute -top-32 -left-32 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none transition-transform duration-300"
          style={{
            transform: `translate(${rotation.y * 0.4}px, ${rotation.x * 0.4}px)`,
          }}
        />

        {/* 3D Rotating Product Stage */}
        <div
          className="relative w-52 sm:w-64 aspect-[1/2] transition-transform duration-75 flex items-center justify-center"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoomLevel})`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Main Bat Image */}
          <div className="relative w-full h-full p-4 flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]">
            <ProductImage
              product={product}
              alt={product.name}
              priority
              className="w-full h-full object-contain pointer-events-none select-none"
            />
          </div>

          {/* Interactive Inspection Hotspots Pins */}
          {DEFAULT_HOTSPOTS.map((spot) => (
            <button
              key={spot.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(activeHotspot?.id === spot.id ? null : spot);
              }}
              style={{
                top: `${spot.y}%`,
                left: `${spot.x}%`,
                transform: "translate(-50%, -50%) translateZ(30px)",
              }}
              className="absolute z-30 group cursor-pointer"
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500 text-white text-[10px] font-black items-center justify-center shadow-lg border border-white/50 group-hover:scale-125 transition-transform">
                  {spot.icon}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Active Hotspot Info Overlay Card */}
        {activeHotspot && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl border border-orange-500/40 shadow-2xl text-left animate-in slide-in-from-bottom-3 duration-200 z-40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span>{activeHotspot.icon}</span>
                <span>{activeHotspot.title}</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveHotspot(null)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              {activeHotspot.desc}
            </p>
          </div>
        )}

        {/* Rotation Degree Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] font-mono font-bold text-zinc-400 border border-white/10 flex items-center gap-1.5">
          <Rotate3d size={11} className="text-orange-400" />
          <span>Angle: {Math.round((rotation.y % 360 + 360) % 360)}°</span>
        </div>
      </div>

      {/* Footer Feature Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-center">
        <div className="p-2 rounded-xl bg-zinc-850 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-300 block">7-9 Straight Grains</span>
          <span className="text-[9px] text-zinc-500">Natural Salix Timber</span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-850 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-300 block">42mm Thick Edge</span>
          <span className="text-[9px] text-zinc-500">Massive Power Profile</span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-850 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-300 block">Duckbill Balance</span>
          <span className="text-[9px] text-zinc-500">Feather-light Pickup</span>
        </div>
        <div className="p-2 rounded-xl bg-zinc-850 border border-zinc-800">
          <span className="text-[11px] font-bold text-zinc-300 block">Sangam Crafted</span>
          <span className="text-[9px] text-zinc-500">100% Genuine Certified</span>
        </div>
      </div>
    </div>
  );
}
