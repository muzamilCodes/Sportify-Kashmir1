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
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3" />
            Shipped
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="w-6 h-6" />,
      change: stats.productsGrowth,
      trend: stats.productsGrowth >= 0 ? "up" : "down",
      color: "bg-blue-500",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-6 h-6" />,
      change: stats.ordersGrowth,
      trend: stats.ordersGrowth >= 0 ? "up" : "down",
      color: "bg-green-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      change: stats.usersGrowth,
      trend: stats.usersGrowth >= 0 ? "up" : "down",
      color: "bg-purple-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: <IndianRupee className="w-6 h-6" />,
      change: stats.revenueGrowth,
      trend: stats.revenueGrowth >= 0 ? "up" : "down",
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    from last month
                  </span>
                </div>
              </div>
              <div className={`p-3 ${stat.color} bg-opacity-10 rounded-lg`}>
                <div className={`${stat.color.replace("bg", "text")}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Today's Overview */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.todayOrders}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/orders"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View All →
              </Link>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pendingOrders}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/orders?status=pending"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                View Details →
              </Link>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/products/add"
              className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
            >
              <PlusCircle className="w-5 h-5" />
              Add New Product
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-center gap-2 w-full border border-orange-500 text-orange-500 py-3 rounded-lg hover:bg-orange-50 transition"
            >
              <Eye className="w-5 h-5" />
              View All Orders
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              <Package className="w-5 h-5" />
              Manage Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View All Orders →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Action</th>
                   </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-t">
                      <td className="py-3 font-mono text-sm">
                        #{order.orderId || order._id.slice(-8)}
                      </td>
                      <td className="py-3">{order.customerName}</td>
                      <td className="py-3 font-medium">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3">{getStatusBadge(order.status)}</td>
                      <td className="py-3">
                        <span className="text-xs text-gray-500">
                          {order.paymentMethod === "cod" ? "COD" : "Online"}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-700"
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
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No recent orders</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}