"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  IndianRupee,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  RotateCcw,
  Lock,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import ProductImage from "@/components/ProductImage";

interface Order {
  _id: string;
  orderId: string;
  userId?: {
    _id: string;
    username?: string;
    email?: string;
    mobile?: string;
  };
  products: Array<{
    productId?: {
      _id: string;
      name: string;
      price: number;
      productImgUrls: string[];
    };
    quantity: number;
    price: number;
  }>;
  orderValue: number;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "confirmed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  shippingAddress?: {
    _id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    mobile: string;
    email?: string;
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
  createdAt: string;
  updatedAt: string;
  rejectionDetails?: {
    isRejected?: boolean;
    rejectedAt?: string;
    reason?: string;
    rejectedWithOtp?: boolean;
    rejectedByRole?: string;
  };
  rejectionOtp?: {
    code?: string;
    expiresAt?: string;
    attempts?: number;
    isUsed?: boolean;
    reason?: string;
  };
  statusHistory?: Array<{
    status: string;
    changedAt?: string;
    changedByRole?: string;
    changedByUser?: string;
    note?: string;
  }>;
}

export default function AdminOrdersPage() {
  const [requestedOrderId, setRequestedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [todayOnlyFilter, setTodayOnlyFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // 🚨 4-Digit Delivery Rejection OTP State (Flipkart Style)
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionTargetOrder, setRejectionTargetOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Customer refused to accept at doorstep");
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [rejectionOtpSent, setRejectionOtpSent] = useState(false);
  const [rejectionOtpCode, setRejectionOtpCode] = useState("");
  const [maskedCustomerEmail, setMaskedCustomerEmail] = useState("");
  const [rejectionTimerRemaining, setRejectionTimerRemaining] = useState(300);
  const [isSendingRejectionOtp, setIsSendingRejectionOtp] = useState(false);
  const [isVerifyingRejectionOtp, setIsVerifyingRejectionOtp] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get("orderId");
    const statusParam = params.get("status");
    const filterParam = params.get("filter");

    if (orderIdParam) setRequestedOrderId(orderIdParam);
    if (statusParam) setStatusFilter(statusParam);
    if (filterParam === "today") setTodayOnlyFilter(true);
    fetchOrders();
  }, []);

  // 5-minute countdown timer for OTP expiry
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showRejectionModal && rejectionOtpSent && rejectionTimerRemaining > 0) {
      interval = setInterval(() => {
        setRejectionTimerRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showRejectionModal, rejectionOtpSent, rejectionTimerRemaining]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/fetchAllOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success && result.data) {
        setOrders(result.data);
        setFilteredOrders(result.data);
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // If selecting cancelled/rejected on an active delivery order, enforce OTP verification flow
    if (newStatus === "cancelled") {
      const order = orders.find((o) => o._id === orderId);
      if (order && !order.rejectionDetails?.isRejected) {
        openRejectionModal(order);
        return;
      }
    }

    setUpdatingStatus(orderId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${newStatus}/${orderId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Order ${newStatus} successfully!`);
        fetchOrders();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Open Rejection OTP Modal
  const openRejectionModal = (order: Order) => {
    setRejectionTargetOrder(order);
    setRejectionReason("Customer refused to accept at doorstep");
    setCustomRejectionReason("");
    setRejectionOtpSent(false);
    setRejectionOtpCode("");
    setMaskedCustomerEmail("");
    setRejectionTimerRemaining(300);
    setShowRejectionModal(true);
  };

  // Send 4-Digit Rejection OTP to Customer
  const handleSendRejectionOtp = async () => {
    if (!rejectionTargetOrder) return;
    setIsSendingRejectionOtp(true);
    try {
      const token = localStorage.getItem("token");
      const finalReason =
        rejectionReason === "Other (Custom Reason)"
          ? customRejectionReason || "Customer refused delivery"
          : rejectionReason;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery-rejection/send-otp/${rejectionTargetOrder._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: finalReason }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("4-Digit Rejection OTP sent to customer!");
        setRejectionOtpSent(true);
        setMaskedCustomerEmail(data.maskedEmail || "customer's email");
        setRejectionTimerRemaining(300);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to send rejection OTP");
    } finally {
      setIsSendingRejectionOtp(false);
    }
  };

  // Verify 4-Digit Rejection OTP and Cancel/Reject Order
  const handleVerifyRejectionOtp = async () => {
    if (!rejectionTargetOrder) return;
    const cleanOtp = rejectionOtpCode.trim();
    if (cleanOtp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP");
      return;
    }

    setIsVerifyingRejectionOtp(true);
    try {
      const token = localStorage.getItem("token");
      const finalReason =
        rejectionReason === "Other (Custom Reason)"
          ? customRejectionReason || "Customer refused delivery"
          : rejectionReason;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/delivery-rejection/verify-otp/${rejectionTargetOrder._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp: cleanOtp,
            rejectionReason: finalReason,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Delivery Rejected & Order Cancelled with verified OTP!");
        setShowRejectionModal(false);
        if (selectedOrder && selectedOrder._id === rejectionTargetOrder._id) {
          setSelectedOrder({ ...selectedOrder, orderStatus: "cancelled" as any });
        }
        fetchOrders();
      } else {
        toast.error(data.message || "Invalid OTP verification");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to verify rejection OTP");
    } finally {
      setIsVerifyingRejectionOtp(false);
    }
  };

  useEffect(() => {
    if (!requestedOrderId || loading) return;

    const order = orders.find((item) => item._id === requestedOrderId);
    if (order) {
      setSelectedOrder(order);
      setShowDetailModal(true);
    } else {
      toast.error("Order not found");
    }
  }, [requestedOrderId, loading, orders]);

  const normalizeStatus = (status: string) => {
    if (!status) return "pending";
    if (status === "processing") return "confirmed";
    return status.replace(/-/g, "_");
  };

  const getStatusBadge = (orderOrStatus: Order | string) => {
    const isOrderObj = typeof orderOrStatus === "object" && orderOrStatus !== null;
    const order = isOrderObj ? (orderOrStatus as Order) : null;
    const status = order ? order.orderStatus : (orderOrStatus as string);
    const isRejected = order && Boolean(order.rejectionDetails?.isRejected);

    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Rejected at Delivery
        </span>
      );
    }

    if (normalizeStatus(status) === "cancelled") {
      const cancelHistory = order?.statusHistory?.slice().reverse().find((h) => normalizeStatus(h.status) === "cancelled");
      const role = cancelHistory?.changedByRole;
      if (role === "customer") {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> Cancelled by Customer
          </span>
        );
      }
      if (role === "admin") {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            <XCircle className="w-3.5 h-3.5 text-amber-700" /> Cancelled by Admin
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <XCircle className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    }

    switch (normalizeStatus(status)) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pending</span>;
      case "confirmed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3" /> Confirmed</span>;
      case "shipped":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Truck className="w-3 h-3" /> Shipped</span>;
      case "out_for_delivery":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"><Truck className="w-3 h-3" /> Out for Delivery</span>;
      case "delivered":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPaymentBadge = (method: string, status: string) => {
    if (method === "cod") {
      return <span className="text-xs text-orange-600 font-medium">Cash on Delivery</span>;
    }
    if (status === "paid") {
      return <span className="text-xs text-green-600 font-medium">Paid (Online)</span>;
    }
    return <span className="text-xs text-yellow-600 font-medium">Pending Payment</span>;
  };

  const getCustomerName = (order: Order) => {
    if (order.shippingAddress?.firstName) {
      return `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim();
    }
    if (order.guestAddress?.fullName) return order.guestAddress.fullName;
    if (order.userId?.username) return order.userId.username;
    return "Guest User";
  };

  const getCustomerPhone = (order: Order) => {
    if (order.shippingAddress?.mobile) return order.shippingAddress.mobile;
    if (order.guestAddress?.mobileNumber && order.guestAddress.mobileNumber !== "") return order.guestAddress.mobileNumber;
    if (order.userId?.mobile) return order.userId.mobile;
    return "N/A";
  };

  const getCustomerEmail = (order: Order) => {
    if (order.shippingAddress?.email) return order.shippingAddress.email;
    if (order.guestAddress?.email && order.guestAddress.email !== "") return order.guestAddress.email;
    if (order.userId?.email) return order.userId.email;
    return "N/A";
  };

  const getCustomerAddress = (order: Order) => {
    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      const parts = [addr.street, addr.city, addr.state].filter(Boolean);
      const postal = addr.pincode || "";
      return `${parts.join(", ")} ${postal ? `- ${postal}` : ""}`.trim() || "N/A";
    }
    if (order.guestAddress) {
      const addr = order.guestAddress;
      const parts = [addr.street, addr.city, addr.state].filter(Boolean);
      const postal = addr.postalCode || "";
      return `${parts.join(", ")} ${postal ? `- ${postal}` : ""}`.trim() || "N/A";
    }
    return "N/A";
  };

  const getProductPrice = (item: any) => {
    if (item.price && typeof item.price === "number" && !isNaN(item.price)) return item.price;
    if (item.productId?.price && typeof item.productId.price === "number" && !isNaN(item.productId.price)) return item.productId.price;
    if (item.price && typeof item.price === "string") {
      const num = parseFloat(item.price);
      if (!isNaN(num)) return num;
    }
    if (item.productId?.price && typeof item.productId.price === "string") {
      const num = parseFloat(item.productId.price);
      if (!isNaN(num)) return num;
    }
    return 0;
  };

  const getProductName = (item: any) => {
    if (item.productId?.name) return item.productId.name;
    return "Product";
  };

  const getProductImage = (item: any) => {
    if (item.productId?.productImgUrls?.[0]) return item.productId.productImgUrls[0];
    return "";
  };

  // ✅ FIXED: Total revenue - sirf delivered orders ka sum
  const getTotalRevenue = () => {
    let total = 0;
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      if (order.orderStatus === "delivered") {
        let val = 0;
        if (typeof order.orderValue === "number") val = order.orderValue;
        else if (typeof order.orderValue === "string") val = parseFloat(order.orderValue);
        else val = Number(order.orderValue) || 0;
        if (!isNaN(val)) total = total + val;
      }
    }
    return total;
  };

  const getTotalOrders = () => orders.length;
  const getPendingOrders = () => orders.filter(o => normalizeStatus(o.orderStatus) === "pending").length;
  const getConfirmedOrders = () => orders.filter(o => normalizeStatus(o.orderStatus) === "confirmed").length;
  const getShippedOrders = () => orders.filter(o => normalizeStatus(o.orderStatus) === "shipped").length;
  const getOutForDeliveryOrders = () => orders.filter(o => normalizeStatus(o.orderStatus) === "out_for_delivery").length;
  const getDeliveredOrders = () => orders.filter(o => normalizeStatus(o.orderStatus) === "delivered").length;
  const getCancelledOrders = () => orders.filter(o => normalizeStatus(o.orderStatus) === "cancelled").length;

  useEffect(() => {
    let filtered = [...orders];
    if (todayOnlyFilter) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter((o) => new Date(o.createdAt) >= todayStart);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCustomerName(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCustomerPhone(order).includes(searchTerm) ||
          getCustomerEmail(order).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => normalizeStatus(order.orderStatus) === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, todayOnlyFilter, orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">View, track, and filter customer orders across all lifecycle states</p>
        </div>
        <div className="flex items-center gap-2">
          {todayOnlyFilter && (
            <button
              onClick={() => setTodayOnlyFilter(false)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition"
            >
              📅 Showing Today Only ✕
            </button>
          )}
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold hover:bg-orange-100 transition"
            >
              Filter: {statusFilter.replace(/_/g, " ")} ✕
            </button>
          )}
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Clickable Status Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        {/* Total Orders */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setTodayOnlyFilter(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
            statusFilter === "all" && !todayOnlyFilter
              ? "bg-orange-50 border-orange-400 ring-2 ring-orange-500 shadow-md scale-[1.02]"
              : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">All Orders</p>
              <p className="text-xl font-extrabold text-gray-900 mt-1">{getTotalOrders()}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Pending */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === "pending" ? "all" : "pending");
            setTodayOnlyFilter(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
            statusFilter === "pending"
              ? "bg-yellow-50 border-yellow-400 ring-2 ring-yellow-500 shadow-md scale-[1.02]"
              : "bg-white border-gray-200 hover:border-yellow-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending</p>
              <p className="text-xl font-extrabold text-yellow-600 mt-1">{getPendingOrders()}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Confirmed */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === "confirmed" ? "all" : "confirmed");
            setTodayOnlyFilter(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
            statusFilter === "confirmed"
              ? "bg-blue-50 border-blue-400 ring-2 ring-blue-500 shadow-md scale-[1.02]"
              : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Confirmed</p>
              <p className="text-xl font-extrabold text-blue-600 mt-1">{getConfirmedOrders()}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Shipped */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === "shipped" ? "all" : "shipped");
            setTodayOnlyFilter(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
            statusFilter === "shipped"
              ? "bg-purple-50 border-purple-400 ring-2 ring-purple-500 shadow-md scale-[1.02]"
              : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Shipped</p>
              <p className="text-xl font-extrabold text-purple-600 mt-1">{getShippedOrders()}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Out for Delivery */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === "out_for_delivery" ? "all" : "out_for_delivery");
            setTodayOnlyFilter(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
            statusFilter === "out_for_delivery"
              ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500 shadow-md scale-[1.02]"
              : "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Out for Delivery</p>
              <p className="text-xl font-extrabold text-indigo-600 mt-1">{getOutForDeliveryOrders()}</p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Delivered */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === "delivered" ? "all" : "delivered");
            setTodayOnlyFilter(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
            statusFilter === "delivered"
              ? "bg-green-50 border-green-400 ring-2 ring-green-500 shadow-md scale-[1.02]"
              : "bg-white border-gray-200 hover:border-green-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Delivered</p>
              <p className="text-xl font-extrabold text-green-600 mt-1">{getDeliveredOrders()}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Cancelled */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter(statusFilter === "cancelled" ? "all" : "cancelled");
            setTodayOnlyFilter(false);
          }}
          className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
            statusFilter === "cancelled"
              ? "bg-red-50 border-red-400 ring-2 ring-red-500 shadow-md scale-[1.02]"
              : "bg-white border-gray-200 hover:border-red-300 hover:shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Cancelled</p>
              <p className="text-xl font-extrabold text-red-600 mt-1">{getCancelledOrders()}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, Phone, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">📋 Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="shipped">🚚 Shipped</option>
              <option value="out_for_delivery">📦 Out for Delivery</option>
              <option value="delivered">✅ Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders match the current filter or search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isFinalStatus =
                    normalizeStatus(order.orderStatus) === "delivered" ||
                    normalizeStatus(order.orderStatus) === "cancelled";

                  return (
                    <tr key={order._id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{order.orderId || order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{getCustomerName(order)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{getCustomerPhone(order)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-orange-600">₹{(order.orderValue || 0).toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
                      </td>
                      <td className="p-4">
                        {isFinalStatus ? (
                          /* 🔒 Permanently Locked Status for Delivered & Cancelled Orders */
                          <div
                            className="inline-flex items-center gap-1.5 select-none"
                            title="Status is permanently locked and cannot be changed"
                          >
                            <Lock className="w-3 h-3 text-gray-400 shrink-0" />
                            {getStatusBadge(order)}
                          </div>
                        ) : (
                          <div className="relative">
                            {updatingStatus === order._id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                            ) : (
                              <select
                                value={normalizeStatus(order.orderStatus)}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                className="text-sm border rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-sm"
                              >
                                <option value="pending">📋 Pending</option>
                                <option value="confirmed">✅ Confirmed</option>
                                <option value="shipped">🚚 Shipped</option>
                                <option value="out_for_delivery">📦 Out for Delivery</option>
                                <option value="delivered">✅ Delivered</option>
                                <option value="cancelled">❌ Cancel (OTP Rejection)</option>
                              </select>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        {normalizeStatus(order.orderStatus) !== "delivered" &&
                          normalizeStatus(order.orderStatus) !== "cancelled" && (
                            <button
                              onClick={() => openRejectionModal(order)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Reject at Delivery (OTP Required)"
                            >
                              <KeyRound size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{selectedOrder.orderId || selectedOrder._id.slice(-8)}
                </h2>
                <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Delivery Rejection Banner if rejected */}
              {selectedOrder.rejectionDetails?.isRejected && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-rose-900">Rejected at Delivery</h4>
                      <span className="bg-rose-200 text-rose-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                        4-Digit Customer OTP Verified
                      </span>
                    </div>
                    <p className="text-sm text-rose-700 mt-1">
                      <strong>Reason:</strong> {selectedOrder.rejectionDetails.reason || "Customer declined order at doorstep"}
                    </p>
                    {selectedOrder.rejectionDetails.rejectedAt && (
                      <p className="text-xs text-rose-500 mt-1">
                        Verified & Cancelled on: {new Date(selectedOrder.rejectionDetails.rejectedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Status Timeline */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Status</h3>
                <div className="flex items-center justify-between">
                  {["pending", "confirmed", "shipped", "out_for_delivery", "delivered"].map((status, idx) => (
                    <div key={status} className="flex-1 text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          ["pending", "confirmed", "shipped", "out_for_delivery", "delivered"].indexOf(normalizeStatus(selectedOrder.orderStatus)) >= idx
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {status === "pending" && <Clock className="w-4 h-4" />}
                        {status === "confirmed" && <CheckCircle className="w-4 h-4" />}
                        {status === "shipped" && <Truck className="w-4 h-4" />}
                        {status === "out_for_delivery" && <Truck className="w-4 h-4" />}
                        {status === "delivered" && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <p className="text-xs text-gray-600 capitalize">
                        {status === "out_for_delivery" ? "Out for Delivery" : status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {Array.isArray(selectedOrder.statusHistory) && selectedOrder.statusHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Status History</h3>
                  <div className="space-y-3">
                    {selectedOrder.statusHistory.map((entry, index) => (
                      <div key={`${entry.status}-${index}`} className="flex gap-3 p-3 rounded-lg bg-white border border-gray-100">
                        <div className="mt-1 w-3 h-3 rounded-full bg-orange-500 shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900 capitalize">
                              {normalizeStatus(entry.status).replace(/_/g, " ")}
                            </p>
                            <span className="text-xs text-gray-500">
                              {entry.changedByRole ? `by ${entry.changedByRole}` : ""}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ""}
                          </p>
                          {entry.note ? <p className="text-sm text-gray-600 mt-1">{entry.note}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Customer Name</p>
                      <p className="font-medium text-gray-900">{getCustomerName(selectedOrder)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{getCustomerPhone(selectedOrder)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{getCustomerEmail(selectedOrder)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Recipient</p>
                      <p className="font-medium text-gray-900">{getCustomerName(selectedOrder)}</p>
                      <p className="text-xs text-gray-500 mt-3">Address</p>
                      <p className="text-gray-600 text-sm">{getCustomerAddress(selectedOrder)}</p>
                      <p className="text-xs text-gray-500 mt-3">Phone</p>
                      <p className="text-gray-600 text-sm">📞 {getCustomerPhone(selectedOrder)}</p>
                      <p className="text-xs text-gray-500 mt-3">Email</p>
                      <p className="text-gray-600 text-sm">✉️ {getCustomerEmail(selectedOrder)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.products.map((item, idx) => {
                    const productPrice = getProductPrice(item);
                    const productName = getProductName(item);
                    const itemTotal = productPrice * (item.quantity || 1);

                    return (
                      <div key={idx} className="flex gap-4 py-3 border-b last:border-0">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                          <ProductImage
                            product={item}
                            alt={productName}
                            fill
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{productName}</p>
                          <div className="flex gap-4 mt-1">
                            <p className="text-sm text-gray-500">Quantity: {item.quantity || 1}</p>
                            <p className="text-sm text-gray-500">Price: ₹{productPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{itemTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{(selectedOrder.orderValue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t mt-2 pt-2">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-orange-600">₹{(selectedOrder.orderValue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900">{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (Razorpay)"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`font-medium ${selectedOrder.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {selectedOrder.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4 flex flex-wrap items-center gap-3">
              {normalizeStatus(selectedOrder.orderStatus) === "delivered" ||
              normalizeStatus(selectedOrder.orderStatus) === "cancelled" ? (
                <div className="flex-1 py-2.5 px-3.5 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                  <span>
                    Status is permanently locked as{" "}
                    <strong className="capitalize font-bold text-gray-900 dark:text-white">
                      {normalizeStatus(selectedOrder.orderStatus).replace(/_/g, " ")}
                    </strong>{" "}
                    (cannot be modified).
                  </span>
                </div>
              ) : (
                <>
                  <select
                    value={normalizeStatus(selectedOrder.orderStatus)}
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder._id, e.target.value);
                      setSelectedOrder({ ...selectedOrder, orderStatus: e.target.value as any });
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                  >
                    <option value="pending">📋 Pending</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="shipped">🚚 Shipped</option>
                    <option value="out_for_delivery">📦 Out for Delivery</option>
                    <option value="delivered">✅ Delivered</option>
                    <option value="cancelled">❌ Cancel (OTP Rejection)</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectionModal(selectedOrder);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg flex items-center gap-1.5 transition shadow-sm"
                  >
                    <KeyRound className="w-4 h-4" />
                    Reject Delivery (OTP)
                  </button>
                </>
              )}

              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 4-Digit Delivery Rejection OTP Modal (Flipkart Style) */}
      {showRejectionModal && rejectionTargetOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-600 to-orange-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Delivery Rejection OTP</h3>
                  <p className="text-xs text-rose-100">Order #{rejectionTargetOrder.orderId || rejectionTargetOrder._id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Order & Customer Summary Pill */}
              <div className="bg-gray-50 border rounded-xl p-3.5 space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-semibold text-gray-900">{getCustomerName(rejectionTargetOrder)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-semibold text-gray-900">{getCustomerPhone(rejectionTargetOrder)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Amount:</span>
                  <span className="font-bold text-orange-600">₹{(rejectionTargetOrder.orderValue || 0).toFixed(2)}</span>
                </div>
              </div>

              {!rejectionOtpSent ? (
                /* Step 1: Select Reason & Generate OTP */
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>
                      To reject and cancel this delivery at doorstep, a 4-digit OTP will be sent to the customer. You must enter that OTP to confirm rejection.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Rejection Reason
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="Customer refused to accept at doorstep">Customer refused to accept at doorstep</option>
                      <option value="Customer not reachable / not available">Customer not reachable / not available</option>
                      <option value="Damaged packaging / product condition issue">Damaged packaging / product condition issue</option>
                      <option value="Wrong product delivered / mismatch">Wrong product delivered / mismatch</option>
                      <option value="Customer cancelled on spot / changed mind">Customer cancelled on spot / changed mind</option>
                      <option value="Delay in delivery">Delay in delivery</option>
                      <option value="Other (Custom Reason)">Other (Custom Reason)</option>
                    </select>
                  </div>

                  {rejectionReason === "Other (Custom Reason)" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Specify Reason
                      </label>
                      <textarea
                        rows={2}
                        value={customRejectionReason}
                        onChange={(e) => setCustomRejectionReason(e.target.value)}
                        placeholder="Type the specific reason for rejecting delivery..."
                        className="w-full p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSendRejectionOtp}
                    disabled={isSendingRejectionOtp}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 transition"
                  >
                    {isSendingRejectionOtp ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating & Sending OTP...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5" />
                        Send 4-Digit Rejection OTP to Customer
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Step 2: Enter 4-Digit OTP & Verify */
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-900">4-Digit OTP Sent Successfully!</p>
                      <p className="text-emerald-700 mt-0.5">
                        Ask the customer for the 4-digit code sent to <strong>{maskedCustomerEmail}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Timer & Expiry */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      Expires in:
                    </span>
                    <span className={`font-mono font-bold ${rejectionTimerRemaining > 60 ? "text-gray-900" : "text-rose-600 animate-pulse"}`}>
                      {String(Math.floor(rejectionTimerRemaining / 60)).padStart(2, "0")}:
                      {String(rejectionTimerRemaining % 60).padStart(2, "0")}
                    </span>
                  </div>

                  {/* 4-Digit OTP Box */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-center">
                      Enter 4-Digit Customer OTP
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={rejectionOtpCode}
                      onChange={(e) => setRejectionOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="• • • •"
                      className="w-full text-center text-3xl tracking-[16px] font-mono font-bold py-3 border-2 border-rose-300 rounded-xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 text-rose-600 bg-rose-50/30"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSendRejectionOtp}
                      disabled={isSendingRejectionOtp}
                      className="px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
                      title="Resend OTP"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isSendingRejectionOtp ? "animate-spin" : ""}`} />
                      Resend
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyRejectionOtp}
                      disabled={isVerifyingRejectionOtp || rejectionOtpCode.length !== 4}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 transition"
                    >
                      {isVerifyingRejectionOtp ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying OTP...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Verify OTP & Reject Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
