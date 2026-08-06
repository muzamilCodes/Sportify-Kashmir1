"use client";

import {
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  Clock,
  Eye,
  PlusCircle,
  Truck,
  CheckCircle,
  XCircle,
  ChevronRight,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  productsGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  revenueGrowth: number;
}

interface RecentOrder {
  _id: string;
  orderId: string;
  customerName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    productsGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    revenueGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        setStats(result.data.stats);
        setRecentOrders(result.data.recentOrders || []);
      } else {
        toast.error(result.message || "Failed to load dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100/80 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 uppercase tracking-wide">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100/80 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 uppercase tracking-wide">
            <Truck className="w-3 h-3" />
            Shipped
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100/80 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 uppercase tracking-wide">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100/80 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30 uppercase tracking-wide">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100/80 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 uppercase tracking-wide">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 uppercase tracking-wide">
            {status}
          </span>
        );
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee className="w-6 h-6" />,
      change: stats.revenueGrowth,
      trend: stats.revenueGrowth >= 0 ? "up" : "down",
      gradient: "from-orange-500 to-red-500",
      shadow: "shadow-orange-500/20",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-6 h-6" />,
      change: stats.ordersGrowth,
      trend: stats.ordersGrowth >= 0 ? "up" : "down",
      gradient: "from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/20",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="w-6 h-6" />,
      change: stats.productsGrowth,
      trend: stats.productsGrowth >= 0 ? "up" : "down",
      gradient: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      change: stats.usersGrowth,
      trend: stats.usersGrowth >= 0 ? "up" : "down",
      gradient: "from-fuchsia-500 to-purple-500",
      shadow: "shadow-purple-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-gray-500 dark:text-gray-400 font-medium text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-8">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 dark:bg-orange-500/5 rounded-full blur-[120px] -z-10 -mt-32 -mr-32 pointer-events-none"></div>
      <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-pink-100/40 dark:bg-pink-500/5 rounded-full blur-[100px] -z-10 -ml-32 pointer-events-none"></div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium text-sm">Here's what's happening in your store today.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Activity className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Live Dashboard</span>
          <span className="relative flex h-2.5 w-2.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/60 dark:border-gray-700 shadow-xl rounded-2xl p-5 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-bl-[80px] -mr-6 -mt-6 transition-transform group-hover:scale-110`}></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-xs mb-1">{stat.title}</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-3 bg-gradient-to-br ${stat.gradient} text-white rounded-xl shadow-lg ${stat.shadow} transform -rotate-6 group-hover:rotate-0 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-100/80 dark:border-gray-700">
              <div className={`flex items-center justify-center px-1.5 py-0.5 rounded-md text-xs font-bold ${stat.trend === "up" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"}`}>
                {stat.trend === "up" ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {Math.abs(stat.change)}%
              </div>
              <span className="text-gray-400 dark:text-gray-500 text-xs font-medium">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Today's Overview */}
        <div className="lg:col-span-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Today's Activity</h3>
            <div className="p-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="group flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 dark:from-orange-500/5 to-transparent hover:from-orange-100/50 dark:hover:from-orange-500/10 rounded-xl border border-transparent hover:border-orange-100 dark:hover:border-orange-500/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-blue-100 dark:border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">New Orders Today</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{stats.todayOrders}</p>
                </div>
              </div>
              <Link href="/admin/orders" className="text-blue-500 dark:text-blue-400 hover:text-blue-700 bg-white dark:bg-gray-700 p-1.5 rounded-full shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="group flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 dark:from-orange-500/5 to-transparent hover:from-orange-100/50 dark:hover:from-orange-500/10 rounded-xl border border-transparent hover:border-orange-100 dark:hover:border-orange-500/20 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-orange-100 dark:border-orange-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Orders to Fulfill</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
                </div>
              </div>
              <Link href="/admin/orders?status=pending" className="text-orange-500 dark:text-orange-400 hover:text-orange-700 bg-white dark:bg-gray-700 p-1.5 rounded-full shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="group flex justify-between items-center p-4 bg-gradient-to-r from-green-50 dark:from-green-500/5 to-transparent hover:from-green-100/50 dark:hover:from-green-500/10 rounded-xl border border-transparent hover:border-green-100 dark:hover:border-green-500/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-green-100 dark:border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-5 h-5 text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Today's Revenue</p>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">₹0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-7 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white dark:border-gray-700 p-6">
           <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Link href="/admin/products/add" className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 text-white p-5 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500">
                  <PlusCircle className="w-20 h-20" />
                </div>
                <PlusCircle className="w-6 h-6 mb-3 relative z-10" />
                <h4 className="text-base font-bold relative z-10">Add New Product</h4>
                <p className="text-orange-100 text-xs mt-1 relative z-10">Expand your store catalog</p>
             </Link>

             <Link href="/admin/orders" className="group relative overflow-hidden bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 p-5 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1">
                <Eye className="w-6 h-6 mb-3 text-blue-500 dark:text-blue-400" />
                <h4 className="text-base font-bold text-gray-900 dark:text-white">View All Orders</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Manage and track shipments</p>
             </Link>

             <Link href="/admin/categories" className="group relative overflow-hidden bg-white dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 p-5 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Package className="w-6 h-6 mb-3 text-purple-500 dark:text-purple-400" />
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">Manage Categories</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Organize your product hierarchy</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-hover:translate-x-2 transition-all" />
                </div>
             </Link>
           </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-700/30">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Orders</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest transactions across your store</p>
          </div>
          <Link
            href="/admin/orders"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-bold transition-all text-xs shadow-sm"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="p-0">
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Order ID</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Payment</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-colors group">
                      <td className="px-6 py-3 font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
                        #{order.orderId || order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-3">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{order.customerName}</span>
                      </td>
                      <td className="px-6 py-3 font-bold text-gray-900 dark:text-white text-sm">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-3">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          {order.paymentMethod === "cod" ? "COD" : "ONLINE"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-500/30 hover:shadow-sm transition-all group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100 dark:border-gray-600">
                <ShoppingBag className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">No Recent Orders</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5 max-w-sm mx-auto">When customers place orders, they will appear here in your dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}