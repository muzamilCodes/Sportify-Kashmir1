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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState("");
  const [userProfilePic, setUserProfilePic] = useState<string | null>(null);

  // ✅ Proper admin verification
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserName(userObj.username || "");
        if (userObj.profilePic) {
          if (userObj.profilePic.startsWith('http')) {
            setUserProfilePic(userObj.profilePic);
          } else {
            setUserProfilePic(`${process.env.NEXT_PUBLIC_API_URL}/uploads/${userObj.profilePic}`);
          }
        }
      } catch(e) {}
    }

    // Verify admin status
    const verifyAdmin = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/verify/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        
        if (result.success && result.payload.isAdmin === true) {
          setLoading(false);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        router.push("/");
      }
    };

    verifyAdmin();

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    if (typeof window !== "undefined") {
      checkMobile();
      window.addEventListener("resize", checkMobile);
    }
    
    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/stats`, {
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
    { href: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header - Fixed at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-600 dark:text-orange-400"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <h1 className="text-base font-bold text-gray-800 dark:text-white">Admin Panel</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only for mobile */}
      {isMobile && !sidebarOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex justify-around items-center py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-orange-500"
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full px-1 min-w-[16px] text-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex">
        {/* Backdrop overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
        )}

        {/* Sidebar - Responsive */}
        <aside
          className={`
            fixed top-0 bottom-0 left-0 z-50
            w-72 sm:w-80 lg:w-60
            bg-gradient-to-b from-gray-900 to-gray-800
            text-white transition-transform duration-300 ease-in-out
            overflow-y-auto shadow-2xl
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} className="text-orange-500" />
                <h1 className="text-base font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 pb-24">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg
                  transition-all duration-200 group text-sm
                  ${
                    pathname === item.href
                      ? "bg-gradient-brand text-white shadow-md shadow-orange-500/20"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className={pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-white"}>
                    {item.icon}
                  </span>
                  <span className={`text-sm font-medium ${sidebarOpen ? '' : 'hidden lg:block'}`}>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse ${sidebarOpen ? '' : 'hidden lg:block'}`}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile & Logout - Fixed at bottom on desktop, scrollable on mobile */}
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-3 mt-auto">
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-800 rounded-lg">
              {userProfilePic ? (
                <img src={userProfilePic} alt="Admin" className="w-8 h-8 rounded-full object-cover border border-orange-500" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">A</div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white line-clamp-1">{userName || "Admin"}</span>
                <span className="text-[10px] text-gray-400">Administrator</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg w-full transition-all duration-200 group text-sm border border-transparent hover:border-red-900/30"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content - Responsive padding */}
        <main className="flex-1 min-h-screen w-full transition-all duration-300 lg:ml-60">
          {/* Spacer for mobile header */}
          <div className="lg:hidden h-14"></div>
          
          {/* Content */}
          <div className="p-3 sm:p-4 md:p-5 lg:p-6">
            {children}
          </div>
          
          {/* Spacer for mobile bottom nav */}
          {isMobile && !sidebarOpen && <div className="lg:hidden h-16"></div>}
        </main>
      </div>
    </div>
  );
}
