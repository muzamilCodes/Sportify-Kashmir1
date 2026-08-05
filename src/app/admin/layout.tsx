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

  // ✅ Proper admin verification
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
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
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { href: "/admin/products", label: "Products", icon: <Package size={20} /> },
    { href: "/admin/inventory", label: "Inventory", icon: <Box size={20} /> },
    { href: "/admin/categories", label: "Categories", icon: <Folder size={20} /> },
    { href: "/admin/brands", label: "Brands", icon: <Award size={20} /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingBag size={20} /> },
    { href: "/admin/users", label: "Users", icon: <Users size={20} /> },
    { href: "/admin/coupons", label: "Coupons", icon: <Ticket size={20} /> },
    { href: "/admin/reports", label: "Reports", icon: <BarChart size={20} /> },
    { href: "/admin/refunds", label: "Refunds", icon: <RefreshCw size={20} /> },
    { href: "/admin/posts", label: "Blog Posts", icon: <FileText size={20} /> },
    { href: "/admin/contacts", label: "Contact Messages", icon: <Mail size={20} />, badge: unreadCount },
    { href: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-base sm:text-lg text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header - Fixed at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-600"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only for mobile */}
      {isMobile && !sidebarOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
          <div className="flex justify-around items-center py-2">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] text-center">
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
            w-72 sm:w-80 lg:w-64
            bg-gradient-to-b from-gray-900 to-gray-800
            text-white transition-transform duration-300 ease-in-out
            overflow-y-auto shadow-2xl
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={24} className="text-orange-500" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5 pb-24">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg
                  transition-all duration-200 group
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
                <div className="flex items-center gap-3">
                  <span className={pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-white"}>
                    {item.icon}
                  </span>
                  <span className={`text-sm font-medium ${sidebarOpen ? '' : 'hidden lg:block'}`}>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse ${sidebarOpen ? '' : 'hidden lg:block'}`}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Button - Fixed at bottom on desktop, scrollable on mobile */}
          <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg w-full transition-all duration-200 group"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content - Responsive padding */}
        <main className="flex-1 min-h-screen w-full transition-all duration-300 lg:ml-64">
          {/* Spacer for mobile header */}
          <div className="lg:hidden h-14"></div>
          
          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </div>
          
          {/* Spacer for mobile bottom nav */}
          {isMobile && !sidebarOpen && <div className="lg:hidden h-16"></div>}
        </main>
      </div>
    </div>
  );
}