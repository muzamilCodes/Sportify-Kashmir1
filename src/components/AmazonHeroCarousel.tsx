"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Truck, 
  ShieldCheck, 
  Percent,
  PackageOpen
} from "lucide-react";
import { resolveProductImage } from "@/lib/imageHelper";
import { cachedJson } from "@/lib/clientCache";

interface DbProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  category?: { _id: string; name: string } | string;
  subcategory?: string;
  brand?: { _id: string; name: string } | string;
  productImgUrls?: string[];
  images?: string[];
}

interface BannerCategoryCard {
  id: string;
  categoryName: string;
  badge?: string;
  title: string;
  subtitle: string;
  brands: string;
  bgGradient: string;
  link: string;
  linkText: string;
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    discount?: string;
    link: string;
  }>;
}

interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  link: string;
  bgClass: string;
}

interface AmazonHeroCarouselProps {
  initialProducts?: any[];
}

export default function AmazonHeroCarousel({ initialProducts }: AmazonHeroCarouselProps = {}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState<DbProduct[]>(initialProducts || []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Sync initial products if provided
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setDbProducts(initialProducts);
    }
  }, [initialProducts]);

  // Fetch real products from database
  useEffect(() => {
    let isMounted = true;
    cachedJson<any>(`${API_URL}/product/getAll`)
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.data)) {
          setDbProducts(data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load real products:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  // Desktop Background Carousel Slides
  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      tag: "🏏 100% Genuine Handcrafted Willow",
      title: "Authentic Kashmir",
      highlight: "Willow Cricket Bats",
      subtitle: "Direct from Sangam & Anantnag workshops. Monster punch, thick edges & feather-light balance.",
      image: "/hero-banner-1.webp",
      link: "/products?search=cricket",
      bgClass: "from-[#4a0e17] via-[#2d050a] to-[#120205]",
    },
    {
      id: 2,
      tag: "⚽ FIFA Grade Match Collection",
      title: "Pro Footballs, Studs",
      highlight: "& Match Day Kits",
      subtitle: "Thermal bonded match balls, hard-ground turf cleats, pro goalkeeper gloves & team jerseys.",
      image: "/hero-banner-2.webp",
      link: "/products?search=football",
      bgClass: "from-[#0c2340] via-[#081728] to-[#040d17]",
    },
    {
      id: 3,
      tag: "🏋️ Strength & Conditioning Series",
      title: "Home Gym Dumbbells",
      highlight: "& Power Benches",
      subtitle: "Rubber hex dumbbells, multi-angle workout benches & heavy resistance bands.",
      image: "/hero-banner-3.webp",
      link: "/products?search=gym",
      bgClass: "from-[#3e2723] via-[#271410] to-[#140a08]",
    },
  ];

  // Auto-play desktop slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Helper to find real products by keywords from name/category/subcategory
  const getProductsForKeywords = (keywords: string[], count = 4) => {
    const matched = dbProducts.filter((p) => {
      const pCat = (typeof p.category === "object" ? p.category?.name : p.category) || "";
      const pSub = p.subcategory || "";
      const pName = p.name || "";
      const combined = `${pCat} ${pSub} ${pName}`.toLowerCase();
      return keywords.some((k) => combined.includes(k.toLowerCase()));
    });

    return matched.slice(0, count).map((p) => ({
      id: p._id,
      name: p.name,
      image: resolveProductImage(p),
      price: p.price,
      discount: p.discount ? `${p.discount}% off` : undefined,
      link: `/product/${p._id}`,
    }));
  };

  // Build Real Banner Cards exclusively from Database Products
  const cricketProds = getProductsForKeywords(["cricket", "bat", "wicket", "leather ball", "pad", "willow"], 4);
  const gymProds = getProductsForKeywords(["gym", "fitness", "dumbbell", "bench", "band", "yoga", "workout"], 4);
  const footballProds = getProductsForKeywords(["football", "stud", "cleat", "soccer", "glove", "jersey", "shin"], 4);

  const usedIds = new Set([
    ...cricketProds.map((p) => p.id),
    ...gymProds.map((p) => p.id),
    ...footballProds.map((p) => p.id),
  ]);

  const trendingProds = dbProducts
    .filter((p) => !usedIds.has(p._id))
    .slice(0, 4)
    .map((p) => ({
      id: p._id,
      name: p.name,
      image: resolveProductImage(p),
      price: p.price,
      discount: p.discount ? `${p.discount}% off` : undefined,
      link: `/product/${p._id}`,
    }));

  const bannerCards: BannerCategoryCard[] = [
    {
      id: "cricket",
      categoryName: "Cricket",
      badge: "Handcrafted in Sangam",
      title: "Kashmir Willow Cricket Gear",
      subtitle: "Sangam & Anantnag Master Craft",
      brands: "SG | SS | DSC | Kookaburra",
      bgGradient: "from-[#8B0000] via-[#5A000A] to-[#360006]",
      link: "/products?search=cricket",
      linkText: "See all cricket willow & gear",
      products: cricketProds,
    },
    {
      id: "gym-fitness",
      categoryName: "Gym & Fitness",
      badge: "Save up to 40%",
      title: "Gym Dumbbells, Benches & Bands",
      subtitle: "Rubber Hex Dumbbells & Benches",
      brands: "Kore | Cockatoo | Sportify",
      bgGradient: "from-[#78350F] via-[#92400E] to-[#451A03]",
      link: "/products?search=gym",
      linkText: "Explore home fitness gear",
      products: gymProds,
    },
    {
      id: "football",
      categoryName: "Football",
      badge: "Match Day Ready",
      title: "Football, Studs & Kits",
      subtitle: "FIFA Spec Balls, Studs & Kits",
      brands: "Nike | Puma | Nivia",
      bgGradient: "from-[#1E3A8A] via-[#1E40AF] to-[#0F172A]",
      link: "/products?search=football",
      linkText: "View pro football gear",
      products: footballProds,
    },
    {
      id: "prime-deals",
      categoryName: "Prime Deals",
      badge: "Kashmir VIP Perks",
      title: "Sportify Prime & Trending Gear",
      subtitle: "Free 24-Hour Valley Express",
      brands: "Yonex | Nike | Adidas",
      bgGradient: "from-[#065F46] via-[#047857] to-[#022C22]",
      link: "/sale",
      linkText: "Explore Prime perks & deals",
      products: trendingProds,
    },
  ];

  return (
    <div className="w-full relative">
      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE VIEW (< 768px): Amazon 2x2 Multi-Product Banner Swipe Cards
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden py-3 bg-transparent">
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 px-3 overflow-x-auto scrollbar-none snap-x snap-mandatory"
        >
          {bannerCards.map((card) => (
            <div
              key={card.id}
              className={`w-[88vw] max-w-[360px] shrink-0 snap-center rounded-2xl bg-gradient-to-b ${card.bgGradient} text-white p-4 shadow-xl flex flex-col justify-between border border-white/10 relative overflow-hidden`}
            >
              {/* Top Card Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {card.badge}
                  </span>
                  <Link
                    href={card.link}
                    className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-0.5"
                  >
                    See all <ChevronRight size={13} />
                  </Link>
                </div>

                <h2 className="text-lg font-black tracking-tight leading-tight">
                  {card.title}
                </h2>
                <p className="text-[11px] text-white/80 font-medium leading-tight mt-0.5">
                  {card.subtitle}
                </p>
                <div className="text-[10px] font-bold text-amber-300/90 tracking-wide mt-1 uppercase">
                  {card.brands}
                </div>
              </div>

              {/* Product Grid Inside Banner Card */}
              {card.products.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 bg-black/25 p-2 rounded-xl backdrop-blur-xs border border-white/10 min-h-[190px]">
                  {card.products.map((prod) => (
                    <Link
                      key={prod.id}
                      href={prod.link}
                      className="bg-white dark:bg-gray-900 rounded-lg p-2 flex flex-col justify-between shadow-sm active:scale-97 transition-transform group"
                    >
                      {/* Image Area */}
                      <div className="w-full h-20 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden flex items-center justify-center relative p-1">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          width={140}
                          height={80}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform"
                        />
                        {prod.discount && (
                          <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-black px-1 rounded shadow-xs">
                            {prod.discount}
                          </span>
                        )}
                      </div>

                      {/* Title & Price */}
                      <div className="mt-1.5 leading-none">
                        <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1 block">
                          {prod.name}
                        </span>
                        {prod.price && (
                          <span className="text-[11px] font-black text-gray-900 dark:text-white block mt-0.5">
                            ₹{prod.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-black/20 border border-white/10 min-h-[190px]">
                  <PackageOpen className="w-8 h-8 text-white/60 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-bold text-white">No products added yet</p>
                  <p className="text-[10px] text-white/70 mt-0.5">Newly created products will appear here</p>
                </div>
              )}

              {/* Bottom Explore Link */}
              <div className="mt-2.5 pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-white/80 font-medium">Kashmir Express Delivery</span>
                <Link
                  href={card.link}
                  className="font-bold text-amber-300 hover:text-white flex items-center gap-1"
                >
                  Explore <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (>= 768px): Full Wide Hero Carousel + 4 Floating Amazon Cards
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block relative w-full bg-transparent">
        {/* Full-width Wide Background Carousel Banner */}
        <div className="relative h-[480px] lg:h-[560px] w-full overflow-hidden">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-r ${slide.bgClass} flex items-start pt-12 relative overflow-hidden`}>
                {/* Background Image with Dark Gradient Mask */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  width={1600}
                  height={560}
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchPriority={idx === 0 ? "high" : "low"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-45 scale-105 transition-transform duration-[7000ms]"
                />

                <div className="container max-w-[1500px] mx-auto px-8 relative z-10 flex items-start justify-between">
                  <div className="max-w-2xl space-y-3.5 animate-fade-in-up">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-orange-500/20 border border-orange-400/40 text-orange-200 backdrop-blur-md tracking-wider shadow-xs">
                      <Sparkles size={13} className="text-orange-300" />
                      {slide.tag}
                    </span>

                    <h1 className="font-display text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      {slide.title}{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-400">
                        {slide.highlight}
                      </span>
                    </h1>

                    <p className="text-sm lg:text-base text-zinc-200 leading-relaxed max-w-xl drop-shadow">
                      {slide.subtitle}
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <Link
                        href={slide.link}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-sm transition shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <span>Shop Collection</span>
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        href="/sale"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition cursor-pointer"
                      >
                        <Zap size={15} className="text-orange-300" />
                        <span>Flash Deals</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Fade Mask into Page Content */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--color-bg-primary)] dark:from-zinc-950 via-[var(--color-bg-primary)]/70 dark:via-zinc-950/70 to-transparent pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Carousel Slide Left/Right Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/3 -translate-y-1/2 z-20 w-11 h-16 rounded-r-md bg-white/30 hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/70 text-gray-900 dark:text-white flex items-center justify-center transition backdrop-blur-xs border border-white/20 shadow-md cursor-pointer group"
            aria-label="Previous slide"
          >
            <ChevronLeft size={26} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/3 -translate-y-1/2 z-20 w-11 h-16 rounded-l-md bg-white/30 hover:bg-white/80 dark:bg-black/30 dark:hover:bg-black/70 text-gray-900 dark:text-white flex items-center justify-center transition backdrop-blur-xs border border-white/20 shadow-md cursor-pointer group"
            aria-label="Next slide"
          >
            <ChevronRight size={26} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            4 FLOATING AMAZON CARDS (Overlapping the Hero Banner Bottom)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="max-w-[1500px] mx-auto px-6 -mt-44 lg:-mt-52 relative z-20 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {bannerCards.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4.5 shadow-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-orange-400/40 group"
              >
                <div>
                  {/* Card Title */}
                  <h3 className="text-base lg:text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {card.subtitle}
                  </p>

                  {/* Image Tile Grid */}
                  {card.products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5 my-3.5 min-h-[220px]">
                      {card.products.map((prod) => (
                        <Link
                          key={prod.id}
                          href={prod.link}
                          className="group/item flex flex-col justify-between"
                        >
                          <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-1.5 relative border border-gray-200/50 dark:border-gray-700/50 group-hover/item:border-orange-500 transition-colors">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              width={160}
                              height={96}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover rounded-md group-hover/item:scale-105 transition-transform"
                            />
                            {prod.discount && (
                              <span className="absolute top-1 left-1 bg-[#cc0c39] text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                                {prod.discount}
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 line-clamp-1 group-hover/item:text-orange-600 transition-colors">
                              {prod.name}
                            </span>
                            <span className="text-xs font-black text-gray-900 dark:text-white block mt-0.5">
                              ₹{prod.price.toLocaleString()}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/40 dark:border-zinc-700/40 my-3.5 min-h-[220px]">
                      <PackageOpen className="w-9 h-9 text-gray-400 dark:text-gray-500 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200">No products added yet</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Newly created products will appear here</p>
                    </div>
                  )}
                </div>

                {/* Bottom Card Link */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    href={card.link}
                    className="text-xs font-bold text-[#007185] hover:text-[#c7511f] dark:text-[#00a8e1] flex items-center gap-1 group-hover:underline"
                  >
                    <span>{card.linkText}</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
