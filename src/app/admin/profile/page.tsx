"use client";

import { useEffect, useState, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Upload,
  X,
  Check,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Key,
  ExternalLink,
  Sparkles,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  profilePic?: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    mobile: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedPic, setSelectedPic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const resolveImg = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return `${API_URL}/uploads/${url}`;
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/user/verify/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (result.success && result.payload) {
        setAdmin(result.payload);
        setForm({
          username: result.payload.username || "",
          email: result.payload.email || "",
          mobile: result.payload.mobile || "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error loading admin profile:", error);
      toast.error("Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  // Direct Photo Upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setSelectedPic(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Instant upload
    const token = localStorage.getItem("token");
    if (!token) return;

    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading admin photo...");

    try {
      const formData = new FormData();
      formData.append("username", form.username || admin?.username || "Admin");
      formData.append("email", form.email || admin?.email || "");
      if (form.mobile || admin?.mobile) {
        formData.append("mobile", form.mobile || admin?.mobile || "");
      }
      formData.append("profilePic", file);

      const response = await fetch(`${API_URL}/user/edit/user`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const updated = result.payload || {
          ...admin,
          profilePic: result.profilePic || result.data?.profilePic,
        };
        setAdmin(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("authUpdated"));
        setImageError(false);
        toast.success("Admin photo updated successfully!", { id: toastId });
      } else {
        toast.error(result.message || "Failed to upload photo", { id: toastId });
      }
    } catch {
      toast.error("Network error while uploading photo", { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    if (form.newPassword) {
      if (form.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    setSaving(true);
    const toastId = toast.loading("Saving admin profile...");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("username", form.username.trim());
      formData.append("email", form.email.trim().toLowerCase());
      if (form.mobile) formData.append("mobile", form.mobile.trim());
      if (selectedPic) {
        formData.append("profilePic", selectedPic);
      }

      const response = await fetch(`${API_URL}/user/edit/user`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const updated = result.payload || {
          ...admin,
          username: form.username,
          email: form.email,
          mobile: form.mobile,
          profilePic: result.profilePic || admin?.profilePic,
        };
        setAdmin(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("authUpdated"));
        toast.success("Admin profile updated successfully!", { id: toastId });
        setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
        setSelectedPic(null);
      } else {
        toast.error(result.message || "Failed to update profile", { id: toastId });
      }
    } catch {
      toast.error("Network error while saving profile", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-3" />
        <p className="text-gray-500 font-medium">Loading admin profile...</p>
      </div>
    );
  }

  const profileImageUrl = previewUrl || resolveImg(admin?.profilePic);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Admin Profile &amp; Account</span>
            <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Super Admin
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your administrator avatar, personal credentials, and security settings.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition"
        >
          <span>View Public Store</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* ── Admin Hero Banner & Avatar Upload Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Camera Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-orange-500 shadow-xl overflow-hidden flex items-center justify-center">
              {uploadingPhoto ? (
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              ) : profileImageUrl && !imageError ? (
                <img
                  src={profileImageUrl}
                  alt={admin?.username || "Admin"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="Change admin photo"
              className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 cursor-pointer transition hover:scale-105"
            >
              <Camera size={15} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Info & Badges */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {admin?.username || "Administrator"}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full">
                <Shield size={12} />
                <span>Verified Admin</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-orange-500" />
                <span>{admin?.email}</span>
              </span>
              {admin?.mobile && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-orange-500" />
                  <span>{admin.mobile}</span>
                </span>
              )}
              {admin?.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-orange-500" />
                  <span>Admin since {new Date(admin.createdAt).toLocaleDateString()}</span>
                </span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-bold hover:bg-orange-100 transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Camera size={13} />
                <span>Upload New Profile Photo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Admin Profile Form ── */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
            <User className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Edit Administrator Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                Admin Username / Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="e.g. warmuzamil"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                Official Admin Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. admin@sportify.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                Admin Mobile / Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="e.g. 9682645127"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Security & Password Change ── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Change Admin Password (Optional)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{showPassword ? "Hide" : "Show"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                New Password (Min 6 characters)
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Leave blank to keep current password"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>
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
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Save Admin Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
