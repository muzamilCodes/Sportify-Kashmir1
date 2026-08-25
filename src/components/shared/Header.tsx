"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Home,
  ShoppingBag,
  Trophy,
  Award,
  Info,
  Mail,
  Goal,
  Dumbbell,
  Shirt,
  ClipboardList,
  Search,
  Activity,
  Bike,
  Waves,
  Pocket,
  Gamepad2,
  Tent,
  FileText,
  Sparkles,
  Percent,
  Loader2,
  Tag,
  Download,
  MapPin,
  Flame,
  Crown,
  Building2,
  CreditCard,
  Wallet,
  Phone,
  Gift,
  Check,
  Package,
  Camera,
  Mic,
  QrCode,
} from "lucide-react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { useCartCount } from "@/components/providers/CartCountProvider";
import { resolveProductImage } from "@/lib/imageHelper";
import ProductImage from "@/components/ProductImage";
import { cachedJson } from "@/lib/clientCache";
import { useLanguage, LANGUAGES, LanguageCode } from "@/context/LanguageContext";
import AmazonQuickCategories from "@/components/shared/AmazonQuickCategories";

const VoiceSearchModal = dynamic(
  () => import("@/components/shared/SearchModals").then((m) => m.VoiceSearchModal),
  { ssr: false }
);
const VisualSearchModal = dynamic(
  () => import("@/components/shared/SearchModals").then((m) => m.VisualSearchModal),
  { ssr: false }
);
const QrScannerModal = dynamic(
  () => import("@/components/shared/SearchModals").then((m) => m.QrScannerModal),
  { ssr: false }
);
const NotificationCenter = dynamic(
  () => import("@/components/shared/NotificationCenter"),
  { ssr: false }
);
const PrimeMembershipModal = dynamic(
  () => import("@/components/shared/PrimeMembershipModal"),
  { ssr: false }
);
const RufusAIAssistant = dynamic(
  () => import("@/components/shared/RufusAIAssistant"),
  { ssr: false }
);

const Cricket = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11.5 12.5 6 18c-2.5-1.5-5-.5-7 2 2.5 1.5 5 .5 7-2l5.5-5.5Z" />
    <path d="m12 12 5.5-5.5c2.5 1.5 5 .5 7-2-2.5-1.5-5-.5-7 2L12 12Z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const getProfileImageUrl = (profilePic: string | undefined) => {
  if (!profilePic) return null;
  if (profilePic.startsWith("http")) return profilePic;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  if (profilePic.startsWith("/uploads/")) return `${API_URL}${profilePic}`;
  return `${API_URL}/uploads/${profilePic}`;
};

const SEARCH_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "cricket", label: "Cricket" },
  { id: "football", label: "Football" },
  { id: "badminton", label: "Badminton" },
  { id: "gym", label: "Gym" },
  { id: "shoes", label: "Shoes" },
  { id: "wear", label: "Wear" },
  { id: "tennis", label: "Tennis" },
  { id: "basketball", label: "Hoops" },
  { id: "trophies", label: "Trophies" },
  { id: "accessories", label: "Gear" },
];

export interface SubCategory {
  title: string;
  query: string;
}

export interface SportCategory {
  id: string;
  name: string;
  href: string;
  icon: any;
  subcategories: SubCategory[];
}

const DETAILED_SPORTS_CATEGORIES: SportCategory[] = [
  {
    id: "cricket",
    name: "Cricket Willow & Gear",
    href: "/products?search=cricket",
    icon: <Cricket size={18} />,
    subcategories: [
      { title: "Kashmir Willow Bats (Sangam/Anantnag)", query: "kashmir willow" },
      { title: "English Willow Grade 1 & 2 Bats", query: "english willow" },
      { title: "Leather Match & Alum Balls (4-Piece)", query: "cricket leather ball" },
      { title: "Heavy Tennis & Wind Cricket Balls", query: "tennis cricket ball" },
      { title: "Batting Pads & Legguards", query: "batting pads" },
      { title: "Batting & Wicket Keeping Gloves", query: "batting gloves" },
      { title: "Helmets, Thigh & Chest Guards", query: "cricket helmet guard" },
      { title: "Full Team Cricket Kit Bags", query: "cricket kit bag" },
      { title: "Wooden Stumps, Bails & Grips", query: "cricket stumps grip" },
    ],
  },
  {
    id: "football",
    name: "Football & Team Sports",
    href: "/products?search=football",
    icon: <Goal size={18} />,
    subcategories: [
      { title: "FIFA Standard Match Footballs (Size 5)", query: "match football" },
      { title: "Training & Street Turf Balls", query: "training football" },
      { title: "Studs & Hard Ground Football Cleats", query: "football studs" },
      { title: "Pro Goalkeeper Gloves with Finger-Save", query: "goalkeeper gloves" },
      { title: "Shin Guards, Ankle Sleeves & Socks", query: "shin guard football" },
      { title: "Custom Team Football Jerseys & Shorts", query: "football jersey" },
      { title: "Agility Ladders, Cones & Goal Nets", query: "football training cones" },
    ],
  },
  {
    id: "badminton",
    name: "Badminton & Racket Sports",
    href: "/products?search=badminton",
    icon: <Activity size={18} />,
    subcategories: [
      { title: "Carbon Graphite Rackets (Attack/Control)", query: "badminton racket" },
      { title: "Feather Shuttlecocks (Duck/Goose)", query: "feather shuttlecock" },
      { title: "Nylon Durable Shuttles (Mavis 350)", query: "nylon shuttlecock" },
      { title: "Non-Marking Badminton Court Shoes", query: "badminton court shoes" },
      { title: "3-Zip & 6-Racket Thermo Kit Bags", query: "badminton kit bag" },
      { title: "High-Tension Strings, Grips & Nets", query: "badminton grip string" },
    ],
  },
  {
    id: "gym-fitness",
    name: "Gym & Fitness Training",
    href: "/products?search=gym",
    icon: <Dumbbell size={18} />,
    subcategories: [
      { title: "Rubber Hex Dumbbells & Plate Sets", query: "dumbbell weight" },
      { title: "Latex Resistance Bands & Pull-up Tubes", query: "resistance band" },
      { title: "High-Density Yoga Mats & Rollers", query: "yoga mat" },
      { title: "Leather Weightlifting Belts & Wrist Wraps", query: "gym belt wrist wrap" },
      { title: "Stainless Steel Shakers & Sipper Bottles", query: "gym shaker bottle" },
      { title: "Pushup Bars, Ab Rollers & Skipping Ropes", query: "skipping rope ab roller" },
      { title: "Home Gym Adjustable Benches", query: "gym bench" },
    ],
  },
  {
    id: "sports-wear",
    name: "Sports Wear & Team Apparel",
    href: "/products?search=wear",
    icon: <Shirt size={18} />,
    subcategories: [
      { title: "Dri-FIT Moisture-Wicking T-Shirts", query: "athletic tshirt" },
      { title: "Full Tracksuits & Training Pants", query: "tracksuit trackpants" },
      { title: "Compression Inner Sleeves & Tights", query: "compression wear" },
      { title: "Quick-Dry Sports Shorts & Bibs", query: "sports shorts" },
      { title: "Kashmir Winter Windcheaters & Hoodies", query: "sports hoodie windcheater" },
      { title: "Custom Sublimation Team Uniforms", query: "team jersey uniform" },
    ],
  },
  {
    id: "sports-shoes",
    name: "Sports Shoes & Spikes",
    href: "/products?search=shoes",
    icon: <Tent size={18} />,
    subcategories: [
      { title: "Cricket Full Metal & Rubber Spikes", query: "cricket spike shoes" },
      { title: "Football Studs & Turf Boots", query: "football turf studs" },
      { title: "Running & Marathon Shoes", query: "running shoes" },
      { title: "Indoor Badminton Non-Marking Shoes", query: "non marking shoes" },
      { title: "Gym & Cross-Training Trainers", query: "training gym shoes" },
    ],
  },
  {
    id: "tennis-tt",
    name: "Tennis & Table Tennis",
    href: "/products?search=tennis",
    icon: <Activity size={18} />,
    subcategories: [
      { title: "Lawn Tennis Rackets & Pressurized Balls", query: "lawn tennis racket" },
      { title: "Table Tennis ITTF Approved Bats", query: "table tennis bat" },
      { title: "3-Star Table Tennis Balls (Pack of 6/12)", query: "table tennis balls" },
      { title: "Foldable TT Tables, Posts & Nets", query: "table tennis net" },
    ],
  },
  {
    id: "basketball-volleyball",
    name: "Basketball & Volleyball",
    href: "/products?search=basketball",
    icon: <Activity size={18} />,
    subcategories: [
      { title: "Official Size 7 & 6 Basketballs", query: "basketball" },
      { title: "Soft-Touch Match Volleyballs (PVA)", query: "volleyball" },
      { title: "Spring-Loaded Basketball Hoops & Nets", query: "basketball hoop net" },
      { title: "Knee Pads, Ankle Braces & Supports", query: "knee support brace" },
    ],
  },
  {
    id: "trophies-awards",
    name: "Trophies, Medals & Cups",
    href: "/products?search=trophy",
    icon: <Trophy size={18} />,
    subcategories: [
      { title: "Cricket Tournament Championship Cups", query: "cricket trophy cup" },
      { title: "Gold, Silver & Bronze Die-Cast Medals", query: "tournament medals" },
      { title: "Custom Wooden & Acrylic Winner Shields", query: "award shield" },
      { title: "Man of the Match & Best Bowler Statues", query: "sports statue trophy" },
    ],
  },
  {
    id: "bags-accessories",
    name: "Sports Bags & Accessories",
    href: "/products?search=accessories",
    icon: <Pocket size={18} />,
    subcategories: [
      { title: "Heavy Duty Wheelie Kit Bags", query: "wheelie kit bag" },
      { title: "Multi-Compartment Gym Duffle Bags", query: "gym duffle bag" },
      { title: "Hydration Stainless Steel Flasks", query: "sports water bottle" },
      { title: "Sweatbands, Wristbands & Sports Caps", query: "sports wristband cap" },
      { title: "Coaching Whistles, Stopwatches & Counters", query: "stopwatch whistle" },
    ],
  },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>("cricket");
  const { cartCount } = useCartCount();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSearchCat, setSelectedSearchCat] = useState("all");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quickBuyProducts, setQuickBuyProducts] = useState<any[]>([]);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [isRufusOpen, setIsRufusOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<{
    logoUrl?: string;
    announcementText?: string;
  } | null>(null);

  const { language, setLanguage, currentLangOption, t } = useLanguage();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const sideDrawerRef = useRef<HTMLDivElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    let isMounted = true;
    cachedJson<any>(`${API_URL}/admin/public/settings`)
      .then((res) => {
        if (isMounted && res?.success && res.data) {
          setStoreSettings(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  useEffect(() => {
    setImageError(false);
  }, [user?.profilePic, user?._id]);

  // Listen for custom toggleAmazonSideDrawer event from bottom nav
  useEffect(() => {
    const handleDrawer = () => setIsSideDrawerOpen((prev) => !prev);
    window.addEventListener("toggleAmazonSideDrawer", handleDrawer);
    return () => window.removeEventListener("toggleAmazonSideDrawer", handleDrawer);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target as Node)) {
        setIsSideDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when side drawer is open
  useEffect(() => {
    if (isSideDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSideDrawerOpen]);

  // Smart search suggestions
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const catFilter = selectedSearchCat !== "all" ? `&category=${selectedSearchCat}` : "";
        const res = await fetch(`${API_URL}/product/getAll?search=${encodeURIComponent(query)}${catFilter}&limit=6`);
        const data = await res.json();
        if (data.success && data.data) {
          const items = Array.isArray(data.data) ? data.data : data.data.items || [];
          setSearchSuggestions(items.slice(0, 6));
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedSearchCat, API_URL]);

  // Auth checking
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
          setImageError(false);
        } catch {
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();

    window.addEventListener("authUpdated", checkAuth);
    window.addEventListener("userUpdated", checkAuth);
    return () => {
      window.removeEventListener("authUpdated", checkAuth);
      window.removeEventListener("userUpdated", checkAuth);
    };
  }, [pathname]);

  // Load quick buy products
  useEffect(() => {
    async function loadQuickBuy() {
      try {
        const res = await cachedJson<{ success: boolean; data: any }>(`${API_URL}/product/getAll`);
        if (res.success && res.data) {
          const raw = Array.isArray(res.data) ? res.data : res.data?.items || [];
          setQuickBuyProducts(raw.slice(0, 3));
        }
      } catch {
        // silent fallback
      }
    }
    loadQuickBuy();
  }, [API_URL]);

  const handleQuickAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    setAddingCartId(productId);
    try {
      const response = await fetch(`${API_URL}/cart/addtoCart/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingCartId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setShowSuggestions(false);
      const catParam = selectedSearchCat !== "all" ? `&category=${selectedSearchCat}` : "";
      router.push(`/products?search=${encodeURIComponent(query)}${catParam}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartId");
    setIsLoggedIn(false);
    setUser(null);
    setIsUserMenuOpen(false);
    toast.success("Logged out successfully");
    window.dispatchEvent(new Event("authUpdated"));
    router.push("/login");
  };

  const toggleCategoryAccordion = (categoryId: string) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const profileImageUrl = getProfileImageUrl(user?.profilePic);

  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 shadow-md">
      {/* ── Top Announcement Bar (Desktop only, dynamic from /admin/settings) ── */}
      {storeSettings?.announcementText && (
        <div className="hidden lg:flex bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white text-[11px] sm:text-xs font-semibold py-1 px-4 text-center tracking-wide items-center justify-center gap-2 shadow-xs">
          <span>{storeSettings.announcementText}</span>
        </div>
      )}

      {/* ── Amazon-Style Top Category Quick Carousel on Mobile (< 1024px) ── */}
      <div className="lg:hidden">
        <AmazonQuickCategories />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ROW 1: Amazon-Style Main Header Bar (#131921 Navy/Black)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#131921] text-white px-2 sm:px-4 py-1 sm:py-2">
        <div className="max-w-[1500px] mx-auto hidden lg:flex items-center justify-between gap-2 sm:gap-4">
          {/* ── Left: Hamburger Menu (Mobile) + Logo ── */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsSideDrawerOpen(true)}
              className="lg:hidden p-1.5 text-white hover:text-amber-400 transition cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-1 sm:px-2 py-1 rounded-xs hover:outline-1 hover:outline-white shrink-0 group"
            >
              {storeSettings?.logoUrl ? (
                <img
                  src={
                    storeSettings.logoUrl.startsWith("http") || storeSettings.logoUrl.startsWith("data:")
                      ? storeSettings.logoUrl
                      : `${API_URL}${storeSettings.logoUrl}`
                  }
                  alt="Sportify Kashmir"
                  className="h-7 sm:h-8 max-w-[120px] sm:max-w-[150px] object-contain"
                />
              ) : (
                <>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-xs">
                    <Trophy size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm sm:text-lg font-black tracking-tight text-white flex items-center">
                      sportify<span className="text-amber-400 font-bold text-xs sm:text-sm">.in</span>
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-gray-300 font-semibold tracking-wider uppercase -mt-0.5">
                      Kashmir
                    </span>
                  </div>
                </>
              )}
            </Link>
          </div>

          {/* ── Desktop Deliver To Location Button ── */}
          <Link
            href={isLoggedIn ? "/profile?tab=addresses" : "/login"}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs hover:outline-1 hover:outline-white shrink-0 text-left"
          >
            <MapPin size={16} className="text-white shrink-0 mt-2" />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-gray-300 font-normal truncate max-w-[120px]">
                {t("nav.deliverTo", "Deliver to")} {isLoggedIn && user ? (user.username || "User") : "Kashmir"}
              </span>
              <span className="text-xs font-bold text-white whitespace-nowrap">
                Srinagar 190009
              </span>
            </div>
          </Link>

          {/* ── Desktop Search Bar (Hidden on mobile, displayed in dedicated row 2 below) ── */}
          <div className="hidden lg:block flex-1 max-w-3xl relative mx-2" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="flex h-10 rounded-md overflow-hidden shadow-sm">
              {/* Category Select Pill */}
              <div className="relative flex items-center bg-[#f3f3f3] text-gray-800 border-r border-gray-300 hover:bg-[#e6e6e6] transition cursor-pointer">
                <select
                  value={selectedSearchCat}
                  onChange={(e) => setSelectedSearchCat(e.target.value)}
                  className="h-full px-2.5 text-xs font-semibold bg-transparent appearance-none cursor-pointer outline-none pr-6 text-gray-800"
                >
                  {SEARCH_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="text-gray-900 bg-white">
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 text-gray-600 pointer-events-none" />
              </div>

              {/* Input */}
              <input
                id="header-search-desktop"
                name="search"
                type="text"
                placeholder={t("nav.searchPlaceholder", "Search Kashmir willow bats, match footballs, gym gear, jerseys...")}
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3.5 text-sm text-gray-900 bg-white placeholder-gray-500 outline-none"
              />

              {/* Desktop Visual, Voice & QR Suite Action Icons */}
              <div className="flex items-center gap-0.5 px-2 bg-white text-gray-500 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVisualModalOpen(true)}
                  className="p-1.5 hover:text-orange-500 text-gray-500 transition rounded-full cursor-pointer"
                  title="Visual Search / AI Lens"
                >
                  <Camera size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="p-1.5 hover:text-orange-500 text-gray-500 transition rounded-full cursor-pointer"
                  title="Voice Search"
                >
                  <Mic size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="p-1.5 hover:text-orange-500 text-gray-500 transition rounded-full cursor-pointer"
                  title="Website QR & AI Scanner"
                >
                  <QrCode size={17} />
                </button>
              </div>

              {/* Amber Search Submit Button */}
              <button
                type="submit"
                aria-label="Submit search"
                className="w-12 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={19} />}
              </button>
            </form>

            {/* Smart Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white text-gray-900 rounded-md shadow-2xl border border-gray-200 overflow-hidden z-50">
                <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-semibold px-3">
                  <span>Search Suggestions</span>
                  <span className="text-[11px] font-normal">{searchSuggestions.length} items found</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {searchSuggestions.map((item) => {
                    const hasDiscount = item.discount && item.discount > 0;
                    const finalPrice = hasDiscount ? item.price - (item.price * item.discount) / 100 : item.price;

                    return (
                      <Link
                        key={item._id}
                        href={`/product/${item._id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-orange-50 transition group"
                      >
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-50 shrink-0 border border-gray-200 flex items-center justify-center p-1">
                          <ProductImage
                            product={item}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-orange-600">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-orange-600">
                              ₹{Math.round(finalPrice).toLocaleString("en-IN")}
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Section Actions: User, Orders, Cart, Theme ── */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* ── Language Flag & Real Switcher Dropdown (Desktop & Tablet) ── */}
            <div className="relative hidden xl:flex" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs hover:outline-1 hover:outline-white text-xs font-bold text-white cursor-pointer group"
                title="Change language"
              >
                <span className="text-base leading-none">{currentLangOption.flag}</span>
                <span className="tracking-wide uppercase text-[11px] font-black">{currentLangOption.code}</span>
                <ChevronDown size={10} className={`text-gray-400 group-hover:text-white transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Language Selection Modal Dropdown */}
              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                    <span>{t("nav.language", "Select Language")}</span>
                    <span className="text-orange-600 font-bold">4 Available</span>
                  </div>
                  <div className="p-1 space-y-0.5">
                    {LANGUAGES.map((item) => {
                      const isSelected = item.code === language;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            setLanguage(item.code);
                            setIsLangMenuOpen(false);
                            toast.success(`Language set to ${item.name} (${item.nativeName})`);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? "bg-orange-50 text-orange-600 border border-orange-200"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base leading-none">{item.flag}</span>
                            <div className="text-left">
                              <p className="leading-tight font-extrabold">{item.name}</p>
                              <span className="text-[10px] text-gray-400 font-normal">{item.nativeName}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={15} className="text-orange-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-1 px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 text-center">
                    🇮🇳 Serving Athletes across Kashmir
                  </div>
                </div>
              )}
            </div>

            {/* ── Account & Lists Dropdown (Desktop Only, mobile has 'You' in bottom nav) ── */}
            <div className="relative hidden lg:block" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xs hover:outline-1 hover:outline-white text-left cursor-pointer"
                aria-label="Account and lists"
              >
                {isLoggedIn && profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-amber-400 shrink-0"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User size={18} className="text-gray-300 shrink-0 lg:hidden" />
                )}
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] sm:text-[11px] text-gray-300 font-normal truncate max-w-[85px] sm:max-w-[110px]">
                    {isLoggedIn && user ? `Hello, ${user.username || user.email?.split("@")[0]}` : t("nav.helloSignIn", "Hello, Sign in")}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-0.5 whitespace-nowrap">
                    <span className="hidden sm:inline">{t("nav.accountLists", "Account & Lists")}</span>
                    <span className="sm:hidden">{t("nav.accountLists", "Account")}</span>
                    <ChevronDown size={10} className={`text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </span>
                </div>
              </button>

              {/* Mega Dropdown Menu (Fixed sheet on mobile, anchored on desktop) */}
              <div
                className={`fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-14 sm:top-full mt-1 w-auto sm:w-[580px] lg:w-[660px] max-h-[82vh] overflow-y-auto overscroll-contain bg-white text-gray-900 rounded-2xl sm:rounded-lg shadow-2xl border border-gray-200 transition-all duration-200 z-50 ${
                  isUserMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
              >
                {/* Top Profile Strip */}
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Who is shopping?</span>
                    {isLoggedIn && user ? (
                      <span className="font-bold text-gray-900 flex items-center gap-1.5 truncate max-w-[180px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        {user.username || user.email}
                      </span>
                    ) : (
                      <span className="font-medium text-gray-500">Guest</span>
                    )}
                  </div>
                  <Link
                    href={isLoggedIn ? "/profile" : "/login"}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    {isLoggedIn ? "Manage Profile ›" : "Sign In ›"}
                  </Link>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 p-4 gap-4 text-xs">
                  {/* Col 1: Buy It Again */}
                  <div className="sm:col-span-5 pr-0 sm:pr-2">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-100">
                      <h4 className="font-extrabold text-gray-900 uppercase tracking-wider">
                        Buy it again
                      </h4>
                      <Link
                        href="/products"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="text-[11px] text-orange-600 font-semibold hover:underline"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-2.5">
                      {quickBuyProducts.length > 0 ? (
                        quickBuyProducts.map((prod) => (
                          <div
                            key={prod._id}
                            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 transition group"
                          >
                            <Link
                              href={`/product/${prod._id}`}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-11 h-11 rounded-md bg-gray-50 shrink-0 border border-gray-200 flex items-center justify-center p-1"
                            >
                              <ProductImage
                                product={prod}
                                alt={prod.name}
                                width={44}
                                height={44}
                                className="object-contain"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/product/${prod._id}`}
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <p className="font-semibold text-gray-900 truncate group-hover:text-orange-600">
                                  {prod.name}
                                </p>
                              </Link>
                              <p className="font-bold text-orange-600">
                                ₹{Math.round(prod.discount ? prod.price - (prod.price * prod.discount) / 100 : prod.price).toLocaleString("en-IN")}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => handleQuickAddToCart(prod._id, e)}
                                disabled={addingCartId === prod._id}
                                className="mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-amber-400 hover:bg-amber-500 text-gray-900 transition flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                {addingCartId === prod._id ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <ShoppingCart size={10} />
                                )}
                                <span>Add to cart</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          <span>No past orders yet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Col 2: Your Lists */}
                  <div className="sm:col-span-3 px-0 sm:px-2 pt-2 sm:pt-0">
                    <h4 className="font-extrabold text-gray-900 uppercase tracking-wider pb-1.5 mb-2 border-b border-gray-100">
                      Your Lists
                    </h4>
                    <ul className="space-y-2 font-medium text-gray-700">
                      <li>
                        <Link href="/wishlist" onClick={() => setIsUserMenuOpen(false)} className="hover:text-orange-600 flex items-center gap-1.5">
                          <Heart size={13} className="text-orange-500" />
                          <span>Wishlist</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/wholesale" onClick={() => setIsUserMenuOpen(false)} className="hover:text-orange-600 flex items-center gap-1.5">
                          <Building2 size={13} className="text-orange-500" />
                          <span>Academy Wholesale</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products" onClick={() => setIsUserMenuOpen(false)} className="hover:text-orange-600 flex items-center gap-1.5">
                          <Tag size={13} className="text-orange-500" />
                          <span>Deals &amp; Sale</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Col 3: Your Account */}
                  <div className="sm:col-span-4 pl-0 sm:pl-2 pt-2 sm:pt-0">
                    <h4 className="font-extrabold text-gray-900 uppercase tracking-wider pb-1.5 mb-2 border-b border-gray-100">
                      Your Account
                    </h4>
                    {isLoggedIn && user ? (
                      <ul className="space-y-2 font-medium text-gray-700">
                        {user?.isAdmin && (
                          <li>
                            <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="text-orange-600 font-bold hover:underline">
                              ⭐ Admin Dashboard
                            </Link>
                          </li>
                        )}
                        <li>
                          <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="hover:text-orange-600 flex items-center gap-1.5">
                            <User size={13} className="text-gray-500" />
                            <span>Your Account</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/orders" onClick={() => setIsUserMenuOpen(false)} className="hover:text-orange-600 flex items-center gap-1.5">
                            <ClipboardList size={13} className="text-gray-500" />
                            <span>Your Orders</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/address" onClick={() => setIsUserMenuOpen(false)} className="hover:text-orange-600 flex items-center gap-1.5">
                            <MapPin size={13} className="text-gray-500" />
                            <span>Your Addresses</span>
                          </Link>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              window.dispatchEvent(new CustomEvent("show-pwa-install"));
                            }}
                            className="text-orange-600 hover:underline flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download size={13} />
                            <span>Install App</span>
                          </button>
                        </li>
                        <li className="pt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <LogOut size={13} />
                            <span>Sign Out</span>
                          </button>
                        </li>
                      </ul>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-bold text-center rounded shadow-xs"
                        >
                          Sign In
                        </Link>
                        <p className="text-[11px] text-gray-500 text-center">
                          New customer?{" "}
                          <Link href="/signup" onClick={() => setIsUserMenuOpen(false)} className="text-orange-600 font-bold hover:underline">
                            Start here.
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Notification Center Bell (Desktop & Mobile) ── */}
            <div className="flex items-center">
              <NotificationCenter />
            </div>

            {/* ── Returns & Orders Button (Desktop Only) ── */}
            <Link
              href="/orders"
              className="hidden lg:flex flex-col leading-tight px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-xs hover:outline-1 hover:outline-white text-left shrink-0"
              aria-label="Returns and orders"
            >
              <span className="text-[10px] sm:text-[11px] text-gray-300 font-normal">{t("nav.returnsOrders", "Returns")}</span>
              <span className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">&amp; Orders</span>
            </Link>

            {/* ── Cart Button (Desktop Only, mobile has Cart in bottom nav) ── */}
            <Link
              href="/cart"
              className="hidden lg:flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xs hover:outline-1 hover:outline-white shrink-0 relative"
              aria-label="Shopping cart"
            >
              <div className="relative">
                <ShoppingCart size={24} className="text-white" />
                <span className="absolute -top-1.5 left-2.5 bg-[#f08804] text-gray-900 text-[10px] sm:text-xs font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center leading-none shadow-xs">
                  {cartCount}
                </span>
              </div>
              <span className="hidden sm:inline text-xs font-bold text-white mt-1">{t("nav.cart", "Cart")}</span>
            </Link>

            {/* Theme Toggle */}
            <div className="hidden lg:block pl-0.5">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* ── Amazon-Style Mobile Search Bar Row (Clean Full Width Pill) ── */}
        <div className="lg:hidden mt-1.5 px-0.5">
          <form onSubmit={handleSearch} className="flex items-center h-10 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500 transition">
            {/* Search Icon */}
            <div className="pl-3 pr-1 text-gray-500 flex items-center">
              <Search size={18} />
            </div>

            {/* Mobile Search Input */}
            <input
              id="header-search-mobile"
              name="search"
              type="text"
              placeholder="Search or ask a question"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-1.5 text-xs text-gray-900 placeholder-gray-500 outline-none bg-transparent"
            />

            {/* Right Action Icons: Camera (Lens), Mic (Voice), QrCode (Barcode) */}
            <div className="flex items-center gap-0.5 pr-1.5 shrink-0 text-gray-600">
              <button
                type="button"
                onClick={() => setIsVisualModalOpen(true)}
                className="p-1.5 hover:text-orange-500 text-gray-600 active:scale-95 transition rounded-full cursor-pointer"
                title="Visual Search"
              >
                <Camera size={18} />
              </button>

              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="p-1.5 hover:text-orange-500 text-gray-600 active:scale-95 transition rounded-full cursor-pointer"
                title="Voice Search"
              >
                <Mic size={18} />
              </button>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="p-1.5 hover:text-orange-500 text-gray-600 active:scale-95 transition rounded-full cursor-pointer"
                title="Scan Barcode / QR"
              >
                <QrCode size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ROW 2: Mobile Delivery Location & Prime Strip
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden bg-[#232f3e] text-white px-3 py-1.5 text-[11px] flex items-center justify-between border-t border-[#37475a]">
        <Link
          href={isLoggedIn ? "/profile?tab=addresses" : "/login"}
          className="flex items-center gap-1.5 text-gray-200 hover:text-white truncate flex-1"
        >
          <MapPin size={13} className="text-amber-400 shrink-0" />
          <span className="truncate">
            {t("nav.deliverTo", "Deliver to")} <strong>190009</strong>
          </span>
          <ChevronDown size={11} className="text-gray-400 shrink-0" />
        </Link>

        {/* Join Prime button */}
        <button
          type="button"
          onClick={() => setIsPrimeModalOpen(true)}
          className="ml-2 px-3 py-0.8 bg-[#00a8e1] hover:bg-[#0092c7] text-white text-[11px] font-bold rounded-full shadow-xs shrink-0 transition active:scale-95 cursor-pointer"
        >
          Join Prime
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ROW 3: Amazon-Style Sub-Navigation Bar (#232f3e Navy) - Desktop Only
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block bg-[#232f3e] text-white px-2 sm:px-4 py-1.5 text-xs font-medium border-t border-[#37475a] overflow-x-auto scrollbar-none">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
            {/* ☰ All Drawer Button */}
            <button
              type="button"
              onClick={() => setIsSideDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs hover:outline-1 hover:outline-white font-bold text-white cursor-pointer"
            >
              <Menu size={16} />
              <span>{t("nav.all", "All")}</span>
            </button>

            {/* AI Assistant Badge / Rufus Trigger */}
            <button
              type="button"
              onClick={() => setIsRufusOpen(true)}
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500/25 via-amber-500/25 to-red-500/25 border border-orange-400/50 text-amber-300 font-extrabold hover:bg-orange-500/40 transition cursor-pointer shadow-xs"
            >
              <Sparkles size={13} className="text-orange-400 fill-orange-400" />
              <span>✨ Ask Rufus AI</span>
            </button>

            {/* Sports Links */}
            <Link href="/products?search=cricket" className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white">
              {t("nav.cricket", "Cricket Willow")}
            </Link>
            <Link href="/products?search=football" className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white">
              {t("nav.football", "Football")}
            </Link>
            <Link href="/products?search=badminton" className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white">
              {t("nav.badminton", "Badminton")}
            </Link>
            <Link href="/products?search=gym" className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white">
              {t("nav.gym", "Gym & Fitness")}
            </Link>
            <Link href="/products" className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white">
              {t("nav.buyAgain", "Buy Again")}
            </Link>
            <button
              type="button"
              onClick={() => setIsPrimeModalOpen(true)}
              className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white text-left cursor-pointer flex items-center gap-1"
            >
              <span>{t("nav.prime", "Sportify Prime")}</span>
              <span className="text-[9px] bg-amber-400 text-gray-950 font-black px-1 rounded-xs">VIP</span>
            </button>
            <Link href="/wholesale" className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white font-bold text-amber-300">
              {t("nav.wholesale", "Academy Wholesale")}
            </Link>
            <Link href="/contact" className="px-2 py-1 rounded-xs hover:outline-1 hover:outline-white">
              {t("nav.service", "Customer Service")}
            </Link>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold hover:bg-cyan-500/30 transition cursor-pointer"
            >
              <QrCode size={13} className="text-cyan-300" />
              <span>📱 QR &amp; AI Scanner</span>
            </button>
          </div>

          {/* Right Banner Promo Tag */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-bold text-amber-400 shrink-0">
            <span>🏆 KASHMIR&apos;S #1 SPORTS HUB</span>
            <span className="text-white/40">|</span>
            <span className="text-gray-200">100% Genuine Handcrafted Willow</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          DRAWER: Amazon-Style Full "All" Left Side-Drawer with Sub-Categories
      ═══════════════════════════════════════════════════════════════════════ */}
      {isSideDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSideDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div
            ref={sideDrawerRef}
            className="relative w-[88vw] sm:w-[420px] max-w-md bg-white text-gray-900 h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-250"
          >
            {/* Header */}
            <div className="bg-[#232f3e] text-white p-4 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">
                    Hello, {isLoggedIn && user ? (user.username || "User") : "Sign In"}
                  </h3>
                  <p className="text-xs text-gray-300">Browse All Sports &amp; Sub-Categories</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSideDrawerOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm divide-y divide-gray-100">
              {/* Section 1: Trending */}
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider mb-2.5">
                  Trending in Kashmir
                </h4>
                <ul className="space-y-1 text-gray-700 font-medium">
                  <li>
                    <Link
                      href="/products?search=kashmir+willow"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      🔥 Handcrafted Kashmir Willow Bats
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      ⚡ 24h Express Delivery Gear
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/notifications"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 font-bold text-gray-900 transition flex items-center justify-between"
                    >
                      <span>🔔 Notifications &amp; Updates</span>
                      <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">New</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/wholesale"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-orange-50 hover:text-orange-600 text-orange-600 font-bold transition"
                    >
                      🏫 Academy &amp; Club Bulk Wholesale (25% OFF)
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Section 2: Shop by Sport (WITH EXPANDABLE SUBCATEGORIES) */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                    Shop by Sport &amp; Sub-Categories
                  </h4>
                  <span className="text-[11px] text-gray-400 font-normal">Click to expand</span>
                </div>

                <div className="space-y-2">
                  {DETAILED_SPORTS_CATEGORIES.map((cat) => {
                    const isExpanded = expandedCategoryId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/70 transition"
                      >
                        {/* Category Header Row */}
                        <div className="flex items-center justify-between p-2.5 bg-white hover:bg-orange-50/50 cursor-pointer transition">
                          <Link
                            href={cat.href}
                            onClick={() => setIsSideDrawerOpen(false)}
                            className="flex items-center gap-2.5 font-bold text-gray-900 hover:text-orange-600 flex-1 min-w-0"
                          >
                            <span className="text-orange-500 shrink-0">{cat.icon}</span>
                            <span className="truncate">{cat.name}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleCategoryAccordion(cat.id)}
                            className="p-1 text-gray-500 hover:text-orange-600 rounded cursor-pointer"
                            aria-label="Toggle subcategories"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-180 text-orange-600" : ""}`}
                            />
                          </button>
                        </div>

                        {/* Subcategories List */}
                        {isExpanded && (
                          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                            {cat.subcategories.map((sub) => (
                              <Link
                                key={sub.title}
                                href={`/products?search=${encodeURIComponent(sub.query)}`}
                                onClick={() => setIsSideDrawerOpen(false)}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-medium text-gray-700 hover:text-orange-600 hover:bg-white transition group"
                              >
                                <span className="truncate">{sub.title}</span>
                                <ChevronRight size={12} className="text-gray-400 group-hover:text-orange-500 shrink-0 ml-1" />
                              </Link>
                            ))}
                            <Link
                              href={cat.href}
                              onClick={() => setIsSideDrawerOpen(false)}
                              className="block pt-1 pb-0.5 text-[11px] font-bold text-orange-600 hover:underline px-2"
                            >
                              Explore all {cat.name} →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Programs & Features */}
              <div className="pt-4">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider mb-2.5">
                  Programs &amp; Features
                </h4>
                <ul className="space-y-1 text-gray-700 font-medium">
                  <li>
                    <Link
                      href="/wholesale"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-gray-100 hover:text-orange-600 font-bold text-orange-600"
                    >
                      🏫 Academy Wholesale &amp; Institutional Supply
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSideDrawerOpen(false);
                        setIsPrimeModalOpen(true);
                      }}
                      className="w-full text-left py-2 px-2.5 rounded-lg hover:bg-gray-100 hover:text-orange-600 font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span>Sportify Prime Membership</span>
                      <span className="text-[10px] bg-amber-400 text-gray-900 font-bold px-1.5 py-0.5 rounded-sm">VIP</span>
                    </button>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-gray-100 hover:text-orange-600"
                    >
                      Customer Support
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Section 4: Help & Settings */}
              <div className="pt-4">
                <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider mb-2.5">
                  Help &amp; Settings
                </h4>
                <ul className="space-y-1 text-gray-700 font-medium">
                  <li>
                    <Link
                      href="/profile"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-gray-100 hover:text-orange-600"
                    >
                      Your Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      onClick={() => setIsSideDrawerOpen(false)}
                      className="block py-2 px-2.5 rounded-lg hover:bg-gray-100 hover:text-orange-600"
                    >
                      Your Orders
                    </Link>
                  </li>
                  <li>
                    {isLoggedIn ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSideDrawerOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left py-2 px-2.5 text-red-600 font-bold hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsSideDrawerOpen(false)}
                        className="block py-2 px-2.5 text-orange-600 font-bold hover:bg-orange-50 rounded-lg"
                      >
                        Sign In
                      </Link>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Search Modals (Voice, Visual, QR) */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={(text) => {
          setSearchQuery(text);
          router.push(`/products?search=${encodeURIComponent(text)}`);
        }}
      />
      <VisualSearchModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
      />
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
      <PrimeMembershipModal
        isOpen={isPrimeModalOpen}
        onClose={() => setIsPrimeModalOpen(false)}
      />
      <RufusAIAssistant
        isOpen={isRufusOpen}
        onClose={() => setIsRufusOpen(false)}
      />
    </header>
  );
}
