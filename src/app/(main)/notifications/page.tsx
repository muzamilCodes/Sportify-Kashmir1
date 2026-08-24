"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Megaphone,
  Trash2,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface NotificationItem {
  _id: string;
  recipientType: "user" | "all";
  title: string;
  message: string;
  type: string;
  data?: any;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function UserNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "updates" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/notifications?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");

      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification dismissed");

      await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id);
    }
    setExpandedId((prev) => (prev === item._id ? null : item._id));
  };

  const filteredNotifications = notifications.filter((item) => {
    // Tab filter
    if (activeTab === "unread" && item.isRead) return false;
    if (activeTab === "orders" && item.type !== "order_created" && item.type !== "order_status") return false;
    if (activeTab === "updates" && item.recipientType !== "all" && item.type !== "website_update" && item.type !== "promo" && item.type !== "system") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q);
    }

    return true;
  });

  const getIcon = (item: NotificationItem) => {
    const status = item.data?.status;
    if (item.type === "order_created") {
      return (
        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
      );
    }
    if (item.type === "order_status") {
      if (status === "shipped") {
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
        );
      }
      if (status === "delivered") {
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      }
      if (status === "cancelled") {
        return (
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        );
      }
      return (
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
      );
    }
    if (item.type === "website_update" || item.recipientType === "all") {
      return (
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5" />
        </div>
      );
    }
    if (item.type === "promo") {
      return (
        <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-gray-500/10 text-gray-600 flex items-center justify-center shrink-0">
        <Info className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Header Card ── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                Notifications &amp; Updates
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Track your orders, delivery alerts, and latest website announcements.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-600 dark:text-orange-400 rounded-2xl text-xs font-extrabold transition cursor-pointer self-start sm:self-center"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === "orders"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Orders 📦
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("updates")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === "updates"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Store Updates 📢
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === "unread"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
          </div>
        </div>

        {/* ── Notification Feed List ── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              Loading your notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-gray-700 text-orange-500 mx-auto flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No notifications found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {activeTab === "unread"
                  ? "You have read all your notifications!"
                  : "When you place orders or when new website features drop, you'll find them here."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isExpanded = expandedId === item._id;
              const targetOrderLink = item.link?.startsWith("/orders") ? item.link : (item.data?.orderId ? `/orders/${item.data.orderId}` : null);

              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`p-5 sm:p-6 flex items-start gap-4 hover:bg-gray-50/80 dark:hover:bg-gray-750 transition cursor-pointer group relative ${
                    !item.isRead ? "bg-orange-50/30 dark:bg-orange-950/10" : ""
                  }`}
                >
                  {!item.isRead && (
                    <span className="absolute top-6 right-6 w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs" />
                  )}

                  {getIcon(item)}

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm ${
                          !item.isRead
                            ? "font-black text-gray-900 dark:text-white"
                            : "font-semibold text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.title}
                      </h3>

                      {item.recipientType === "all" && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                          Store Update
                        </span>
                      )}
                    </div>

                    <p className={`text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed max-w-2xl ${isExpanded ? "whitespace-pre-line" : ""}`}>
                      {item.message}
                    </p>

                    {/* Action buttons (only navigates when explicitly clicked) */}
                    {targetOrderLink ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.isRead) handleMarkAsRead(item._id);
                          router.push(targetOrderLink);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition shadow-sm cursor-pointer"
                      >
                        <span>Track Order 📦</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : item.link && item.link.trim().length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.isRead) handleMarkAsRead(item._id);
                          router.push(item.link!);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm cursor-pointer"
                      >
                        <span>View Update 📢</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ) : null}

                    <div className="flex items-center gap-4 mt-2.5 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item._id, e)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer self-center"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
