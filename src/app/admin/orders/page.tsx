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
} from "lucide-react";
import toast from "react-hot-toast";

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
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
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
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pending</span>;
      case "processing":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Package className="w-3 h-3" /> Processing</span>;
      case "shipped":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Truck className="w-3 h-3" /> Shipped</span>;
      case "delivered":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Delivered</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
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
    if (item.price && typeof item.price === 'number' && !isNaN(item.price)) return item.price;
    if (item.productId?.price && typeof item.productId.price === 'number' && !isNaN(item.productId.price)) return item.productId.price;
    if (item.price && typeof item.price === 'string') {
      const num = parseFloat(item.price);
      if (!isNaN(num)) return num;
    }
    if (item.productId?.price && typeof item.productId.price === 'string') {
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
  const getPendingOrders = () => orders.filter(o => o.orderStatus === "pending").length;
  const getDeliveredOrders = () => orders.filter(o => o.orderStatus === "delivered").length;

  useEffect(() => {
    let filtered = [...orders];
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCustomerName(order).toLowerCase().includes(searchTerm.toLowerCase()) ||
          getCustomerPhone(order).includes(searchTerm) ||
          getCustomerEmail(order).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter);
    }
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

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
          <p className="text-gray-600 mt-1">View and manage all customer orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalOrders()}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{getTotalRevenue().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{getPendingOrders()}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">{getDeliveredOrders()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
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
              <option value="processing">⚙️ Processing</option>
              <option value="shipped">🚚 Shipped</option>
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
            <p className="text-gray-600">Orders will appear here once customers place orders</p>
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
                {filteredOrders.map((order) => (
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
                      <div className="relative">
                        {updatingStatus === order._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        ) : (
                          <select
                            value={order.orderStatus}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="text-sm border rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-orange-500 cursor-pointer"
                          >
                            <option value="pending">📋 Pending</option>
                            <option value="processing">⚙️ Processing</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="delivered">✅ Delivered</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
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
              {/* Order Status Timeline */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Status</h3>
                <div className="flex items-center justify-between">
                  {["pending", "processing", "shipped", "delivered"].map((status, idx) => (
                    <div key={status} className="flex-1 text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                          ["pending", "processing", "shipped", "delivered"].indexOf(selectedOrder.orderStatus) >= idx
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {status === "pending" && <Clock className="w-4 h-4" />}
                        {status === "processing" && <Package className="w-4 h-4" />}
                        {status === "shipped" && <Truck className="w-4 h-4" />}
                        {status === "delivered" && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{status}</p>
                    </div>
                  ))}
                </div>
              </div>

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
                    const productImage = getProductImage(item);
                    const itemTotal = productPrice * (item.quantity || 1);
                    
                    return (
                      <div key={idx} className="flex gap-4 py-3 border-b last:border-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No image
                            </div>
                          )}
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

            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
              <select
                value={selectedOrder.orderStatus}
                onChange={(e) => {
                  updateOrderStatus(selectedOrder._id, e.target.value);
                  setSelectedOrder({ ...selectedOrder, orderStatus: e.target.value as any });
                }}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="pending">📋 Pending</option>
                <option value="processing">⚙️ Processing</option>
                <option value="shipped">🚚 Shipped</option>
                <option value="delivered">✅ Delivered</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}