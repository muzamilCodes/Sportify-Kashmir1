"use client";

import {
  Camera,
  Heart,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShoppingBag,
  User,
  ChevronRight,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Shield,
  Headphones,
  Package,
  Sparkles,
  Download,
  ShoppingCart,
  CreditCard,
  Wallet,
  Briefcase,
  Crown,
  Truck,
  MessageSquare,
  Gift,
  FileText,
  BadgeCheck,
  Building2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import toast from "react-hot-toast";
import { cachedJson } from "@/lib/clientCache";
import ProductImage from "@/components/ProductImage";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  profilePic?: string;
  isAdmin: boolean;
  createdAt: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    mobile: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [buyAgainProducts, setBuyAgainProducts] = useState<any[]>([]);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Resolve profile picture URL
  const getImageUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return `${API_URL}/uploads/${url}`;
  };

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    fetchUserProfile();
    loadBuyAgainProducts();
  }, []);

  const loadBuyAgainProducts = async () => {
    try {
      const res = await cachedJson<{ success: boolean; data: any }>(`${API_URL}/product/getAll`);
      if (res.success && res.data) {
        const raw = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setBuyAgainProducts(raw.slice(0, 4));
      }
    } catch {
      // silent fallback
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/user/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.payload) {
        setUser(result.payload);
        setEditForm({
          username: result.payload.username || "",
          email: result.payload.email || "",
          mobile: result.payload.mobile || "",
        });
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cartId");
    toast.success("Logged out successfully");
    window.dispatchEvent(new Event("authUpdated"));
    router.push("/login");
  };

  // Instant direct photo upload
  const handleDirectPhotoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      router.push("/login");
      return;
    }

    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading profile photo...");

    try {
      const formData = new FormData();
      formData.append("username", user?.username || editForm.username || "User");
      formData.append("email", user?.email || editForm.email);
      if (user?.mobile) formData.append("mobile", user.mobile);
      formData.append("profilePic", file);

      const response = await fetch(`${API_URL}/user/edit/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const updatedUser = result.payload || {
          ...user,
          profilePic: result.profilePic || result.data?.profilePic,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("authUpdated"));
        setImageError(false);
        toast.success("Profile photo updated!", { id: toastId });
        fetchUserProfile();
      } else {
        toast.error(result.message || "Failed to upload photo", { id: toastId });
      }
    } catch {
      toast.error("Network error while uploading photo", { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDirectPhotoUpload(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!editForm.username.trim()) {
        toast.error("Username cannot be empty");
        return;
      }
      if (!editForm.email.trim() || !editForm.email.includes("@")) {
        toast.error("Please enter a valid email");
        return;
      }

      setUpdatingProfile(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("username", editForm.username);
      formData.append("email", editForm.email);
      if (editForm.mobile) formData.append("mobile", editForm.mobile);
      if (selectedProfilePic) {
        formData.append("profilePic", selectedProfilePic);
      }

      const response = await fetch(`${API_URL}/user/edit/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const updatedUser = result.payload || {
          ...user,
          username: editForm.username,
          email: editForm.email,
          mobile: editForm.mobile,
          profilePic: result.profilePic || user?.profilePic,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("authUpdated"));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setSelectedProfilePic(null);
        setPreviewUrl(null);
        setImageError(false);
        fetchUserProfile();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you absolutely sure you want to delete your account? This action cannot be undone."
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/user/account/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Your account has been deleted");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
      } else {
        toast.error(result.message || "Failed to delete account");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleQuickAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }
    setAddingCartId(productId);
    try {
      const response = await fetch(`${API_URL}/cart/addtoCart/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingCartId(null);
    }
  };

  const profileImageUrl = getImageUrl(user?.profilePic);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-sm w-full">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to your account</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">View your orders, wishlist, and account settings</p>
          <Link
            href="/login"
            className="block w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-sm shadow-md transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* ─── Top Amazon-Style Title & Profile Bar ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Your Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-500" />
              <span>Deliver to {user.username} — Srinagar, Jammu & Kashmir 190001</span>
            </p>
          </div>

          {/* Quick User Badge with Direct Photo Upload */}
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 sm:p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-orange-500">
                {uploadingPhoto ? (
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                ) : profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change profile photo"
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-1.5 rounded-full shadow-md border border-white dark:border-gray-800 cursor-pointer"
              >
                <Camera size={11} />
              </button>
            </div>

            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                  {user.username}
                </span>
                {user.isAdmin && (
                  <span className="text-[10px] font-extrabold bg-orange-100 dark:bg-orange-950 text-orange-600 px-1.5 py-0.2 rounded-full uppercase">
                    Admin
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>📷 Change Photo</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
            />
          </div>
        </div>

        {/* ─── Amazon-Style 8-Card Main Grid (2 Rows of 4 / 3 Columns) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Your Orders (Cardboard Box Delivery Icon) */}
          <Link
            href="/orders"
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                Your Orders
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Track, return, or buy Kashmir willow bats & athletic gear again
              </p>
            </div>
          </Link>

          {/* Card 2: Login & Security (Lock Icon) */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                Login & security
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Edit login, username, email, and mobile number
              </p>
            </div>
          </button>

          {/* Card 3: Sportify Prime / Membership (Blue Ribbon Box) */}
          <div className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Crown className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Sportify Prime
                </h2>
                <span className="text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.2 rounded-full uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                View benefits, free Kashmir express delivery & exclusive bat stringing
              </p>
            </div>
          </div>

          {/* Card 4: Your Addresses (Orange Location Pin) */}
          <Link
            href="/address"
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                Your Addresses
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Edit delivery addresses for home, academy, and sports clubs
              </p>
            </div>
          </Link>

          {/* Card 5: Your Business / Sports Academy Account (Purple Badge) */}
          <Link
            href="/contact"
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                Your sports club account
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Sign up for free to save up to 18% with GST invoice & bulk academy rates
              </p>
            </div>
          </Link>

          {/* Card 6: Payment options (Credit Card Icon) */}
          <Link
            href="/cart"
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                Payment options
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Edit or add UPI, Cash on Delivery, and payment cards
              </p>
            </div>
          </Link>

          {/* Card 7: Sportify Pay Balance (Orange Wallet Icon) */}
          <div className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Sportify Pay balance
                </h2>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₹500.00
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Instant refunds, wallet cash & 1-tap checkout
              </p>
            </div>
          </div>

          {/* Card 8: Contact Us (Headset Customer Care Icon) */}
          <Link
            href="/contact"
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Headphones className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                Contact Us
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Contact our Kashmir customer service via WhatsApp, phone or chat
              </p>
            </div>
          </Link>
        </div>

        {/* ─── Active Tab Edit Form Modal/Drawer (if user clicks Login & security) ─── */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border-2 border-orange-500/40 shadow-xl relative animate-fade-in">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Login & Security Settings
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Update your Sportify Kashmir credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("overview");
                  setIsEditing(false);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 font-medium">Username</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{user.username}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 font-medium">Email Address</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 font-medium">Mobile Number</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{user.mobile || "Not set"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 font-medium">Member Since</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    Edit Personal Information
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 text-red-600 rounded-xl font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={updatingProfile}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {updatingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>{updatingProfile ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Amazon-Style "Buy It Again" Section with Real Product Images ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-7 border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Buy it again
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Frequently purchased Kashmir sports items & recommendations
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All Catalog</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {buyAgainProducts.map((prod) => {
              const price = prod.discount
                ? prod.price - (prod.price * prod.discount) / 100
                : prod.price;

              return (
                <div
                  key={prod._id}
                  className="bg-gray-50 dark:bg-gray-750 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md hover:border-orange-500/40 transition group"
                >
                  <Link
                    href={`/product/${prod._id}`}
                    className="aspect-square w-full rounded-xl bg-white dark:bg-gray-800 p-2 flex items-center justify-center overflow-hidden mb-2 relative"
                  >
                    <ProductImage
                      product={prod}
                      alt={prod.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <div>
                    <Link href={`/product/${prod._id}`}>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[32px] group-hover:text-orange-600 transition">
                        {prod.name}
                      </h4>
                    </Link>
                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">
                      ₹{Math.round(price).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleQuickAddToCart(prod._id, e)}
                    disabled={addingCartId === prod._id}
                    className="mt-2.5 w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {addingCartId === prod._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={13} />
                    )}
                    <span>Add to cart</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Amazon-Style 3-Column Footer Directory Links (Exact match to screenshot!) ─── */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Column 1: Sports Content & Programs */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
                Sports Equipment & Programs
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 font-medium">
                <li>
                  <Link href="/categories" className="hover:text-orange-600 hover:underline">
                    Kashmir Willow Bat Sizing & Knocking Guide
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-orange-600 hover:underline">
                    Certified Leather Cricket Balls
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-orange-600 hover:underline">
                    Invoices & GST Tax Receipts
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-orange-600 hover:underline">
                    Badminton Racket Stringing & Grips
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Email alerts, messages, and ads */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
                Email alerts, messages, and ads
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 font-medium">
                <li>
                  <Link href="/profile" className="hover:text-orange-600 hover:underline">
                    WhatsApp Order Updates & Live Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-orange-600 hover:underline">
                    SMS Alert Preferences
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-orange-600 hover:underline">
                    Connected Browsers & Mobile App
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-orange-600 hover:underline">
                    Kashmir District Delivery Notifications
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: More ways to pay */}
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
                More ways to pay & save
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 font-medium">
                <li>
                  <Link href="/cart" className="hover:text-orange-600 hover:underline">
                    Default Purchase Settings
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-orange-600 hover:underline">
                    Sportify Pay Balance & UPI
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-orange-600 hover:underline">
                    Kashmir Sports Gift Coupons
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-orange-600 hover:underline">
                    Bulk School & Tournament Credit
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-xs font-semibold text-gray-500">Loading your account...</p>
          </div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}