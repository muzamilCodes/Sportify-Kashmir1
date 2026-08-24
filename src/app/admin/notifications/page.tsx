"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Send,
  Sparkles,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Flame,
  Radio,
  Eye,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface BroadcastItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  createdAt: string;
}

export default function AdminBroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("/products");
  const [type, setType] = useState<"website_update" | "promo" | "alert">("website_update");
  const [sendEmailBlast, setSendEmailBlast] = useState(false);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications/admin/broadcasts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBroadcasts(data.data || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const res = await fetch(`${API_URL}/notifications/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          link: link.trim(),
          type,
          sendEmailBlast,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(sendEmailBlast ? "📢 Broadcasted & Emails queued!" : "📢 Announcement broadcasted to all users!");
        setTitle("");
        setMessage("");
        setLink("/products");
        setSendEmailBlast(false);
        fetchBroadcasts();
      } else {
        toast.error(data.message || "Failed to broadcast announcement");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while broadcasting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this broadcast announcement?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications/admin/broadcasts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Broadcast deleted");
        setBroadcasts((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent p-6 rounded-3xl border border-orange-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500 text-white shadow-md">
              <Megaphone className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Broadcast Announcements &amp; Website Updates
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Send real-time alerts, website updates, new product arrivals, and discount sales to all user notification bells and inboxes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBroadcasts}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 transition shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Compose Form ── */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
              Compose New Broadcast
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-full">
              Live Instant Push
            </span>
          </div>

          <form onSubmit={handleBroadcastSubmit} className="space-y-4">
            {/* Announcement Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Announcement Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType("website_update")}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    type === "website_update"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-orange-500" />
                  <span>Website Update</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("promo")}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    type === "promo"
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 shadow-xs"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Flame className="w-4 h-4 shrink-0 text-pink-500" />
                  <span>Sale / Promo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType("alert")}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    type === "alert"
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 shadow-xs"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Notice / Alert</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🚀 Kashmir Willow Mega Sale is Live - Flat 30% OFF!"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 outline-none transition"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Message Content *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what's new, details of discount coupon code, or store feature updates..."
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 outline-none transition resize-none"
              />
            </div>

            {/* Redirect Action Link */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Redirect URL / Destination Link
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/products or /sale or /bulk-purchases"
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
                <ExternalLink className="w-4 h-4 absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Email Blast Option */}
            <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-200 dark:border-orange-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500 text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                    Send Email Blast to All Verified Users
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Sends branded HTML email update to all registered customers.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmailBlast}
                  onChange={(e) => setSendEmailBlast(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Broadcasting to Users..." : "Send Live Announcement Now"}</span>
            </button>
          </form>
        </div>

        {/* ── Right Column: Live Notification Card Preview ── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-orange-500" />
              Live User Preview
            </h3>

            <p className="text-xs text-gray-500">
              Here is how this announcement will appear in every customer's notification dropdown:
            </p>

            {/* Preview Box */}
            <div className="p-4 rounded-2xl border border-orange-500/30 bg-orange-50/40 dark:bg-orange-950/20 shadow-sm relative">
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    Store Update
                  </span>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white mt-1">
                    {title || "Your Announcement Title Here..."}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {message || "Your message body and promotion details will be displayed here for all customers..."}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-bold">
                    <Clock className="w-3 h-3" />
                    <span>Just now</span>
                    {link && <span className="text-orange-500">Link: {link}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Broadcast Quick Stats */}
          <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl border border-gray-700 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Broadcasts
              </span>
              <p className="text-2xl font-black text-orange-400 mt-0.5">
                {broadcasts.length}
              </p>
            </div>
            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Broadcast History Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-gray-700 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          Broadcast History ({broadcasts.length})
        </h3>

        {broadcasts.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-gray-500">No broadcasts sent yet</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Use the compose form above to broadcast your first website update or sale alert!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {broadcasts.map((item) => (
              <div
                key={item._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 max-w-2xl">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                      <span>{new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                      {item.link && (
                        <span className="text-orange-500 font-semibold">{item.link}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  className="self-end sm:self-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer"
                  title="Delete broadcast"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
