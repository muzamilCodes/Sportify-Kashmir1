"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Package,
  Sparkles,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Megaphone,
  ShoppingBag,
  Info,
  ChevronRight,
  Shield,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationItem {
  _id: string;
  id?: string;
  recipientType: "user" | "admin" | "all";
  title: string;
  message: string;
  type: "order_created" | "order_status" | "user_registered" | "website_update" | "promo" | "alert" | "system";
  data?: any;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "updates" | "admin" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Check admin status from local storage
  const checkAdminStatus = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        setIsAdmin(Boolean(u.isAdmin));
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  // Format relative time
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHr / 24);

      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDay === 1) return "Yesterday";
      if (diffDay < 7) return `${diffDay}d ago`;
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (!token) {
        setNotifications([]);
        setAdminNotifications([]);
        setUnreadCount(0);
        setAdminUnreadCount(0);
        return;
      }

      checkAdminStatus();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // 1. Fetch User notifications
      const userRes = await fetch(`${API_URL}/notifications?limit=30`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (userRes && userRes.ok) {
        const data = await userRes.json();
        if (data.success) {
          setNotifications(data.data || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }

      // 2. If Admin, also fetch Admin alerts
      const userStr = localStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      if (userObj?.isAdmin) {
        const adminController = new AbortController();
        const adminTimeoutId = setTimeout(() => adminController.abort(), 5000);

        const adminRes = await fetch(`${API_URL}/notifications/admin?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: adminController.signal,
        }).catch(() => null);

        clearTimeout(adminTimeoutId);

        if (adminRes && adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.success) {
            setAdminNotifications(adminData.data || []);
            setAdminUnreadCount(adminData.unreadCount || 0);
          }
        }
      }
    } catch {
      // Quietly ignore transient network failures during server reboot
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);

    const handleRefresh = () => fetchNotifications();
    window.addEventListener("notificationsUpdated", handleRefresh);
    window.addEventListener("adminNotificationsUpdated", handleRefresh);
    window.addEventListener("userUpdated", handleRefresh);
    window.addEventListener("authUpdated", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notificationsUpdated", handleRefresh);
      window.removeEventListener("adminNotificationsUpdated", handleRefresh);
      window.removeEventListener("userUpdated", handleRefresh);
      window.removeEventListener("authUpdated", handleRefresh);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Mark single as read
  const handleMarkAsRead = async (id: string, isAdminItem = false, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (isAdminItem) {
        setAdminNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setAdminUnreadCount((prev) => Math.max(0, prev - 1));

        await fetch(`${API_URL}/notifications/admin/${id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        await fetch(`${API_URL}/notifications/${id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (activeTab === "admin") {
        setAdminNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setAdminUnreadCount(0);

        await fetch(`${API_URL}/notifications/admin/read-all`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);

        await fetch(`${API_URL}/notifications/read-all`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete single notification
  const handleDelete = async (id: string, isAdminItem = false, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      if (isAdminItem) {
        setAdminNotifications((prev) => prev.filter((n) => n._id !== id));
        await fetch(`${API_URL}/notifications/admin/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        await fetch(`${API_URL}/notifications/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Click on notification item
  const handleNotificationClick = (item: NotificationItem, isAdminItem = false) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id, isAdminItem);
    }
    setExpandedId((prev) => (prev === item._id ? null : item._id));
  };

  // Current list based on active tab
  const displayList = activeTab === "admin" ? adminNotifications : notifications;

  // Filter notifications
  const filteredNotifications = displayList.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "orders") return n.type === "order_created" || n.type === "order_status";
    if (activeTab === "updates") return n.recipientType === "all" || n.type === "website_update" || n.type === "promo" || n.type === "system";
    return true;
  });

  const totalDisplayUnread = isAdmin ? unreadCount + adminUnreadCount : unreadCount;

  // Get icon by notification type
  const getIcon = (item: NotificationItem) => {
    if (item.type === "user_registered") {
      return (
        <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20">
          <UserPlus className="w-4 h-4" />
        </div>
      );
    }
    const status = item.data?.status;
    if (item.type === "order_created") {
      return (
        <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <ShoppingBag className="w-4 h-4" />
        </div>
      );
    }
    if (item.type === "order_status") {
      if (status === "shipped") {
        return (
          <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        );
      }
      if (status === "delivered") {
        return (
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      }
      if (status === "cancelled") {
        return (
          <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
        );
      }
      return (
        <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4" />
        </div>
      );
    }
    if (item.type === "website_update" || item.recipientType === "all") {
      return (
        <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4" />
        </div>
      );
    }
    if (item.type === "promo") {
      return (
        <div className="w-9 h-9 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-gray-500/10 text-gray-600 flex items-center justify-center shrink-0">
        <Info className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Notification Bell Trigger Button ── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center focus:outline-none"
        title="Notifications & Updates"
        aria-label="Open Notifications Center"
      >
        <Bell className="w-5 h-5 transition-transform duration-200 hover:rotate-12" />

        {/* Unread Counter Badge */}
        {totalDisplayUnread > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md animate-pulse">
            {totalDisplayUnread > 99 ? "99+" : totalDisplayUnread}
          </span>
        )}
      </button>

      {/* ── Notification Dropdown Box ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-orange-500" />
                Notifications
              </span>
              {totalDisplayUnread > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black bg-orange-500 text-white rounded-full">
                  {totalDisplayUnread} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {((activeTab === "admin" && adminUnreadCount > 0) || (activeTab !== "admin" && unreadCount > 0)) && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-3 py-2 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 gap-1 text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                activeTab === "orders"
                  ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Orders 📦
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("updates")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                activeTab === "updates"
                  ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Updates 📢
            </button>

            {/* 🛡️ Admin Alerts Tab (Visible only to Admin) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                  activeTab === "admin"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xs"
                    : "text-orange-600 dark:text-orange-400 hover:bg-orange-50"
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Admin Alerts</span>
                {adminUnreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                activeTab === "unread"
                  ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-gray-800 text-orange-500 mx-auto flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {activeTab === "admin" ? "No admin activity alerts yet" : "No notifications found"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {activeTab === "admin"
                    ? "New user registrations and placed orders will appear here for Admin."
                    : activeTab === "unread"
                    ? "You're all caught up! No unread messages."
                    : "You will receive order status alerts and store announcements here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isExpanded = expandedId === item._id;
                const isAdminItem = activeTab === "admin" || item.recipientType === "admin";
                const targetOrderLink = item.link?.startsWith("/orders") ? item.link : (item.data?.orderId ? `/orders/${item.data.orderId}` : null);

                return (
                  <div
                    key={item._id}
                    onClick={() => handleNotificationClick(item, isAdminItem)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 transition cursor-pointer group relative ${
                      !item.isRead ? "bg-orange-50/30 dark:bg-orange-950/10" : ""
                    }`}
                  >
                    {!item.isRead && (
                      <span className="absolute top-4 right-3.5 w-2 h-2 rounded-full bg-orange-500 shadow-xs" />
                    )}

                    {getIcon(item)}

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs ${
                            !item.isRead
                              ? "font-extrabold text-gray-900 dark:text-white"
                              : "font-semibold text-gray-700 dark:text-gray-300"
                          } ${isExpanded ? "" : "truncate"}`}
                        >
                          {item.title}
                        </h4>
                      </div>

                      <p
                        className={`text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed ${
                          isExpanded ? "whitespace-pre-line" : "line-clamp-2"
                        }`}
                      >
                        {item.message}
                      </p>

                      {/* Admin Specific Action Buttons */}
                      {isAdminItem ? (
                        <div className="flex items-center gap-2 mt-2">
                          {item.type === "order_created" ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                router.push("/admin/orders");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
                            >
                              <span>Open Admin Orders 🛍️</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : item.type === "user_registered" ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                router.push("/admin/users");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs cursor-pointer"
                            >
                              <span>Manage Users 👤</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : item.link ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                router.push(item.link!);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition shadow-xs cursor-pointer"
                            >
                              <span>View in Admin ›</span>
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        /* User Specific Action Buttons */
                        targetOrderLink ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.isRead) handleMarkAsRead(item._id);
                              setIsOpen(false);
                              router.push(targetOrderLink);
                            }}
                            className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition shadow-xs cursor-pointer"
                          >
                            <span>Track Order 📦</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : item.link && item.link.trim().length > 0 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.isRead) handleMarkAsRead(item._id);
                              setIsOpen(false);
                              router.push(item.link!);
                            }}
                            className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs cursor-pointer"
                          >
                            <span>View Update 📢</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : null
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(item.createdAt)}</span>

                        {item.recipientType === "all" && (
                          <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold">
                            Store Update
                          </span>
                        )}
                        {isAdminItem && (
                          <span className="px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold">
                            Admin Alert
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item._id, isAdminItem, e)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-md transition cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold">
            {isAdmin ? (
              <>
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Broadcast Update</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 flex items-center gap-1"
                >
                  <span>Admin Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center justify-center gap-1 transition"
              >
                <span>View All Notifications</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
