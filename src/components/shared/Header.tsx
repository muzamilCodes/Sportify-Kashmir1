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
  Badge,
  Info,
  Mail,
  Goal,
  Dumbbell,
  Shirt,
  ClipboardList,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

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
  return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${profilePic}`;
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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

  // ✅ FIXED: Check token on every route change
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      console.log("Checking auth - Token exists:", !!token);
      console.log("Checking auth - UserData exists:", !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
          console.log("User set from localStorage:", parsedUser.username);
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
    
    // Also check when pathname changes (after navigation)
    const handleRouteChange = () => {
      checkAuth();
    };
    
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, [pathname]);

  // Verify token with backend
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        
        if (result.payload) {
          setUser(result.payload);
          setIsLoggedIn(true);
          localStorage.setItem("user", JSON.stringify(result.payload));
          console.log("User verified from backend:", result.payload.username);
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
  }, []);

  // ✅ FIXED: Update cart count with event listener
  // const fetchCartCount = async () => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/getCart`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const result = await response.json();
  //     if (result.success && result.data) {
  //       const products = result.data.products || [];
  //       const totalItems = products.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  //       setCartCount(totalItems);
  //     } else {
  //       setCartCount(0);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching cart:", error);
  //   }
  // };
const fetchCartCount = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    setCartCount(0);
    return;
  }
  try {
    // ✅ Add cache: 'no-store' to force fresh data
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/getCart`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success && result.data) {
      const products = result.data.products || [];
      const totalItems = products.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(totalItems);
    } else {
      setCartCount(0);
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
  }
};
  useEffect(() => {
    fetchCartCount();
    
    // ✅ Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    
    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("focus", handleCartUpdate);
    
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("focus", handleCartUpdate);
    };
  }, []);

  const sportsCategories = [
    { name: "Cricket", href: "/categories/cricket", icon: <Cricket size={18} />, subcategories: ["Bats", "Balls", "Pads", "Gloves", "Helmets", "Shoes"], color: "from-green-500 to-emerald-600" },
    { name: "Football", href: "/categories/football", icon: <Goal size={18} />, subcategories: ["Boots", "Balls", "Jerseys", "Shin Guards", "Goal Gloves", "Socks"], color: "from-blue-500 to-indigo-600" },
    { name: "Fitness", href: "/categories/fitness", icon: <Dumbbell size={18} />, subcategories: ["Dumbbells", "Yoga Mats", "Gym Wear", "Supplements", "Bench", "Accessories"], color: "from-red-500 to-orange-600" },
    { name: "Apparel", href: "/categories/apparel", icon: <Shirt size={18} />, subcategories: ["Jerseys", "Shorts", "Tracksuits", "Compression Wear", "Socks", "Caps"], color: "from-pink-500 to-rose-600" },
  ];

  const mainNav = [
    { href: "/", label: "Home", icon: <Home size={18} /> },
    { href: "/products", label: "Shop All", icon: <ShoppingBag size={18} /> },
    { href: "/categories", label: "Categories", icon: <Trophy size={18} /> },
    { href: "/brands", label: "Brands", icon: <Award size={18} /> },
    { href: "/sale", label: "Sale", icon: <Badge size={18} /> },
    { href: "/blog", label: "Blog", icon: <Info size={18} /> },
    { href: "/about", label: "About", icon: <Info size={18} /> },
    { href: "/contact", label: "Contact", icon: <Mail size={20} /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
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
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-xl bg-white/95 backdrop-blur-md" : "shadow-lg bg-white"}`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-2.5 px-4 text-sm font-medium">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>🚚 Free Shipping on orders above ₹999</span>
          <span className="hidden sm:inline">|</span>
          <span>⚡ Kashmir's Fastest Sports Delivery</span>
          <span className="hidden sm:inline">|</span>
          <span>🏆 100% Authentic Products</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Sportify <span className="text-gray-900">Kashmir</span>
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Sports Excellence Delivered</p>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-orange-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-1.5 rounded-full text-sm">
                Search
              </button>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition group">
              <ShoppingCart className="text-gray-700 group-hover:text-orange-500 transition" size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition"
              >
                {isLoggedIn && profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-9 h-9 rounded-full object-cover border-2 border-orange-500"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="text-gray-600" size={20} />
                  </div>
                )}
                {isLoggedIn && user && (
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.username || user.email?.split("@")[0]}
                  </span>
                )}
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border transition-all duration-200 z-50 ${
                isUserMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}>
                {isLoggedIn && user ? (
                  <>
                    <div className="px-4 py-3 border-b bg-gradient-to-r from-orange-50 to-red-50 rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        {profileImageUrl && !imageError ? (
                          <img src={profileImageUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-orange-500" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <User size={24} className="text-white" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{user?.username || "User"}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition" onClick={() => setIsUserMenuOpen(false)}>
                      <User size={18} className="text-gray-500" />
                      <div><div className="font-medium text-gray-900">My Account</div><div className="text-xs text-gray-500">View profile & orders</div></div>
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-t" onClick={() => setIsUserMenuOpen(false)}>
                      <ClipboardList size={18} className="text-gray-500" />
                      <div><div className="font-medium text-gray-900">My Orders</div><div className="text-xs text-gray-500">Track your orders</div></div>
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-t" onClick={() => setIsUserMenuOpen(false)}>
                      <Heart size={18} className="text-gray-500" />
                      <div><div className="font-medium text-gray-900">Wishlist</div><div className="text-xs text-gray-500">Saved items</div></div>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition rounded-b-2xl border-t">
                      <LogOut size={18} />
                      <div><div className="font-medium">Logout</div><div className="text-xs text-red-500">Sign out</div></div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-3 hover:bg-gray-50 border-b rounded-t-2xl" onClick={() => setIsUserMenuOpen(false)}>
                      <div className="font-medium">Login</div>
                      <div className="text-xs text-gray-500">Sign in to your account</div>
                    </Link>
                    <Link href="/signup" className="block px-4 py-3 hover:bg-gray-50 rounded-b-2xl" onClick={() => setIsUserMenuOpen(false)}>
                      <div className="font-medium">Create Account</div>
                      <div className="text-xs text-gray-500">Register now</div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 lg:hidden rounded-xl hover:bg-gray-100 transition">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-between py-3 border-t">
          <div className="flex items-center gap-2">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl"
                />
              </div>
            </form>
            <div className="space-y-1">
              {mainNav.map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition" onClick={() => setIsMenuOpen(false)}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-3 px-3">Sports Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {sportsCategories.map((category) => (
                  <Link key={category.name} href={category.href} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl hover:bg-orange-50 transition" onClick={() => setIsMenuOpen(false)}>
                    {category.icon}
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            {!isLoggedIn && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Link href="/login" className="block w-full text-center bg-orange-500 text-white py-2.5 rounded-xl font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link href="/signup" className="block w-full text-center border border-orange-500 text-orange-500 py-2.5 rounded-xl font-medium" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}