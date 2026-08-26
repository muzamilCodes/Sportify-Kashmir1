"use client";

import { useState } from "react";
import { Volume2, VolumeX, Sparkles, Play, Activity } from "lucide-react";
import { soundEffects } from "@/lib/audioHelper";

interface BatSoundPlayerProps {
  batName?: string;
  variant?: "badge" | "full" | "card";
}

export default function BatSoundPlayer({
  batName = "Kashmir Willow Master Bat",
  variant = "full",
}: BatSoundPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeType, setActiveType] = useState<"sweet-spot" | "punch" | "edge">("sweet-spot");

  const handlePlayPing = (type: "sweet-spot" | "punch" | "edge") => {
    setActiveType(type);
    setIsPlaying(true);
    soundEffects.playBatPing(type);

    setTimeout(() => {
      setIsPlaying(false);
    }, 450);
  };

  if (variant === "badge") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handlePlayPing("sweet-spot");
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-[11px] font-black transition active:scale-95 cursor-pointer shadow-xs"
        title="Listen to Bat Sweet Spot Sound"
      >
        <Volume2 size={13} className={isPlaying ? "animate-bounce text-orange-500" : ""} />
        <span>{isPlaying ? "🎵 Playing Ping..." : "🔊 Listen Ping"}</span>
      </button>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 border border-orange-500/25 dark:border-orange-500/30 backdrop-blur-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
            <Volume2 size={16} className={isPlaying ? "animate-pulse" : ""} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Willow Ping &amp; Sound Test</span>
              <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-black uppercase">
                Interactive Audio
              </span>
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Listen to the acoustic resonance of leather ball impact
            </p>
          </div>
        </div>

        {/* Equalizer Visualizer Bars */}
        <div className="flex items-end gap-1 h-5 px-2">
          {[12, 20, 16, 24, 14, 18].map((h, i) => (
            <div
              key={i}
              className={`w-1 bg-orange-500 rounded-full transition-all duration-150 ${
                isPlaying ? "animate-pulse" : "opacity-40"
              }`}
              style={{
                height: isPlaying ? `${Math.max(6, (h * Math.random() + 8))}px` : "6px",
              }}
            />
          ))}
        </div>
      </div>

      {/* 3 Sound Select Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={() => handlePlayPing("sweet-spot")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer active:scale-95 ${
            isPlaying && activeType === "sweet-spot"
              ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30 scale-102"
              : "bg-white dark:bg-zinc-850 hover:bg-orange-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
          }`}
        >
          <span className="text-sm">🎯</span>
          <span className="font-extrabold text-[11px]">Sweet Spot</span>
          <span className="text-[9px] opacity-75">Crisp Monster Ping</span>
        </button>

        <button
          type="button"
          onClick={() => handlePlayPing("punch")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer active:scale-95 ${
            isPlaying && activeType === "punch"
              ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30 scale-102"
              : "bg-white dark:bg-zinc-850 hover:bg-orange-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
          }`}
        >
          <span className="text-sm">💥</span>
          <span className="font-extrabold text-[11px]">Power Drive</span>
          <span className="text-[9px] opacity-75">Heavy Impact Punch</span>
        </button>

        <button
          type="button"
          onClick={() => handlePlayPing("edge")}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer active:scale-95 ${
            isPlaying && activeType === "edge"
              ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30 scale-102"
              : "bg-white dark:bg-zinc-850 hover:bg-orange-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
          }`}
        >
          <span className="text-sm">⚡</span>
          <span className="font-extrabold text-[11px]">Edge Cut</span>
          <span className="text-[9px] opacity-75">High Pitch Glance</span>
        </button>
      </div>
    </div>
  );
}
