"use client";

import { useEffect, useState, useRef } from "react";
import {
  Save,
  Globe,
  Loader2,
  DollarSign,
  ShieldAlert,
  Image as ImageIcon,
  Upload,
  Camera,
  X,
  CheckCircle,
  HelpCircle,
  Truck,
  Clock,
  Building,
  Sparkles,
  AlertTriangle,
  Info,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

interface StoreSettings {
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  currency: string;
  timezone: string;
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  logoUrl?: string;
  bannerUrl?: string;
  faviconUrl?: string;
  announcementText?: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    siteName: "Sportify Kashmir",
    siteEmail: "sportify68@gmail.com",
    sitePhone: "+91 9682645127",
    siteAddress: "Handwara, Qalamabad, Kashmir 193221",
    currency: "INR",
    timezone: "Asia/Kolkata",
    freeShippingThreshold: 999,
    maintenanceMode: false,
    logoUrl: "",
    bannerUrl: "",
    faviconUrl: "",
    announcementText: "⚡ Free Express Delivery on Kashmir orders above ₹999 | 100% Genuine Handcrafted Willow",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const resolveImg = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
    return `${API_URL}/uploads/${path}`;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setSettings({
          siteName: result.data.siteName || "Sportify Kashmir",
          siteEmail: result.data.siteEmail || "sportify68@gmail.com",
          sitePhone: result.data.sitePhone || "+91 9682645127",
          siteAddress: result.data.siteAddress || "Handwara, Qalamabad, Kashmir 193221",
          currency: result.data.currency || "INR",
          timezone: result.data.timezone || "Asia/Kolkata",
          freeShippingThreshold: result.data.freeShippingThreshold !== undefined ? Number(result.data.freeShippingThreshold) : 999,
          maintenanceMode: Boolean(result.data.maintenanceMode),
          logoUrl: result.data.logoUrl || "",
          bannerUrl: result.data.bannerUrl || "",
          faviconUrl: result.data.faviconUrl || "",
          announcementText: result.data.announcementText || "⚡ Free Express Delivery on Kashmir orders above ₹999 | 100% Genuine Handcrafted Willow",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setSettings((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving store settings & images...");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("siteName", settings.siteName);
      formData.append("siteEmail", settings.siteEmail);
      formData.append("sitePhone", settings.sitePhone);
      formData.append("siteAddress", settings.siteAddress);
      formData.append("currency", settings.currency);
      formData.append("timezone", settings.timezone);
      formData.append("freeShippingThreshold", String(settings.freeShippingThreshold));
      formData.append("maintenanceMode", String(settings.maintenanceMode));
      if (settings.announcementText) {
        formData.append("announcementText", settings.announcementText);
      }

      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }
      if (faviconFile) {
        formData.append("favicon", faviconFile);
      }

      const res = await fetch(`${API_URL}/admin/settings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Settings & images saved successfully!", { id: toastId });
        setLogoFile(null);
        setBannerFile(null);
        setFaviconFile(null);
        fetchSettings();
      } else {
        toast.error(result.message || "Failed to save settings", { id: toastId });
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Failed to save settings", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
        <p className="text-gray-500 font-medium">Loading store settings...</p>
      </div>
    );
  }

  const currentLogo = logoPreview || resolveImg(settings.logoUrl);
  const currentBanner = bannerPreview || resolveImg(settings.bannerUrl);
  const currentFavicon = faviconPreview || resolveImg(settings.faviconUrl);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Store Settings &amp; Operations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure shipping rules, store branding images, timezone, and maintenance security.
          </p>
        </div>

        {/* Live Store Status Badge */}
        <div className="flex items-center gap-2">
          {settings.maintenanceMode ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
              <AlertTriangle size={14} />
              <span>Maintenance Mode ON</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Store is Live &amp; Active</span>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 1: Store Branding & Image Uploads (Logo, Banner, Favicon)
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Store Branding &amp; Images
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload your official store logo, homepage promotional banner, and app icon.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Store Logo */}
            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                  Store Logo
                </label>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  Shown in Header, mobile navbar, emails &amp; tax invoices.
                </p>
                <div className="h-28 bg-white dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden p-2 relative group">
                  {currentLogo ? (
                    <img src={currentLogo} alt="Store logo preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera size={24} className="mx-auto mb-1 opacity-50" />
                      <span className="text-[11px]">No logo uploaded</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Upload size={13} />
                  <span>{currentLogo ? "Change Logo" : "Upload Logo"}</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, setLogoFile, setLogoPreview)}
                  className="hidden"
                />
              </div>
            </div>

            {/* 2. Favicon / PWA Icon */}
            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                  Favicon &amp; App Icon
                </label>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                  Browser tab icon &amp; mobile home screen app shortcut (1:1).
                </p>
                <div className="h-28 bg-white dark:bg-gray-700 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden p-2 relative group">
                  {currentFavicon ? (
                    <img src={currentFavicon} alt="Favicon preview" className="w-14 h-14 object-contain rounded-xl shadow-xs" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Globe size={24} className="mx-auto mb-1 opacity-50" />
                      <span className="text-[11px]">No icon uploaded</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  className="w-full py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Upload size={13} />
                  <span>{currentFavicon ? "Change Icon" : "Upload Icon"}</span>
                </button>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, setFaviconFile, setFaviconPreview)}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 2: Shipping & Store Operations (With Detailed Explanations)
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              <Truck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Shipping &amp; Store Operations
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure minimum order value for Free Delivery and store time settings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Free Shipping Threshold */}
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-emerald-900 dark:text-emerald-300">
                  Free Shipping Order Threshold (₹)
                </label>
                <span className="text-[10px] font-bold bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded">
                  Current: ₹{settings.freeShippingThreshold}
                </span>
              </div>
              <input
                type="number"
                name="freeShippingThreshold"
                min={0}
                step={1}
                value={settings.freeShippingThreshold}
                onChange={handleChange}
                className="w-full p-3 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-xl font-bold text-lg text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              {/* Hindi & English explanation */}
              <div className="mt-2.5 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p className="flex items-start gap-1.5">
                  <Info size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Kya karta hai:</strong> Customers ko kitne rupaye se zyada ke order par <strong>FREE Delivery</strong> milegi.</span>
                </p>
                <p className="text-[11px] text-gray-500 pl-5">
                  Agar order value ₹{settings.freeShippingThreshold} ya usse zyada hogi toh cart me delivery charge ₹0 ho jayega.
                </p>
              </div>
            </div>

            {/* Timezone */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase text-blue-900 dark:text-blue-300">
                  Timezone
                </label>
                <span className="text-[10px] font-bold bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-0.5 rounded">
                  IST
                </span>
              </div>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full p-3 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded-xl font-semibold text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST — Indian Standard Time / Kashmir)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
              {/* Hindi & English explanation */}
              <div className="mt-2.5 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p className="flex items-start gap-1.5">
                  <Clock size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Kya karta hai:</strong> Orders, tax invoices, aur delivery schedules ka sahi date aur time dikhata hai.</span>
                </p>
                <p className="text-[11px] text-gray-500 pl-5">
                  Kashmir aur India ke orders ke liye <code>Asia/Kolkata</code> standard time sabse best hai.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 3: Announcement Bar Banner
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Top Announcement Bar
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Text shown in the top promotional bar on every page of the website.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
              Announcement Bar Text
            </label>
            <input
              type="text"
              name="announcementText"
              value={settings.announcementText || ""}
              onChange={handleChange}
              placeholder="e.g. ⚡ Free Express Delivery on Kashmir orders above ₹999 | 100% Genuine Handcrafted Willow"
              className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 4: General Store Contact & Business Info
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
              <Building size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Store Contact &amp; Legal Info
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Official store contact details printed on receipts, customer support &amp; emails.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Store Contact Email</label>
              <input
                type="email"
                name="siteEmail"
                value={settings.siteEmail}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Phone / WhatsApp Helpline</label>
              <input
                type="text"
                name="sitePhone"
                value={settings.sitePhone}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Physical Store &amp; Warehouse Address</label>
              <input
                type="text"
                name="siteAddress"
                value={settings.siteAddress}
                onChange={handleChange}
                className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 5: Maintenance Mode & Security (With Clear Explanation)
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Maintenance Mode &amp; Security
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Control store availability during major updates or maintenance.
              </p>
            </div>
          </div>

          <label className={`flex items-start gap-3.5 cursor-pointer p-4 rounded-2xl border transition-all ${
            settings.maintenanceMode
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-400"
              : "bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 hover:bg-gray-100"
          }`}>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="w-5 h-5 mt-0.5 text-orange-500 rounded focus:ring-orange-500 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm">
                  Enable Store Maintenance Mode
                </span>
                {settings.maintenanceMode ? (
                  <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded uppercase">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded uppercase">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                <strong>Kya karta hai:</strong> Jab website par koi bada update chal raha ho ya store temporarily band karna ho, toh isko ON karein. Regular visitors ko maintenance banner dikhai dega, jabki Admin users login karke sab kuch manage kar sakte hain.
              </p>
            </div>
          </label>
        </div>

        {/* ── Submit Button ── */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all disabled:opacity-50 cursor-pointer text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving Settings &amp; Images...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Store Settings &amp; Images</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
