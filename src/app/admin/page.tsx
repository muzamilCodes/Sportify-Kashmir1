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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100/80 text-green-700 border border-green-200 shadow-sm uppercase tracking-wide">
            <CheckCircle className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100/80 text-purple-700 border border-purple-200 shadow-sm uppercase tracking-wide">
            <Truck className="w-3.5 h-3.5" />
            Shipped
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100/80 text-blue-700 border border-blue-200 shadow-sm uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5" />
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100/80 text-orange-700 border border-orange-200 shadow-sm uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100/80 text-red-700 border border-red-200 shadow-sm uppercase tracking-wide">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide shadow-sm">
            {status}
          </span>
        );
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee className="w-7 h-7" />,
      change: stats.revenueGrowth,
      trend: stats.revenueGrowth >= 0 ? "up" : "down",
      gradient: "from-orange-500 to-red-500",
      shadow: "shadow-orange-500/20",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-7 h-7" />,
      change: stats.ordersGrowth,
      trend: stats.ordersGrowth >= 0 ? "up" : "down",
      gradient: "from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/20",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="w-7 h-7" />,
      change: stats.productsGrowth,
      trend: stats.productsGrowth >= 0 ? "up" : "down",
      gradient: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-7 h-7" />,
      change: stats.usersGrowth,
      trend: stats.usersGrowth >= 0 ? "up" : "down",
      gradient: "from-fuchsia-500 to-purple-500",
      shadow: "shadow-purple-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-10">
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[120px] -z-10 -mt-32 -mr-32 pointer-events-none"></div>
      <div className="absolute top-[40%] left-0 w-[400px] h-[400px] bg-pink-100/40 rounded-full blur-[100px] -z-10 -ml-32 pointer-events-none"></div>

      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Admin Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">Here's what's happening in your store today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
          <Activity className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-gray-700">Live Dashboard</span>
          <span className="relative flex h-3 w-3 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative glass rounded-3xl p-6 overflow-hidden hover-lift border-white/60"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-500 font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-4 bg-gradient-to-br ${stat.gradient} text-white rounded-2xl shadow-lg ${stat.shadow} transform -rotate-6 group-hover:rotate-0 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100/80">
              <div className={`flex items-center justify-center px-2 py-1 rounded-lg text-sm font-bold ${stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {stat.trend === "up" ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(stat.change)}%
              </div>
              <span className="text-gray-400 text-sm font-medium">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Today's Overview */}
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Today's Activity</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="group flex justify-between items-center p-5 bg-gradient-to-r from-orange-50 to-transparent hover:from-orange-100/50 rounded-2xl border border-transparent hover:border-orange-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">New Orders Today</p>
                  <p className="text-2xl font-extrabold text-gray-900">{stats.todayOrders}</p>
                </div>
              </div>
              <Link href="/admin/orders" className="text-blue-500 hover:text-blue-700 bg-white p-2 rounded-full shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="group flex justify-between items-center p-5 bg-gradient-to-r from-orange-50 to-transparent hover:from-orange-100/50 rounded-2xl border border-transparent hover:border-orange-100 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Orders to Fulfill</p>
                  <p className="text-2xl font-extrabold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
              <Link href="/admin/orders?status=pending" className="text-orange-500 hover:text-orange-700 bg-white p-2 rounded-full shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="group flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-transparent hover:from-green-100/50 rounded-2xl border border-transparent hover:border-green-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                  <p className="text-2xl font-extrabold text-gray-900">₹0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white p-8">
           <h3 className="text-xl font-bold text-gray-900 mb-8">Quick Actions</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
             <Link href="/admin/products/add" className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500">
                  <PlusCircle className="w-24 h-24" />
                </div>
                <PlusCircle className="w-8 h-8 mb-4 relative z-10" />
                <h4 className="text-lg font-bold relative z-10">Add New Product</h4>
                <p className="text-orange-100 text-sm mt-1 relative z-10">Expand your store catalog</p>
             </Link>

             <Link href="/admin/orders" className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-blue-500 p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1">
                <Eye className="w-8 h-8 mb-4 text-blue-500" />
                <h4 className="text-lg font-bold text-gray-900">View All Orders</h4>
                <p className="text-gray-500 text-sm mt-1">Manage and track shipments</p>
             </Link>

             <Link href="/admin/categories" className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-purple-500 p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Package className="w-8 h-8 mb-4 text-purple-500" />
                    <h4 className="text-lg font-bold text-gray-900">Manage Categories</h4>
                    <p className="text-gray-500 text-sm mt-1">Organize your product hierarchy</p>
                  </div>
                  <ChevronRight className="w-8 h-8 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-2 transition-all" />
                </div>
             </Link>
           </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-white overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <p className="text-sm text-gray-500 mt-1">Latest transactions across your store</p>
          </div>
          <Link
            href="/admin/orders"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all text-sm shadow-sm"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="p-0">
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="px-8 py-5 font-semibold">Order ID</th>
                    <th className="px-8 py-5 font-semibold">Customer</th>
                    <th className="px-8 py-5 font-semibold">Amount</th>
                    <th className="px-8 py-5 font-semibold">Status</th>
                    <th className="px-8 py-5 font-semibold">Payment</th>
                    <th className="px-8 py-5 font-semibold">Date</th>
                    <th className="px-8 py-5 font-semibold text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-8 py-4 font-mono text-sm font-bold text-gray-700">
                        #{order.orderId || order._id.slice(-8)}
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-bold text-gray-900">{order.customerName}</span>
                      </td>
                      <td className="px-8 py-4 font-bold text-gray-900">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-8 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-8 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          {order.paymentMethod === "cod" ? "COD" : "ONLINE"}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-gray-500 text-sm font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="inline-flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm transition-all group-hover:bg-orange-50"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Recent Orders</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">When customers place orders, they will appear here in your dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}