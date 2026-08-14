"use client";

import { useEffect, useState } from "react";
import { Save, Globe, Loader2, DollarSign, ShieldAlert } from "lucide-react";
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
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    siteName: "Sportify Kashmir",
    siteEmail: "sportify68@gmail.com",
    sitePhone: "+91 9682645127",
    siteAddress: "Handwara, Qalamabad",
    currency: "INR",
    timezone: "Asia/Kolkata",
    freeShippingThreshold: 999,
    maintenanceMode: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setSettings({
          siteName: result.data.siteName || "Sportify Kashmir",
          siteEmail: result.data.siteEmail || "sportify68@gmail.com",
          sitePhone: result.data.sitePhone || "+91 9682645127",
          siteAddress: result.data.siteAddress || "Handwara, Qalamabad",
          currency: result.data.currency || "INR",
          timezone: result.data.timezone || "Asia/Kolkata",
          freeShippingThreshold: result.data.freeShippingThreshold || 999,
          maintenanceMode: result.data.maintenanceMode || false,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Settings saved successfully to database!");
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      toast.error("Failed to save settings");
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Store Settings</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage and configure your store settings in database.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Store Contact Email</label>
              <input
                type="email"
                name="siteEmail"
                value={settings.siteEmail}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone Number</label>
              <input
                type="text"
                name="sitePhone"
                value={settings.sitePhone}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Store Address</label>
              <input
                type="text"
                name="siteAddress"
                value={settings.siteAddress}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* E-Commerce Shipping & Operations */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Shipping & Store Operations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Free Shipping Order Threshold (₹)
              </label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Timezone</label>
              <input
                type="text"
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Store Mode */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Maintenance & Security</h2>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
            <div>
              <span className="font-bold text-gray-900 text-sm">Enable Store Maintenance Mode</span>
              <p className="text-xs text-gray-500">Temporarily display maintenance banner for non-admin visitors.</p>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Store Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
