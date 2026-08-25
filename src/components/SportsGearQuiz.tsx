"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, RotateCcw, Check, Trophy, Flame } from "lucide-react";

interface QuestionOption {
  id: string;
  label: string;
  sub: string;
  icon: string;
}

export default function SportsGearQuiz() {
  const [step, setStep] = useState<number>(1);
  const [sport, setSport] = useState<string>("");
  const [style, setStyle] = useState<string>("");
  const [surface, setSurface] = useState<string>("");
  const [result, setResult] = useState<{
    title: string;
    description: string;
    productName: string;
    price: string;
    image: string;
    link: string;
    badge: string;
  } | null>(null);

  const handleSelectSport = (id: string) => {
    setSport(id);
    setStep(2);
  };

  const handleSelectStyle = (id: string) => {
    setStyle(id);
    setStep(3);
  };

  const handleSelectSurface = (id: string) => {
    setSurface(id);
    computeResult(sport, style, id);
    setStep(4);
  };

  const computeResult = (selectedSport: string, selectedStyle: string, selectedSurface: string) => {
    if (selectedSport === "cricket") {
      if (selectedSurface === "leather" || selectedStyle === "power") {
        setResult({
          title: "Hard Hitter's Choice",
          description: "Thick 40mm+ edges, monster middle profile & feather-light pickup handcrafted in Sangam.",
          productName: "SG Player Edition Kashmir Willow Cricket Bat",
          price: "₹3,499",
          image: "/hero-banner-1.webp",
          link: "/products?search=kashmir+willow",
          badge: "🏏 100% Handcrafted Sangam Willow",
        });
      } else {
        setResult({
          title: "Stroke Maker's Precision Bat",
          description: "Balanced spine with rounded toe for maximum timing against heavy tennis wind balls.",
          productName: "SS Gladiator Kashmir Willow Match Bat",
          price: "₹2,299",
          image: "/hero-banner-1.webp",
          link: "/products?search=cricket",
          badge: "🏏 Super Balanced Pickup",
        });
      }
    } else if (selectedSport === "football") {
      setResult({
        title: "Turf & Hard Ground Match Setup",
        description: "High-traction conical studs for TRC Turf & hard Kashmiri grounds, paired with FIFA match ball.",
        productName: "Nike Hard Ground Cleats + Flight Match Football",
        price: "₹4,899",
        image: "/hero-banner-2.webp",
        link: "/products?search=football",
        badge: "⚽ FIFA Spec Match Approved",
      });
    } else if (selectedSport === "gym") {
      setResult({
        title: "All-in-One Home Strength Kit",
        description: "Heavy rubber hex dumbbells, multi-loop resistance bands and leather weightlifting support.",
        productName: "Cosco Rubber Hex Dumbbell 10kg Set + Bands",
        price: "₹3,299",
        image: "/hero-banner-3.webp",
        link: "/products?search=gym",
        badge: "🏋️ Strength & Conditioning",
      });
    } else {
      setResult({
        title: "High-Tension Attack Badminton Racket",
        description: "Carbon graphite frame with 30lbs string tension support and non-marking court shoes.",
        productName: "Yonex Astrox 99 Pro Graphite + Mavis 350",
        price: "₹4,299",
        image: "/hero-banner-3.webp",
        link: "/products?search=badminton",
        badge: "🏸 Attack & Control Specialist",
      });
    }
  };

  const handleReset = () => {
    setStep(1);
    setSport("");
    setStyle("");
    setSurface("");
    setResult(null);
  };

  return (
    <div className="w-full my-8 bg-gradient-to-r from-[#131921] via-[#1a2332] to-[#0d131a] text-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.8 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Sparkles size={12} />
            30-Second AI Sports Selector
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5">
            Find Your Ideal Sports Equipment
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Answer 3 quick questions to get the best gear matched for Kashmiri grounds
          </p>
        </div>

        {step > 1 && (
          <button
            onClick={handleReset}
            className="self-start sm:self-auto text-xs text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
          >
            <RotateCcw size={13} />
            <span>Restart Quiz</span>
          </button>
        )}
      </div>

      {/* Step 1: Sport Selection */}
      {step === 1 && (
        <div className="relative z-10 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-gray-200 mb-3">1. Select Your Sport:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "cricket", label: "Cricket", sub: "Willow Bats & Kit", icon: "🏏" },
              { id: "football", label: "Football", sub: "Studs & Match Balls", icon: "⚽" },
              { id: "gym", label: "Gym & Fitness", sub: "Weights & Workouts", icon: "🏋️" },
              { id: "badminton", label: "Badminton", sub: "Rackets & Shuttles", icon: "🏸" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectSport(item.id)}
                className="bg-white/5 hover:bg-white/15 border border-white/10 hover:border-orange-500 p-4 rounded-2xl flex flex-col items-center text-center transition hover:scale-102 active:scale-98 cursor-pointer group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">{item.label}</span>
                <span className="text-[10px] text-gray-400 mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Playing Style */}
      {step === 2 && (
        <div className="relative z-10 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-gray-200 mb-3">2. What is Your Playing Style or Goal?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "power", label: "Power Hitter / Heavy Weight", sub: "Big boundaries & maximum punch", icon: "💥" },
              { id: "stroke", label: "Precision & Balance", sub: "Light pickup, timing & control", icon: "🎯" },
              { id: "pro", label: "Club & League Tournament", sub: "Match grade official gear", icon: "🏆" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectStyle(item.id)}
                className="bg-white/5 hover:bg-white/15 border border-white/10 hover:border-orange-500 p-4 rounded-2xl flex items-center gap-3 text-left transition hover:scale-102 active:scale-98 cursor-pointer group"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block group-hover:text-orange-400 transition-colors">{item.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">{item.sub}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Ball or Match Surface */}
      {step === 3 && (
        <div className="relative z-10 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-gray-200 mb-3">3. Ball / Ground Preference:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "leather", label: "Leather Match Ball / Hard Ground", sub: "Full protection & pro punch", icon: "🔴" },
              { id: "tennis", label: "Heavy Tennis / Turf Ground", sub: "Everyday practice & high bounce", icon: "🎾" },
              { id: "indoor", label: "Indoor / Gym / Multi-Sport", sub: "Versatile all-season performance", icon: "🏢" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectSurface(item.id)}
                className="bg-white/5 hover:bg-white/15 border border-white/10 hover:border-orange-500 p-4 rounded-2xl flex items-center gap-3 text-left transition hover:scale-102 active:scale-98 cursor-pointer group"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-white block group-hover:text-orange-400 transition-colors">{item.label}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">{item.sub}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Matched Result Recommendation */}
      {step === 4 && result && (
        <div className="relative z-10 bg-white/10 rounded-2xl p-4 sm:p-6 border border-amber-400/40 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Product Photo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-900 rounded-2xl p-2 shrink-0 border border-white/20 flex items-center justify-center relative shadow-xl">
              <img
                src={result.image}
                alt={result.productName}
                className="w-full h-full object-contain rounded-xl"
              />
              <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                <Flame size={10} /> 99% AI Match
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                {result.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                {result.productName}
              </h3>
              <p className="text-xs text-gray-300 mt-1.5 max-w-xl leading-relaxed">
                {result.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className="text-2xl font-black text-amber-400">
                  {result.price}
                </span>

                <Link
                  href={result.link}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-950 font-black text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-1.5 transition hover:scale-102 cursor-pointer"
                >
                  <span>Shop Matched Equipment</span>
                  <ArrowRight size={15} />
                </Link>

                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check size={14} /> 24h Valley Delivery Available
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
