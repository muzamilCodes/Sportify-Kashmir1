"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  Clock,
  Shield,
  ChevronRight,
  Mail,
  Loader2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  orderValue: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: string;
  estimatedDelivery?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    mobile: string;
  };
  guestAddress?: {
    fullName: string;
    mobileNumber: string;
    email: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  products: Array<{
    productId?: {
      name: string;
      price: number;
      productImgUrls: string[];
    };
    quantity: number;
    price?: number;
  }>;
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/fetchOrderById/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success && data.data) {
        // Calculate estimated delivery (4 days from order date)
        const orderDate = new Date(data.data.createdAt);
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(orderDate.getDate() + 4);
        setOrder({
          ...data.data,
          estimatedDelivery: deliveryDate.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        });
      } else {
        toast.error("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto-refresh every 15 seconds to reflect status changes from admin
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  const cancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/cancelled/${orderId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Order cancelled successfully!");
        fetchOrder(); // refresh
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setCancelling(false);
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
${getCustomerName(order)} 
${getAddress(order).street}
${getAddress(order).city}, ${getAddress(order).state} - ${getAddress(order).pincode}
Phone: ${getCustomerPhone(order)}

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
        title: "Order Details - Sportify Kashmir",
        text: `Order #${order?._id?.slice(-8)} | Total: ₹${order?.orderValue?.toFixed(2)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  // Helper functions to handle both logged-in and guest orders
  const getCustomerName = (order: Order | null) => {
    if (!order) return "Customer";
    if (order.shippingAddress?.firstName)
      return `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`;
    if (order.guestAddress?.fullName) return order.guestAddress.fullName;
    return "Guest User";
  };

  const getCustomerPhone = (order: Order | null) => {
    if (!order) return "";
    if (order.shippingAddress?.mobile) return order.shippingAddress.mobile;
    if (order.guestAddress?.mobileNumber) return order.guestAddress.mobileNumber;
    return "";
  };

  const getAddress = (order: Order | null) => {
    if (!order) return { street: "", city: "", state: "", pincode: "" };
    if (order.shippingAddress) {
      return {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
      };
    }
    if (order.guestAddress) {
      return {
        street: order.guestAddress.street,
        city: order.guestAddress.city,
        state: order.guestAddress.state,
        pincode: order.guestAddress.postalCode,
      };
    }
    return { street: "", city: "", state: "", pincode: "" };
  };

  const canCancel = () => {
    const status = order?.orderStatus?.toLowerCase();
    return status === "pending" || status === "processing";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">Order Not Found</h2>
        <Link href="/orders" className="mt-4 text-orange-500 hover:underline">
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const statusSteps = ["pending", "processing", "shipped", "delivered"];
  const currentStep = statusSteps.indexOf(order.orderStatus?.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with back button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            ← Back to Orders
          </Link>
          <div className="flex gap-2">
            <button
              onClick={downloadInvoice}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Download Invoice"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={shareOrder}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Share Order"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {/* Order Header */}
          <div className="p-6 border-b bg-gradient-to-r from-orange-50 to-white">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Order #{order._id.slice(-8)}
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize inline-flex items-center gap-1 ${
                    order.orderStatus === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.orderStatus === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : order.orderStatus === "shipped"
                      ? "bg-purple-100 text-purple-700"
                      : order.orderStatus === "processing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.orderStatus === "delivered" && <CheckCircle className="w-4 h-4" />}
                  {order.orderStatus === "shipped" && <Truck className="w-4 h-4" />}
                  {order.orderStatus === "processing" && <Loader2 className="w-4 h-4 animate-spin" />}
                  {order.orderStatus === "pending" && <Clock className="w-4 h-4" />}
                  {order.orderStatus === "cancelled" && <XCircle className="w-4 h-4" />}
                  {order.orderStatus}
                </div>
                <div className="mt-2 text-xl font-bold text-orange-600">
                  ₹{order.orderValue?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="p-6 border-b">
            <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> Order Progress
            </h2>
            <div className="relative">
              <div className="flex justify-between">
                {statusSteps.map((step, idx) => (
                  <div key={step} className="flex-1 text-center relative z-10">
                    <div
                      className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center transition-all
                        ${
                          idx <= currentStep
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-400"
                        }`}
                    >
                      {idx === 0 && <Clock className="w-4 h-4" />}
                      {idx === 1 && <Package className="w-4 h-4" />}
                      {idx === 2 && <Truck className="w-4 h-4" />}
                      {idx === 3 && <CheckCircle className="w-4 h-4" />}
                    </div>
                    <p className="text-xs font-medium mt-2 capitalize text-gray-600">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery</p>
                  <p className="font-semibold text-gray-900">
                    {order.estimatedDelivery || "3-5 business days"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Two column info */}
          <div className="p-6 grid md:grid-cols-2 gap-6 border-b">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
                <MapPin className="w-4 h-4 text-orange-500" /> Shipping Address
              </h3>
              <div className="text-gray-600 text-sm space-y-1">
                <p className="font-medium">{getCustomerName(order)}</p>
                <p>{getAddress(order).street}</p>
                <p>
                  {getAddress(order).city}, {getAddress(order).state} - {getAddress(order).pincode}
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {getCustomerPhone(order)}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold flex items-center gap-2 text-gray-700 mb-2">
                <Shield className="w-4 h-4 text-orange-500" /> Payment Information
              </h3>
              <p className="text-gray-600 text-sm">
                Method: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
              </p>
              <p className="text-gray-600 text-sm">
                Status:{" "}
                <span className="font-medium text-green-600">
                  {order.paymentMethod === "cod" ? "Pending" : "Paid"}
                </span>
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Order Items
            </h3>
            <div className="space-y-4">
              {order.products.map((item, idx) => {
                const product = item.productId;
                const productName = product?.name || "Product";
                const productPrice = Number(product?.price) || Number(item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                const itemTotal = productPrice * quantity;
                const imgUrl =
                  product?.productImgUrls?.[0] ||
                  "https://placehold.co/400x400/EEE/999?text=No+Image";
                return (
                  <div key={idx} className="flex gap-4 p-3 border rounded-xl bg-white shadow-sm">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={imgUrl}
                        alt={productName}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://placehold.co/400x400/EEE/999?text=No+Image")
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{productName}</p>
                      <p className="text-sm text-gray-500 mt-1">Qty: {quantity}</p>
                      <p className="text-orange-600 font-semibold mt-1">
                        ₹{itemTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancel Button & Actions */}
          <div className="p-6 bg-gray-50 flex flex-wrap gap-4 justify-between items-center">
            {canCancel() && (
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel Order
              </button>
            )}
            <Link href="/products">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition">
                <Home className="w-4 h-4" /> Continue Shopping
              </button>
            </Link>
          </div>
        </div>

        {/* Recommended Products Section (Optional) */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">You May Also Like</h2>
            <Link href="/products" className="text-orange-500 hover:underline flex items-center gap-1">
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
                    <p className="font-medium text-gray-900 text-sm">Premium Item</p>
                    <p className="text-orange-600 font-bold mt-1">₹999</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}