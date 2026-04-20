"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Share2,
  Download,
  Home,
  ShoppingBag,
  Star,
  Clock,
  Shield,
  ChevronRight,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

interface OrderDetails {
  _id: string;
  orderId: string;
  orderValue: number;
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    mobile: string;
  };
}

// Inner component that uses useSearchParams
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order_id");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Trigger confetti animation
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"],
        });

        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 50,
            origin: { y: 0.7, x: 0.3 },
          });
        }, 200);

        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 50,
            origin: { y: 0.7, x: 0.7 },
          });
        }, 400);
      });
    }

    fetchOrderDetails();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/fetchOrderById/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (result.success && result.data) {
        const orderDate = new Date(result.data.createdAt);
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(orderDate.getDate() + 4);
        
        setOrder({
          ...result.data,
          estimatedDelivery: deliveryDate.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    const invoiceContent = `
SPORTIFY KASHMIR - INVOICE
================================
Order ID: ${order?._id?.slice(-8)}
Date: ${new Date().toLocaleDateString()}
Total Amount: ₹${order?.orderValue?.toFixed(2)}
Payment Method: ${order?.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}

Shipping Address:
${order?.shippingAddress?.firstName} ${order?.shippingAddress?.lastName}
${order?.shippingAddress?.street}
${order?.shippingAddress?.city}, ${order?.shippingAddress?.state} - ${order?.shippingAddress?.pincode}
Phone: ${order?.shippingAddress?.mobile}

Thank you for shopping with Sportify Kashmir!
    `;
    
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${order?._id?.slice(-8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded!");
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: "Order Confirmed - Sportify Kashmir",
        text: `My order #${order?._id?.slice(-8)} has been confirmed! Total: ₹${order?.orderValue?.toFixed(2)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"></div>
        <div className="container mx-auto px-4 py-12 text-center relative">
          <div className="mb-6 animate-bounce">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full shadow-lg">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Order Confirmed! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for shopping with Sportify Kashmir
          </p>
          <p className="text-gray-500">
            Order ID: #{order?._id?.slice(-8) || orderId?.slice(-8)}
          </p>

          <div className="mt-4 inline-block bg-orange-100 text-orange-700 px-6 py-2 rounded-full font-semibold">
            Total Amount: ₹{order?.orderValue?.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={downloadInvoice}
            className="flex items-center justify-center gap-2 bg-white border rounded-lg p-3 hover:shadow-md transition"
          >
            <Download className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Download Invoice</span>
          </button>
          <button
            onClick={shareOrder}
            className="flex items-center justify-center gap-2 bg-white border rounded-lg p-3 hover:shadow-md transition"
          >
            <Share2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Share Order</span>
          </button>
          <Link href="/orders" className="flex items-center justify-center gap-2 bg-white border rounded-lg p-3 hover:shadow-md transition">
            <Package className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">My Orders</span>
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 bg-white border rounded-lg p-3 hover:shadow-md transition">
            <Home className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium">Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Order Status
              </h2>

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                    <p className="text-xs text-gray-500">Confirmed</p>
                  </div>
                  <div className="flex-1 h-0.5 bg-green-500"></div>
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Processing</p>
                    <p className="text-xs text-gray-400">In Progress</p>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Truck className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Shipped</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="text-center flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Delivered</p>
                    <p className="text-xs text-gray-400">Pending</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold text-gray-900">{order?.estimatedDelivery || "3-5 business days"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Confirmation</p>
                    <p className="text-sm text-gray-600">You will receive an email with your order details shortly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Track Your Order</p>
                    <p className="text-sm text-gray-600">Visit "My Orders" page to track your order in real-time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Need Help?</p>
                    <p className="text-sm text-gray-600">Contact our support team at support@sportifykashmir.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Shipping Address */}
            {order?.shippingAddress && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Shipping Address
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-gray-600 text-sm">{order.shippingAddress.street}</p>
                  <p className="text-gray-600 text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="text-gray-600 text-sm">📞 {order.shippingAddress.mobile}</p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                Payment Information
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">
                    {order?.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="text-green-600 font-medium">
                    {order?.paymentMethod === "cod" ? "Pending" : "Paid"}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Amount</span>
                    <span className="text-orange-600">₹{order?.orderValue?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-sm opacity-90 mb-4">
                Have questions about your order? Our support team is here to help!
              </p>
              <button
                onClick={() => window.location.href = "mailto:support@sportifykashmir.com"}
                className="w-full bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
            <Link href="/products" className="text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Link key={i} href="/products" className="group">
                <div className="bg-white rounded-xl shadow-sm border p-3 hover:shadow-md transition">
                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="mt-3">
                    <p className="font-medium text-gray-900 text-sm">Premium Sports Item</p>
                    <p className="text-orange-600 font-bold mt-1">₹999</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-500">4.5</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Auto Redirect */}
        <div className="text-center mt-8 pb-8">
          <p className="text-sm text-gray-500">
            You will be redirected to My Orders page in {countdown} seconds...
          </p>
          <button
            onClick={() => router.push("/orders")}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Click here if not redirected automatically
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary (ERROR FIX)
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}