"use client";

import { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Upload,
  Camera,
  Loader2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface BannerItem {
  _id: string;
  image: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  link: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    titleHighlight: "",
    subtitle: "",
    badge: "",
    buttonText: "Shop Now",
    link: "/products",
    order: 0,
    isActive: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const resolveImg = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    if (url.startsWith("/")) return url;
    return `${API_URL}/uploads/${url}`;
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setBanners(result.data);
      }
    } catch (error) {
      console.error("Error loading banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingBanner(null);
    setForm({
      title: "",
      titleHighlight: "",
      subtitle: "",
      badge: "",
      buttonText: "Shop Now",
      link: "/products",
      order: banners.length + 1,
      isActive: true,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || "",
      titleHighlight: banner.titleHighlight || "",
      subtitle: banner.subtitle || "",
      badge: banner.badge || "",
      buttonText: banner.buttonText || "Shop Now",
      link: banner.link || "/products",
      order: banner.order || 0,
      isActive: banner.isActive !== false,
    });
    setSelectedFile(null);
    setPreviewUrl(resolveImg(banner.image));
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Banner image must be under 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBanner && !selectedFile) {
      toast.error("Please select a banner image");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(editingBanner ? "Updating banner..." : "Creating banner...");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("titleHighlight", form.titleHighlight);
      formData.append("subtitle", form.subtitle);
      formData.append("badge", form.badge);
      formData.append("buttonText", form.buttonText);
      formData.append("link", form.link);
      formData.append("order", String(form.order));
      formData.append("isActive", String(form.isActive));

      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (editingBanner) {
        formData.append("image", editingBanner.image);
      }

      const url = editingBanner
        ? `${API_URL}/banners/${editingBanner._id}`
        : `${API_URL}/banners`;

      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success(editingBanner ? "Banner updated!" : "Banner added successfully!", { id: toastId });
        setIsModalOpen(false);
        fetchBanners();
      } else {
        toast.error(result.message || "Failed to save banner", { id: toastId });
      }
    } catch {
      toast.error("Network error while saving banner", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Banner deleted");
        setBanners((prev) => prev.filter((b) => b._id !== id));
      } else {
        toast.error(result.message || "Failed to delete banner");
      }
    } catch {
      toast.error("Failed to delete banner");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
        <p className="text-gray-500 font-medium">Loading hero banners...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="text-orange-500" />
            <span>Homepage Hero Banners</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add, edit, and organize 3 or more auto-sliding banners with custom titles, images &amp; links.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* ── Banner Grid List ── */}
      {banners.length === 0 ? (
        <div className="text-center bg-white dark:bg-gray-800 rounded-3xl p-12 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 rounded-full flex items-center justify-center mx-auto text-orange-600">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No custom banners added yet</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Your homepage currently uses the 3 default sports banners. Click below to add your own custom banners!
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow transition cursor-pointer inline-flex items-center gap-2"
          >
            <Plus size={15} />
            <span>Add First Banner</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition group"
            >
              {/* Image Preview Thumbnail */}
              <div className="relative aspect-[16/9] w-full bg-gray-900 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImg(banner.image)}
                  alt={banner.title || `Banner ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-black/70 text-white text-[10px] font-extrabold rounded-md backdrop-blur-xs">
                    #{index + 1}
                  </span>
                  {banner.isActive ? (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-md shadow-xs">
                      Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-600 text-white text-[10px] font-extrabold rounded-md">
                      Disabled
                    </span>
                  )}
                </div>

                {banner.badge && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 bg-amber-500/90 text-black text-[10px] font-bold rounded-md shadow-xs">
                      {banner.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Banner Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">
                    {banner.title || "No Title"}{" "}
                    {banner.titleHighlight && (
                      <span className="text-orange-500">{banner.titleHighlight}</span>
                    )}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 truncate max-w-[150px]">
                    🔗 {banner.link || "/products"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(banner)}
                      className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition cursor-pointer"
                      title="Edit banner"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === banner._id}
                      onClick={() => handleDelete(banner._id)}
                      className="p-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 rounded-lg transition cursor-pointer disabled:opacity-50"
                      title="Delete banner"
                    >
                      {deletingId === banner._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT BANNER
      ═══════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600">
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">
                    {editingBanner ? "Edit Hero Banner" : "Add New Hero Banner"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upload image, set title, subtitle, badge &amp; button link
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              {/* Image Upload Box */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Banner Image (16:9 Landscape Recommended) *
                </label>
                <div className="relative aspect-[16/9] w-full rounded-2xl bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center group">
                  {previewUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-white text-gray-900 rounded-xl font-bold text-xs shadow-lg"
                        >
                          Change Image
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="text-center p-6 cursor-pointer"
                    >
                      <Camera size={32} className="mx-auto mb-2 text-gray-400 group-hover:text-orange-500 transition" />
                      <p className="font-bold text-gray-700 dark:text-gray-200">Click to Upload Banner Image</p>
                      <p className="text-[11px] text-gray-400 mt-1">PNG, JPG or WEBP under 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Title & Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Banner Title (White Text)
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Authentic Kashmir"
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Title Highlight (Orange Gradient)
                  </label>
                  <input
                    type="text"
                    value={form.titleHighlight}
                    onChange={(e) => setForm({ ...form, titleHighlight: e.target.value })}
                    placeholder="e.g. Willow Cricket Bats"
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500 text-orange-600"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Direct from Sangam & Anantnag workshops. Premium clefts with thick edges & explosive stroke."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-normal outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Badge Tag & Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Badge Tag Text
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. 🏏 100% Genuine Handcrafted Willow"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="e.g. Shop Cricket Bats"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium outline-none"
                  />
                </div>
              </div>

              {/* Redirect Link & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Button Redirect Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="e.g. /products?search=cricket"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Display Order (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-medium outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="font-bold text-xs">Set Banner Live on Homepage</span>
              </label>

              {/* Actions */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>{saving ? "Saving..." : editingBanner ? "Save Changes" : "Create Banner"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
