"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Trophy, Flame } from "lucide-react";

export interface HeroSlide {
  id: number;
  image: string;
  badge: string;
  badgeColor: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: "/hero-banner-1.jpg",
    badge: "🏏 100% Genuine Handcrafted Willow",
    badgeColor: "bg-amber-500/90 text-black",
    title: "Authentic Kashmir",
    titleHighlight: "Willow Cricket Bats",
    subtitle: "Direct from Sangam & Anantnag workshops. Premium clefts with thick edges, monster punch & feather-light balance.",
    primaryBtnText: "Explore Cricket Bats",
    primaryBtnLink: "/products?search=cricket",
    secondaryBtnText: "Academy Wholesale",
    secondaryBtnLink: "/wholesale",
  },
  {
    id: 2,
    image: "/hero-banner-2.jpg",
    badge: "⚽ FIFA Grade Match Collection",
    badgeColor: "bg-orange-500/90 text-white",
    title: "Pro Footballs, Studs",
    titleHighlight: "& Match Day Kits",
    subtitle: "Thermal bonded match balls, hard-ground turf cleats, pro goalkeeper gloves & customized team sublimation jerseys.",
    primaryBtnText: "Explore Football Gear",
    primaryBtnLink: "/products?search=football",
    secondaryBtnText: "View Sale Deals",
    secondaryBtnLink: "/sale",
  },
  {
    id: 3,
    image: "/hero-banner-3.jpg",
    badge: "🏸 Speed, Power & Precision",
    badgeColor: "bg-cyan-500/90 text-black",
    title: "Carbon Graphite",
    titleHighlight: "Badminton Series",
    subtitle: "High-tension 30LBS attack rackets, authentic Yonex Mavis 350 nylon & feather shuttles, thermo bags & non-marking shoes.",
    primaryBtnText: "Shop Badminton",
    primaryBtnLink: "/products?search=badminton",
    secondaryBtnText: "Shop All Products",
    secondaryBtnLink: "/products",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const totalSlides = DEFAULT_SLIDES.length;

  // Auto-play interval (slides right to left)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Touch Swipe Handling for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-black select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Sports Banners"
    >
      {/* ─── Slides Container (Smooth Horizontal Sliding Right to Left) ─── */}
      <div
        className="flex transition-transform duration-700 ease-out h-[360px] sm:h-[440px] md:h-[500px] lg:h-[540px]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {DEFAULT_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative h-full flex items-center"
          >
            {/* Background Image with Dark Vignette Overlay for Crisp Readability */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-1000 ease-out"
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
            </div>

            {/* Slide Content Box */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10 max-w-7xl">
              <div className="max-w-2xl text-left space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-left-6 duration-500">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
                  <span className={`${slide.badgeColor} px-2.5 py-0.5 rounded-full font-bold`}>
                    {slide.badge}
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
                  {slide.title}{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent block sm:inline">
                    {slide.titleHighlight}
                  </span>
                </h1>

                {/* Subtitle Description */}
                <p className="text-xs sm:text-sm md:text-base text-gray-200 font-medium max-w-lg leading-relaxed drop-shadow">
                  {slide.subtitle}
                </p>

                {/* Call-to-Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.primaryBtnLink}
                    className="px-5 sm:px-7 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{slide.primaryBtnText}</span>
                    <ArrowRight size={15} />
                  </Link>

                  <Link
                    href={slide.secondaryBtnLink}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    {slide.secondaryBtnText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Previous Button (Left) ─── */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-lg"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>

      {/* ─── Next Button (Right) ─── */}
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-lg"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* ─── Pagination Dots (Bottom Center) ─── */}
      <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {DEFAULT_SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentSlide === idx
                ? "w-8 h-2.5 bg-gradient-to-r from-orange-500 to-amber-400 shadow-md"
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* ─── Bottom Soft Ambient Glow ─── */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
    </section>
  );
}
