"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface HeroSlide {
  id?: number | string;
  _id?: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
}

// ⏱️ Auto-Slide Interval: Har 2.8 Seconds baad move hoga
const AUTO_SLIDE_INTERVAL = 2800;

export default function HeroCarousel() {
  const { t, language } = useLanguage();
  const [customSlides, setCustomSlides] = useState<HeroSlide[] | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const resolveImg = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    if (url.startsWith("/")) return url;
    return `${API_URL}/uploads/${url}`;
  };

  // 🏏 3 Default Banners with Real Multi-Language Translation
  const defaultSlides: HeroSlide[] = [
    {
      id: 1,
      image: "/hero-banner-1.jpg",
      link: "/products?search=cricket",
      badge: t("hero.slide1.badge", "🏏 100% Genuine Handcrafted Willow"),
      title: t("hero.slide1.title", "Authentic Kashmir"),
      titleHighlight: t("hero.slide1.highlight", "Willow Cricket Bats"),
      subtitle: t("hero.slide1.subtitle", "Direct from Sangam & Anantnag workshops. Monster punch, thick edges & feather-light balance."),
      buttonText: t("hero.slide1.button", "Shop Cricket Bats"),
    },
    {
      id: 2,
      image: "/hero-banner-2.jpg",
      link: "/products?search=football",
      badge: t("hero.slide2.badge", "⚽ FIFA Grade Match Collection"),
      title: t("hero.slide2.title", "Pro Footballs, Studs"),
      titleHighlight: t("hero.slide2.highlight", "& Match Day Kits"),
      subtitle: t("hero.slide2.subtitle", "Thermal bonded match balls, hard-ground turf cleats, pro goalkeeper gloves & team jerseys."),
      buttonText: t("hero.slide2.button", "Shop Football Gear"),
    },
    {
      id: 3,
      image: "/hero-banner-3.jpg",
      link: "/products?search=badminton",
      badge: t("hero.slide3.badge", "🏸 Speed, Power & Precision"),
      title: t("hero.slide3.title", "Carbon Graphite"),
      titleHighlight: t("hero.slide3.highlight", "Badminton Series"),
      subtitle: t("hero.slide3.subtitle", "High-tension 30LBS attack rackets, genuine Yonex Mavis 350 shuttles & non-marking court shoes."),
      buttonText: t("hero.slide3.button", "Shop Badminton"),
    },
  ];

  // Fetch dynamic banners from Admin backend (if configured)
  useEffect(() => {
    fetch(`${API_URL}/banners/public`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const formatted: HeroSlide[] = res.data.map((item: any) => ({
            id: item._id,
            image: resolveImg(item.image),
            badge: item.badge,
            title: item.title,
            titleHighlight: item.titleHighlight,
            subtitle: item.subtitle,
            buttonText: item.buttonText || "Shop Now",
            link: item.link || "/products",
          }));
          setCustomSlides(formatted);
        } else {
          setCustomSlides(null);
        }
      })
      .catch(() => {
        setCustomSlides(null);
      });
  }, [API_URL]);

  const activeSlides = customSlides && customSlides.length > 0 ? customSlides : defaultSlides;
  const totalSlides = activeSlides.length;

  // Auto-play (Right to Left every 2.8s)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, AUTO_SLIDE_INTERVAL);

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

  // Mobile Touch Swipe Handlers
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
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section
      dir="ltr"
      className="relative w-full overflow-hidden bg-black select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Sports Banners"
    >
      {/* ─── Horizontal Slides Track (Smooth Right to Left Transition - Always LTR Transform) ─── */}
      <div
        className="flex transition-transform duration-700 ease-out h-[340px] sm:h-[420px] md:h-[480px] lg:h-[530px]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id || index}
            className="w-full flex-shrink-0 relative h-full flex items-center"
          >
            {/* Background Banner Image */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.title || `Sportify Kashmir Banner ${index + 1}`}
                className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-1000 ease-out"
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
            </div>

            {/* Slide Content Box (Text, Title, Highlight, Subtitle, CTA) */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10 max-w-7xl">
              <div className="max-w-2xl text-left space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-left-6 duration-500">
                {/* Badge */}
                {slide.badge && (
                  <div className="inline-flex items-center">
                    <span className="bg-amber-500/90 text-black text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                      {slide.badge}
                    </span>
                  </div>
                )}

                {/* Main Heading */}
                {slide.title && (
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
                    {slide.title}{" "}
                    {slide.titleHighlight && (
                      <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent block sm:inline">
                        {slide.titleHighlight}
                      </span>
                    )}
                  </h1>
                )}

                {/* Subtitle Description */}
                {slide.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 font-medium max-w-lg leading-relaxed drop-shadow">
                    {slide.subtitle}
                  </p>
                )}

                {/* Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.link || "/products"}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{slide.buttonText || "Shop Now"}</span>
                    <ArrowRight size={15} />
                  </Link>

                  <Link
                    href="/products"
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 rounded-full font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    {t("home.viewAll", "View All Products")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Left Arrow Button (<) ─── */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-lg"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={22} />
      </button>

      {/* ─── Right Arrow Button (>) ─── */}
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 cursor-pointer shadow-lg"
        aria-label="Next Slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* ─── Pagination Dots (● ○ ○) ─── */}
      <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {activeSlides.map((_, idx) => (
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

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent pointer-events-none" />
    </section>
  );
}
