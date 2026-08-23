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
} from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { useCartCount } from "@/components/providers/CartCountProvider";
import { resolveProductImage } from "@/lib/imageHelper";
import ProductImage from "@/components/ProductImage";
import { cachedJson } from "@/lib/clientCache";

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

const SPORTS_CATEGORIES = [
  { name: "Football", href: "/categories/football", icon: <Goal size={18} />, color: "from-blue-500 to-indigo-600" },
  { name: "Cricket", href: "/categories/cricket", icon: <Cricket size={18} />, color: "from-green-500 to-emerald-600" },
  { name: "Badminton", href: "/categories/badminton", icon: <Activity size={18} />, color: "from-red-400 to-orange-500" },
  { name: "Basketball", href: "/categories/basketball", icon: <Activity size={18} />, color: "from-orange-500 to-red-600" },
  { name: "Volleyball", href: "/categories/volleyball", icon: <Activity size={18} />, color: "from-yellow-400 to-orange-500" },
  { name: "Tennis", href: "/categories/tennis", icon: <Activity size={18} />, color: "from-green-400 to-lime-500" },
  { name: "Gym & Fitness", href: "/categories/gym-fitness", icon: <Dumbbell size={18} />, color: "from-slate-600 to-gray-800" },
  { name: "Running", href: "/categories/running", icon: <Activity size={18} />, color: "from-cyan-400 to-blue-500" },
  { name: "Cycling", href: "/categories/cycling", icon: <Bike size={18} />, color: "from-emerald-400 to-teal-600" },
  { name: "Swimming", href: "/categories/swimming", icon: <Waves size={18} />, color: "from-blue-400 to-cyan-500" },
  { name: "Indoor Games", href: "/categories/indoor-games", icon: <Gamepad2 size={18} />, color: "from-purple-500 to-pink-600" },
  { name: "Sports Wear", href: "/categories/sports-wear", icon: <Shirt size={18} />, color: "from-pink-500 to-rose-600" },
  { name: "Sports Shoes", href: "/categories/sports-shoes", icon: <Tent size={18} />, color: "from-orange-400 to-red-500" },
  { name: "Accessories", href: "/categories/accessories", icon: <Pocket size={18} />, color: "from-gray-500 to-slate-700" },
  { name: "Cups & Trophies", href: "/categories/cups-trophies", icon: <Trophy size={18} />, color: "from-yellow-500 to-amber-600" },
];

const MAIN_NAV = [
  { href: "/", label: "Home", icon: <Home size={18} /> },
  { href: "/products", label: "Shop All", icon: <ShoppingBag size={18} /> },
  { href: "/sports", label: "Sports", icon: <Activity size={18} /> },
  { href: "/new-arrivals", label: "New Arrivals", icon: <Sparkles size={18} /> },
  { href: "/categories", label: "Categories", icon: <Trophy size={18} /> },
  { href: "/brands", label: "Brands", icon: <Award size={18} /> },
  { href: "/blog", label: "Blog", icon: <FileText size={18} /> },
  { href: "/sale", label: "Deals", icon: <Percent size={18} /> },
  { href: "/about", label: "About", icon: <Info size={18} /> },
  { href: "/faq", label: "FAQ", icon: <Info size={18} /> },
  { href: "/contact", label: "Contact", icon: <Mail size={20} /> },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { cartCount } = useCartCount();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [user?.profilePic, user?._id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smart search suggestions effect
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
        const res = await fetch(`${API_URL}/product/getAll?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        if (data.success && data.data) {
          const items = Array.isArray(data.data) ? data.data : data.data.items || [];
          setSearchSuggestions(items.slice(0, 6));
          setShowSuggestions(true);
        } else {
          setSearchSuggestions([]);
        }
      } catch (err) {
        console.error("Search suggestion error:", err);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

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
        } catch (e) {
          console.error("Error parsing user data:", e);
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
    window.addEventListener("popstate", checkAuth);
    return () => {
      window.removeEventListener("authUpdated", checkAuth);
      window.removeEventListener("userUpdated", checkAuth);
      window.removeEventListener("popstate", checkAuth);
    };
  }, [pathname]);

  // Verify token
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/user/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        
        if (result.payload) {
          setUser(result.payload);
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(result.payload));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error verifying user:", error);
      }
    };
    
    if (localStorage.getItem("token")) {
      verifyToken();
    }
  }, [API_URL]);

  const [quickBuyProducts, setQuickBuyProducts] = useState<any[]>([]);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);

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
      router.push(`/products?search=${encodeURIComponent(query)}`);
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
    router.push("/login");
  };

  const profileImageUrl = getProfileImageUrl(user?.profilePic);

  return (
    <header
      suppressHydrationWarning
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
          : "shadow-lg bg-white dark:bg-gray-900"
      }`}
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white text-center py-2 px-4 text-xs font-semibold tracking-wide shadow-inner">
        <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span>🚚</span> Free Shipping on orders above ₹999
          </span>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span>⚡</span> Kashmir&apos;s Fastest Sports Delivery
          </span>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <span>🏆</span> 100% Authentic Products
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Sportify <span className="text-gray-900 dark:text-white">Kashmir</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Sports Excellence Delivered</p>
            </div>
          </Link>

          {/* Desktop Search with Smart Suggestions */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-6 relative" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="header-search-desktop"
                name="search"
                type="text"
                placeholder="Search sports gear, shoes, jerseys, equipment..."
                value={searchQuery}
                aria-label="Search sports gear, shoes, jerseys, equipment"
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-28 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:shadow-md transition-shadow flex items-center gap-1 cursor-pointer"
              >
                {isSearching ? <Loader2 size={13} className="animate-spin" /> : "Search"}
              </button>
            </form>

            {/* Suggestions Popup */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 font-semibold px-3">
                  <span>Search Suggestions</span>
                  <span className="text-[11px] font-normal">{searchSuggestions.length} items found</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
                  {searchSuggestions.map((item) => {
                    const img = item.productImgUrls?.[0] || item.images?.[0];
                    const imgSrc = img ? resolveProductImage(img) : "/placeholder.svg";
                    const hasDiscount = item.discount && item.discount > 0;
                    const finalPrice = hasDiscount ? item.price - (item.price * item.discount) / 100 : item.price;

                    return (
                      <Link
                        key={item._id}
                        href={`/product/${item._id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-orange-50/70 dark:hover:bg-orange-950/30 transition-colors group"
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700 shrink-0 border border-gray-100 dark:border-gray-600 flex items-center justify-center">
                          <ProductImage
                            product={item}
                            alt={item.name}
                            fill
                            sizes="44px"
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-600 transition-colors">
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
                            {item.category && (
                              <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                {typeof item.category === "object" ? item.category.name : item.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="w-full py-2 bg-gray-50 dark:bg-gray-750 hover:bg-orange-50 dark:hover:bg-gray-700 text-xs font-semibold text-orange-600 text-center transition-colors border-t border-gray-100 dark:border-gray-700"
                >
                  View all results for &quot;{searchQuery}&quot; →
                </button>
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist - Desktop */}
            <Link href="/wishlist" className="hidden md:flex relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition group" aria-label="Wishlist">
              <Heart className="text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition" size={22} />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition group" aria-label="Shopping Cart">
              <ShoppingCart className="text-gray-700 dark:text-gray-300 group-hover:text-orange-500 transition" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown (Amazon-style Mega Dropdown) */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                aria-label="Account and lists menu"
                aria-expanded={isUserMenuOpen}
              >
                {isLoggedIn && profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-orange-500 shrink-0"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                    <User className="text-gray-600 dark:text-gray-300" size={18} />
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal truncate max-w-[120px]">
                    Hello, {isLoggedIn && user ? (user.username || user.email?.split("@")[0]) : "sign in"}
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-0.5">
                    Account & Lists
                    <ChevronDown size={13} className={`text-gray-500 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </span>
                </div>
              </button>

              {/* Amazon Mega Dropdown Menu */}
              <div
                className={`absolute right-0 top-full mt-2 w-[92vw] sm:w-[580px] lg:w-[680px] bg-white dark:bg-gray-850 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-200 z-50 overflow-hidden ${
                  isUserMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
              >
                {/* ─── Top Bar: Profile Strip ─── */}
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span>Who is shopping?</span>
                    {isLoggedIn && user ? (
                      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        {user.username || user.email}
                      </span>
                    ) : (
                      <span className="font-medium text-gray-500">Guest Customer</span>
                    )}
                  </div>
                  <Link
                    href={isLoggedIn ? "/profile" : "/login"}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-0.5 hover:underline"
                  >
                    {isLoggedIn ? "Manage Profile ›" : "Sign In ›"}
                  </Link>
                </div>

                {/* ─── 3-Column Grid ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700/60 p-4 gap-4">
                  {/* Column 1: Buy It Again (sm:col-span-5) */}
                  <div className="sm:col-span-5 pr-0 sm:pr-2">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-100 dark:border-gray-700">
                      <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                        Buy it again
                      </h4>
                      <Link
                        href="/products"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold hover:underline"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      {quickBuyProducts.length > 0 ? (
                        quickBuyProducts.map((prod) => (
                          <div
                            key={prod._id}
                            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition group"
                          >
                            <Link
                              href={`/product/${prod._id}`}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="relative w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-750 shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center p-1"
                            >
                              <ProductImage
                                product={prod}
                                alt={prod.name}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/product/${prod._id}`}
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-orange-600 transition">
                                  {prod.name}
                                </p>
                              </Link>
                              <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                ₹{Math.round(prod.discount ? prod.price - (prod.price * prod.discount) / 100 : prod.price).toLocaleString("en-IN")}
                              </p>
                              <button
                                type="button"
                                onClick={(e) => handleQuickAddToCart(prod._id, e)}
                                disabled={addingCartId === prod._id}
                                className="mt-1 px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-400 hover:bg-amber-500 text-gray-900 transition flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
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
                        <div className="text-center py-4 text-xs text-gray-500">
                          <ShoppingBag size={20} className="mx-auto mb-1 text-gray-400" />
                          <span>No past orders yet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Your Lists (sm:col-span-3) */}
                  <div className="sm:col-span-3 px-0 sm:px-2 pt-3 sm:pt-0">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider pb-1.5 mb-2 border-b border-gray-100 dark:border-gray-700">
                      Your Lists
                    </h4>
                    <ul className="space-y-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                      <li>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-1.5 py-1 hover:text-orange-600 transition"
                        >
                          <Heart size={13} className="text-orange-500 shrink-0" />
                          <span>Your Wishlist</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/categories"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-1.5 py-1 hover:text-orange-600 transition"
                        >
                          <Award size={13} className="text-orange-500 shrink-0" />
                          <span>Sports Showroom</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/products"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-1.5 py-1 hover:text-orange-600 transition"
                        >
                          <Tag size={13} className="text-orange-500 shrink-0" />
                          <span>Special Deals</span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Your Account (sm:col-span-4) */}
                  <div className="sm:col-span-4 pl-0 sm:pl-2 pt-3 sm:pt-0">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider pb-1.5 mb-2 border-b border-gray-100 dark:border-gray-700">
                      Your Account
                    </h4>
                    {isLoggedIn && user ? (
                      <ul className="space-y-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {user?.isAdmin && (
                          <li>
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-1.5 py-1 text-orange-600 font-bold hover:underline"
                            >
                              <span>⭐ Admin Dashboard</span>
                            </Link>
                          </li>
                        )}
                        <li>
                          <Link
                            href="/profile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-1.5 py-1 hover:text-orange-600 transition"
                          >
                            <User size={13} className="text-gray-500 shrink-0" />
                            <span>Your Account</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-1.5 py-1 hover:text-orange-600 transition"
                          >
                            <ClipboardList size={13} className="text-gray-500 shrink-0" />
                            <span>Your Orders</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/profile?tab=addresses"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-1.5 py-1 hover:text-orange-600 transition"
                          >
                            <MapPin size={13} className="text-gray-500 shrink-0" />
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
                            className="flex items-center gap-1.5 py-1 text-orange-600 hover:underline cursor-pointer"
                          >
                            <Download size={13} className="shrink-0" />
                            <span>Install App</span>
                          </button>
                        </li>
                        <li className="pt-2 border-t border-gray-100 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 py-1 text-red-600 hover:text-red-700 font-bold transition cursor-pointer"
                          >
                            <LogOut size={13} className="shrink-0" />
                            <span>Sign Out</span>
                          </button>
                        </li>
                      </ul>
                    ) : (
                      <div className="space-y-2.5">
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center rounded-xl font-bold text-xs shadow-md transition"
                        >
                          Sign In
                        </Link>
                        <p className="text-[11px] text-gray-500 text-center">
                          New customer?{" "}
                          <Link
                            href="/signup"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="text-orange-600 font-bold hover:underline"
                          >
                            Start here.
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              className="p-2 lg:hidden rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isMenuOpen ? <X size={24} className="text-gray-700 dark:text-gray-300" /> : <Menu size={24} className="text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700" aria-label="Main Navigation">
          <div className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="py-4 border-t border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[70vh]">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="header-search-mobile"
                  name="search"
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  aria-label="Search products"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-28 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
            <div className="space-y-1">
              {MAIN_NAV.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-700 dark:text-gray-300" onClick={() => setIsMenuOpen(false)}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 px-3">Sports Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {SPORTS_CATEGORIES.map((category) => (
                  <Link key={category.name} href={category.href} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 transition text-gray-700 dark:text-gray-300" onClick={() => setIsMenuOpen(false)}>
                    {category.icon}
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            {!isLoggedIn && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link href="/login" className="block w-full text-center bg-orange-500 text-white py-2.5 rounded-xl font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link href="/signup" className="block w-full text-center border border-orange-500 text-orange-500 py-2.5 rounded-xl font-medium" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("show-pwa-install"));
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Download size={16} />
                Install Sportify App (PWA)
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
