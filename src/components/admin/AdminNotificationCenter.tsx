"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Package,
  ShoppingBag,
  UserPlus,
  Users,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  ChevronRight,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminNotificationItem {
  _id: string;
  recipientType: "admin";
  title: string;
  message: string;
  type: "order_created" | "order_status" | "user_registered" | "alert" | "system";
  data?: any;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminNotificationCenter() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "orders" | "users" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

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

  const fetchAdminNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications/admin?limit=40`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn("[AdminNotificationCenter] error:", err);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 15000);

    const handleRefresh = () => fetchAdminNotifications();
    window.addEventListener("adminNotificationsUpdated", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("adminNotificationsUpdated", handleRefresh);
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

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await fetch(`${API_URL}/notifications/admin/${id}/read`, {
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

      await fetch(`${API_URL}/notifications/admin/read-all`, {
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

      await fetch(`${API_URL}/notifications/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (item: AdminNotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id);
    }
    setIsOpen(false);

    if (item.link) {
      router.push(item.link);
    } else if (item.type === "order_created" || item.type === "order_status") {
      router.push("/admin/orders");
    } else if (item.type === "user_registered") {
      router.push("/admin/users");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "orders") return n.type === "order_created" || n.type === "order_status";
    if (activeTab === "users") return n.type === "user_registered";
    return true;
  });

  const getIcon = (item: AdminNotificationItem) => {
    if (item.type === "user_registered") {
      return (
        <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
          <UserPlus className="w-4 h-4" />
        </div>
      );
    }
    if (item.type === "order_created") {
      return (
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <ShoppingBag className="w-4 h-4" />
        </div>
      );
    }
    if (item.type === "order_status" && item.data?.status === "cancelled") {
      return (
        <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
          <AlertTriangle className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
        <Package className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Admin Bell Trigger ── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchAdminNotifications();
        }}
        className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
            : "bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500"
        }`}
        title="Admin Notifications & Activity Alerts"
        aria-label="Admin Notifications"
      >
        <Bell className="w-4 h-4" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Admin Dropdown ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-850 to-gray-900 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-orange-500/20 text-orange-400">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <span className="font-black text-xs text-white uppercase tracking-wider">
                Admin Activity Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer transition"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-3 py-2 bg-gray-950/70 border-b border-gray-800 gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "orders"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Orders 🛍️
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "users"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Users 👤
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeTab === "unread"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          </div>

          {/* Feed */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-800/80">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-gray-400">No activity alerts</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  New orders, customer registrations, and critical events will appear here in real-time.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-gray-800/60 transition cursor-pointer group relative ${
                    !item.isRead ? "bg-orange-500/5" : ""
                  }`}
                >
                  {!item.isRead && (
                    <span className="absolute top-4 right-3.5 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  )}

                  {getIcon(item)}

                  <div className="flex-1 min-w-0 pr-3">
                    <h4
                      className={`text-xs truncate ${
                        !item.isRead ? "font-bold text-white" : "font-medium text-gray-300"
                      }`}
                    >
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.createdAt)}</span>
                      <span className="text-orange-400/80 font-semibold group-hover:underline">
                        View details ›
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item._id, e)}
                      className="p-1 text-gray-500 hover:text-red-400 rounded-md transition"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Broadcast Link */}
          <div className="p-2.5 bg-gray-950 border-t border-gray-800 flex items-center justify-between text-xs">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition"
            >
              <span>Broadcast Announcement</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            <Link
              href="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              All Orders ›
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
