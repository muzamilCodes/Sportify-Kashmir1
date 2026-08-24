"use client";

import {
  Award,
  FileText,
  Folder,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  X,
  Mail,
  Box,
  Ticket,
  BarChart,
  User,
  ExternalLink,
  Shield,
  Edit3,
  Camera,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminNotificationCenter from "@/components/admin/AdminNotificationCenter";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const resolvePic = (pic?: string) => {
    if (!pic) return null;
    if (pic.startsWith("http") || pic.startsWith("data:")) return pic;
    if (pic.startsWith("/uploads/")) return `${API_URL}${pic}`;
    return `${API_URL}/uploads/${pic}`;
  };

  const loadLocalUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserName(userObj.username || "Admin");
        setUserProfilePic(resolvePic(userObj.profilePic));
      } catch {}
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    loadLocalUser();

    // Verify admin status
    const verifyAdmin = async () => {
      try {
        const response = await fetch(`${API_URL}/user/verify/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (result.success && result.payload?.isAdmin === true) {
          setLoading(false);
          setUserName(result.payload.username || "Admin");
          setUserProfilePic(resolvePic(result.payload.profilePic));
          localStorage.setItem("user", JSON.stringify(result.payload));
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        router.push("/");
      }
    };

    verifyAdmin();

    const handleAuthUpdated = () => {
      loadLocalUser();
      verifyAdmin();
    };

    window.addEventListener("authUpdated", handleAuthUpdated);

    // Initial check for mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    if (typeof window !== "undefined") {
      checkMobile();
      window.addEventListener("resize", checkMobile);
    }

    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_URL}/contact/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success && result.data) {
          setUnreadCount(result.data.unread || 0);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    return () => {
      window.removeEventListener("authUpdated", handleAuthUpdated);
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", checkMobile);
      }
    };
  }, [router]);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/products", label: "Products", icon: <Package size={18} /> },
    { href: "/admin/inventory", label: "Inventory", icon: <Box size={18} /> },
    { href: "/admin/categories", label: "Categories", icon: <Folder size={18} /> },
    { href: "/admin/brands", label: "Brands", icon: <Award size={18} /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingBag size={18} /> },
    { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
    { href: "/admin/coupons", label: "Coupons", icon: <Ticket size={18} /> },
    { href: "/admin/reports", label: "Reports", icon: <BarChart size={18} /> },
    { href: "/admin/refunds", label: "Refunds", icon: <RefreshCw size={18} /> },
    { href: "/admin/posts", label: "Blog Posts", icon: <FileText size={18} /> },
    { href: "/admin/contacts", label: "Contact Messages", icon: <Mail size={18} />, badge: unreadCount },
    { href: "/admin/banners", label: "Hero Banners", icon: <ImageIcon size={18} /> },
    { href: "/admin/notifications", label: "Broadcast & Alerts", icon: <Megaphone size={18} /> },
    { href: "/admin/settings", label: "Store Settings", icon: <Settings size={18} /> },
    { href: "/admin/profile", label: "Admin Profile", icon: <User size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authUpdated"));
    router.push("/login");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* ── Mobile Top Header Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-xs">
        <div className="flex items-center justify-between px-3 py-2.5">
          {/* Toggle / Cross Button on Mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
              sidebarOpen
                ? "bg-red-500 text-white shadow-md hover:bg-red-600"
                : "bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400 hover:bg-orange-100"
            }`}
            aria-label={sidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2">
            <span className="font-black text-sm bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Sportify Admin
            </span>
          </div>

          {/* Mobile Right: Notification Bell & Quick Profile Icon */}
          <div className="flex items-center gap-2">
            <AdminNotificationCenter />
            <Link
              href="/admin/profile"
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {userProfilePic ? (
                <img
                  src={userProfilePic}
                  alt="Admin"
                  className="w-7 h-7 rounded-full object-cover border-2 border-orange-500"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold">
                  {userName.charAt(0).toUpperCase() || "A"}
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      {isMobile && !sidebarOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex justify-around items-center py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "text-orange-600 dark:text-orange-400 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-orange-500"
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex">
        {/* ── Backdrop Overlay for Mobile / Tablet ── */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed top-0 bottom-0 left-0 z-50
            w-72 sm:w-80 lg:w-64
            bg-gradient-to-b from-gray-950 via-gray-900 to-gray-900
            text-white transition-transform duration-300 ease-in-out
            overflow-y-auto shadow-2xl flex flex-col justify-between
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div>
            {/* Sidebar Header with Prominent [X] Close Button */}
            <div className="sticky top-0 bg-gray-950/95 backdrop-blur-sm z-10 p-4 border-b border-gray-800 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-md">
                  <LayoutDashboard size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Sportify Kashmir
                  </h1>
                  <p className="text-[10px] text-gray-400 font-medium">Administration</p>
                </div>
              </Link>

              {/* ❌ PROMINENT CROSS (CLOSE) BUTTON ❌ */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-gray-800 hover:bg-red-500 hover:text-white text-gray-300 transition-all cursor-pointer shadow-sm flex items-center justify-center group"
                title="Close Sidebar [X]"
                aria-label="Close sidebar menu"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl
                    transition-all duration-200 group text-xs font-semibold
                    ${
                      pathname === item.href
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/20"
                        : "text-gray-300 hover:bg-gray-800/80 hover:text-white"
                    }
                  `}
                  onClick={() => {
                    if (isMobile) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-white"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Profile & Edit Option Card (Fixed Bottom of Sidebar) */}
          <div className="sticky bottom-0 bg-gray-950/95 backdrop-blur-sm border-t border-gray-800 p-3">
            <Link
              href="/admin/profile"
              className="flex items-center justify-between p-2.5 bg-gray-850 hover:bg-gray-800 rounded-2xl border border-gray-750 transition group cursor-pointer mb-2"
              title="Click to view & edit admin profile"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  {userProfilePic ? (
                    <img
                      src={userProfilePic}
                      alt="Admin"
                      className="w-9 h-9 rounded-full object-cover border-2 border-orange-500"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">
                      {userName.charAt(0).toUpperCase() || "A"}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-gray-900 rounded-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition">
                    {userName || "Administrator"}
                  </p>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Shield size={10} className="text-orange-400" />
                    <span>Super Admin</span>
                  </span>
                </div>
              </div>
              <span className="p-1.5 bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white rounded-lg transition text-[11px] font-semibold">
                <Edit3 size={13} />
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:text-white hover:bg-red-950/40 rounded-xl w-full transition-all text-xs font-bold border border-transparent hover:border-red-800/40 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </aside>

        {/* ── Main Content Area (Expands when sidebar is closed) ── */}
        <main
          className={`flex-1 min-h-screen w-full transition-all duration-300 flex flex-col ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
        >
          {/* Desktop Top Header Bar with Toggle & Quick Profile Actions */}
          <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
              {/* Desktop Toggle / Cross Button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  sidebarOpen
                    ? "bg-gray-100 dark:bg-gray-700 hover:bg-red-500 hover:text-white text-gray-600 dark:text-gray-300"
                    : "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                }`}
                title={sidebarOpen ? "Collapse Sidebar [X]" : "Expand Sidebar [☰]"}
                aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">
                  Admin Workspace
                </span>
                <span className="text-gray-300 dark:text-gray-600">/</span>
                <span className="font-extrabold text-orange-600 dark:text-orange-400 capitalize">
                  {pathname.replace("/admin", "").replace("/", "") || "Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Center */}
              <AdminNotificationCenter />

              {/* View Public Store */}
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 hover:text-orange-600 rounded-xl text-xs font-bold transition"
              >
                <span>Live Store</span>
                <ExternalLink size={13} />
              </Link>

              {/* Admin Profile Chip */}
              <Link
                href="/admin/profile"
                className="flex items-center gap-2.5 p-1.5 pr-3.5 bg-gray-50 dark:bg-gray-750 hover:bg-orange-50 dark:hover:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 transition group"
              >
                {userProfilePic ? (
                  <img
                    src={userProfilePic}
                    alt="Admin"
                    className="w-7 h-7 rounded-full object-cover border border-orange-500"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">
                    {userName.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight group-hover:text-orange-600 transition">
                    {userName || "Admin"}
                  </p>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold block leading-none">
                    Edit Profile ›
                  </span>
                </div>
              </Link>
            </div>
          </header>

          {/* Spacer for mobile header */}
          <div className="lg:hidden h-14"></div>

          {/* Page Content */}
          <div className="p-4 sm:p-6 flex-1">
            {children}
          </div>

          {/* Spacer for mobile bottom nav */}
          {isMobile && !sidebarOpen && <div className="lg:hidden h-16"></div>}
        </main>
      </div>
    </div>
  );
}
