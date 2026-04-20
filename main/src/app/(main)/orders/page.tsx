// app/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Eye, Loader2, Calendar, IndianRupee, Truck, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  products: Array<{
    productId?: {
      name?: string;
      productImgUrls?: string[];
    };
    quantity: number;
    price?: number;
  }>;
  orderValue: number;
  orderStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/user-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
      else setOrders([]);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processing": return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "shipped": return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "shipped": return "bg-purple-100 text-purple-700";
      case "processing": return "bg-blue-100 text-blue-700";
      default: return "bg-yellow-100 text-yellow-700";
    }
  };

  const getSafePrice = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-700">No orders yet</h2>
        <p className="text-gray-500 mt-2 text-center">Looks like you haven't placed any order.</p>
        <Link href="/products" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-md">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
            📦 My Orders
          </h1>
          <p className="text-gray-500 mt-1">Track and manage all your orders</p>
        </div>

        <div className="space-y-5">
          {orders.map((order) => {
            const orderIdShort = order._id?.slice(-8) || "unknown";
            const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A";
            const totalValue = getSafePrice(order.orderValue).toFixed(2);
            const firstProduct = order.products?.[0];
            const productImage = firstProduct?.productId?.productImgUrls?.[0] || "/placeholder.jpg";
            const productName = firstProduct?.productId?.name || "Product";

            return (
              <div key={order._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6">
                  {/* Header row */}
                  <div className="flex flex-wrap justify-between items-start gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">#{orderIdShort}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {orderDate}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <IndianRupee className="w-4 h-4 text-orange-500" />
                        <span className="text-2xl font-bold text-orange-600">₹{totalValue}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="capitalize">{order.orderStatus || "pending"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product preview */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{productName}</p>
                      <p className="text-sm text-gray-500">{order.products?.length || 1} item(s)</p>
                    </div>
                    <Link href={`/orders/${order._id}`}>
                      <button className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition">
                        View Details <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 