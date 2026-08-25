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
  Percent
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
  productImgUrls: string[];
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
  title: string;
  highlight: string;
  subtitle: string;
  tag: string;
  image: string;
  link: string;
  bgClass: string;
}

export default function AmazonHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Fetch real products from database using cached request deduplication
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

  // Desktop Background Carousel Slides (Full-Width with modern WebP compression)
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

  // Helper to find products by category name or fallback
  const getProductsForCategory = (catName: string, count = 4) => {
    const matched = dbProducts.filter((p) => {
      const pCat = typeof p.category === "object" ? p.category?.name : p.category;
      return (
        pCat?.toLowerCase().includes(catName.toLowerCase()) ||
        p.name?.toLowerCase().includes(catName.toLowerCase())
      );
    });

    if (matched.length > 0) {
      return matched.slice(0, count).map((p) => ({
        id: p._id,
        name: p.name,
        image: resolveProductImage(p),
        price: p.price,
        discount: p.discount ? `${p.discount}% off` : undefined,
        link: `/product/${p._id}`,
      }));
    }

    return [];
  };

  // Build Real Banner Cards from Database Products
  const cricketProds = getProductsForCategory("cricket", 4);
  const gymProds = getProductsForCategory("gym", 4);
  const footballProds = getProductsForCategory("football", 4);
  const allOtherProds = dbProducts
    .filter((p) => {
      const pCat = typeof p.category === "object" ? p.category?.name : p.category;
      return !pCat?.toLowerCase().includes("cricket");
    })
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
      products: cricketProds.length > 0 ? cricketProds : [
        { id: "c1", name: "SG Player Edition Kashmir Bat", image: "/hero-banner-1.jpg", price: 3499, discount: "15% off", link: "/products?search=cricket" },
        { id: "c2", name: "SS Ton Matrix English Willow", image: "/hero-banner-1.jpg", price: 7499, discount: "10% off", link: "/products?search=cricket" },
        { id: "c3", name: "SG Club Leather Match Ball (2pk)", image: "/hero-banner-1.jpg", price: 899, discount: "5% off", link: "/products?search=cricket" },
        { id: "c4", name: "SS Gladiator Batting Pads", image: "/hero-banner-1.jpg", price: 2499, discount: "12% off", link: "/products?search=cricket" },
      ],
    },
    {
      id: "gym",
      categoryName: "Gym & Fitness",
      badge: "Strength & Workout",
      title: "Gym & Strength Fitness",
      subtitle: "Free Weights, Benches & Mats",
      brands: "Cosco | Puma | USI Pro",
      bgGradient: "from-[#92400E] via-[#78350F] to-[#451A03]",
      link: "/products?search=gym",
      linkText: "Explore home gym equipment",
      products: gymProds.length > 0 ? gymProds : [
        { id: "g1", name: "Cosco Hex Dumbbell Set 10kg", image: "/hero-banner-3.jpg", price: 2899, discount: "20% off", link: "/products?search=gym" },
        { id: "g2", name: "Puma Dual-Grip Yoga Mat", image: "/hero-banner-3.jpg", price: 1499, discount: "15% off", link: "/products?search=gym" },
        { id: "g3", name: "Latex Resistance Bands Set", image: "/hero-banner-3.jpg", price: 499, discount: "30% off", link: "/products?search=gym" },
        { id: "g4", name: "Adjustable Workout Bench", image: "/hero-banner-3.jpg", price: 3999, discount: "25% off", link: "/products?search=gym" },
      ],
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
      products: footballProds.length > 0 ? footballProds : [
        { id: "f1", name: "Nike Flight Match Football Size 5", image: "/hero-banner-2.jpg", price: 4299, discount: "10% off", link: "/products?search=football" },
        { id: "f2", name: "Puma Future Ultimate Cleats", image: "/hero-banner-2.jpg", price: 5999, discount: "15% off", link: "/products?search=football" },
        { id: "f3", name: "Nivia Pro Goalkeeper Gloves", image: "/hero-banner-2.jpg", price: 1299, discount: "20% off", link: "/products?search=football" },
        { id: "f4", name: "Nike Dri-FIT Tracksuit", image: "/hero-banner-2.jpg", price: 3499, discount: "18% off", link: "/products?search=football" },
      ],
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
      products: allOtherProds.length > 0 ? allOtherProds : [
        { id: "t1", name: "Yonex Astrox 99 Pro Racket", image: "/hero-banner-3.jpg", price: 8999, discount: "12% off", link: "/products?search=badminton" },
        { id: "t2", name: "Yonex Mavis 350 Shuttles", image: "/hero-banner-3.jpg", price: 849, discount: "10% off", link: "/products?search=badminton" },
        { id: "t3", name: "Nike Pegasus 40 Running Shoes", image: "/hero-banner-2.jpg", price: 7999, discount: "20% off", link: "/products?search=running" },
        { id: "t4", name: "Under Armour Tech T-Shirt", image: "/hero-banner-2.jpg", price: 1299, discount: "15% off", link: "/products?search=wear" },
      ],
    },
  ];

  return (
    <div className="w-full relative">
      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE VIEW (< 768px): Amazon 2x2 Multi-Product Banner Swipe Cards
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden py-2 bg-gradient-to-b from-[#e3e6e6] to-[#f3f4f6] dark:from-gray-950 dark:to-gray-900">
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

              {/* 2x2 Product Grid Inside Banner Card */}
              <div className="grid grid-cols-2 gap-2 bg-black/25 p-2 rounded-xl backdrop-blur-xs border border-white/10">
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
      <div className="hidden md:block relative w-full bg-[#eaeded] dark:bg-gray-950">
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
                  // @ts-ignore
                  fetchpriority={idx === 0 ? "high" : "low"}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 scale-105 transition-transform duration-7000"
                />

                <div className="container max-w-[1500px] mx-auto px-8 relative z-10 flex items-start justify-between">
                  <div className="max-w-2xl space-y-3.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-400/20 border border-amber-400/40 text-amber-300 backdrop-blur-md tracking-wider shadow-xs">
                      <Sparkles size={13} className="text-amber-400" />
                      {slide.tag}
                    </span>

                    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                      {slide.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">{slide.highlight}</span>
                    </h1>

                    <p className="text-sm lg:text-base text-gray-200 leading-relaxed max-w-xl drop-shadow">
                      {slide.subtitle}
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <Link
                        href={slide.link}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-950 font-extrabold text-sm transition shadow-xl hover:shadow-2xl hover:scale-102 active:scale-98 cursor-pointer"
                      >
                        <span>Shop Collection</span>
                        <ArrowRight size={16} />
                      </Link>
                      <Link
                        href="/sale"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition cursor-pointer"
                      >
                        <Zap size={15} className="text-amber-400" />
                        <span>Flash Deals</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom Fade Mask into Page Content (Amazon Signature) */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#eaeded] dark:from-gray-950 via-[#eaeded]/70 dark:via-gray-950/70 to-transparent pointer-events-none" />
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
                className="bg-white dark:bg-gray-900 rounded-xl p-4.5 shadow-xl border border-gray-200/80 dark:border-gray-800 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
              >
                <div>
                  {/* Card Title */}
                  <h3 className="text-base lg:text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {card.subtitle}
                  </p>

                  {/* 2x2 Image Tile Grid */}
                  <div className="grid grid-cols-2 gap-2.5 my-3.5">
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
