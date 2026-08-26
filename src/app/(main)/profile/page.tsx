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
  Edit3,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import toast from "react-hot-toast";
import { cachedJson } from "@/lib/clientCache";
import ProductImage from "@/components/ProductImage";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

const PrimeMembershipModal = dynamic(() => import("@/components/shared/PrimeMembershipModal"), {
  ssr: false,
});

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  profilePic?: string;
  isAdmin: boolean;
  createdAt: string;
  sportsInterests?: string[];
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [primeData, setPrimeData] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    mobile: "",
    city: "Srinagar",
    pincode: "190009",
    newPassword: "",
    confirmPassword: "",
    currentPassword: "",
    sportsInterests: [] as string[],
  });
  const [updating, setUpdating] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);
  const [buyAgainProducts, setBuyAgainProducts] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const { language, setLanguage, currentLangOption, t } = useLanguage();

  // Resolve profile picture URL
  const getImageUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return `${API_URL}/uploads/${url}`;
  };

  useEffect(() => {
    const checkPrime = () => {
      try {
        const saved = localStorage.getItem("sportify_prime_membership");
        if (saved) {
          const parsed = JSON.parse(saved);
          setPrimeData(parsed?.isActive ? parsed : null);
        } else {
          setPrimeData(null);
        }
      } catch {
        setPrimeData(null);
      }
    };

    checkPrime();
    window.addEventListener("primeMembershipUpdated", checkPrime);
    return () => window.removeEventListener("primeMembershipUpdated", checkPrime);
  }, []);

  useEffect(() => {
    if (tabParam === "edit" || tabParam === "settings") {
      setIsEditModalOpen(true);
    } else if (tabParam === "prime") {
      setIsPrimeModalOpen(true);
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
          city: "Srinagar",
          pincode: "190009",
          newPassword: "",
          confirmPassword: "",
          currentPassword: "",
          sportsInterests: result.payload.sportsInterests || [],
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
        setPreviewUrl(null);
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
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
      setSelectedProfilePic(file);
      handleDirectPhotoUpload(file);
    }
  };

  const handleModalPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editForm.username.trim()) {
        toast.error("Username cannot be empty");
        return;
      }
      if (!editForm.email.trim() || !editForm.email.includes("@")) {
        toast.error("Please enter a valid email");
        return;
      }

      if (editForm.newPassword) {
        if (editForm.newPassword.length < 6) {
          toast.error("New password must be at least 6 characters");
          return;
        }
        if (editForm.newPassword !== editForm.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
      }

      setUpdatingProfile(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("username", editForm.username.trim());
      formData.append("email", editForm.email.trim());
      if (editForm.mobile) formData.append("mobile", editForm.mobile.trim());
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
        setIsEditModalOpen(false);
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

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
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

  const profileImageUrl = previewUrl || getImageUrl(user?.profilePic);

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
        {/* ─── Top Amazon-Style Title & Profile Bar with Prominent Edit Option ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-7 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Live Profile Photo with Camera Badge */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-orange-500 shadow-md">
                {uploadingPhoto ? (
                  <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
                ) : profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User className="w-9 h-9 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change profile photo"
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800 cursor-pointer"
              >
                <Camera size={13} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
              />
            </div>

            {/* User Info Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {user.username}
                </h1>
                {user.isAdmin && (
                  <span className="text-[10px] font-extrabold bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsPrimeModalOpen(true)}
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase cursor-pointer hover:opacity-90 transition flex items-center gap-1 ${
                    primeData?.isActive
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-xs"
                      : "bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300"
                  }`}
                >
                  <Crown size={11} className={primeData?.isActive ? "fill-current" : ""} />
                  <span>{primeData?.isActive ? "Kashmir VIP Member" : "Sportify Prime"}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-orange-500" />
                  <span>{user.email}</span>
                </span>
                {user.mobile && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-orange-500" />
                    <span>{user.mobile}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-orange-500" />
                  <span>Srinagar, Kashmir 190009</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Profile & Change Photo */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-600"
            >
              <Camera size={15} />
              <span>Change Photo</span>
            </button>
          </div>
        </div>

        {/* ─── Amazon-Style 8-Card Main Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Your Orders */}
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

          {/* Card 2: Login & Security (Directly Opens Edit Profile) */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Login &amp; security
                </h2>
                <span className="text-[11px] font-bold text-orange-600 hover:underline">Edit ›</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Edit login, username, email, password, and mobile number
              </p>
            </div>
          </button>

          {/* Card 3: Sportify Prime */}
          <button
            type="button"
            onClick={() => setIsPrimeModalOpen(true)}
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group text-left cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Crown className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                    Sportify Prime
                  </h2>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    primeData?.isActive
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                  }`}>
                    {primeData?.isActive ? "Kashmir VIP Active" : "30-Day Free Trial"}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-cyan-600 hover:underline">Manage ›</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {primeData?.isActive
                  ? `ID: ${primeData.memberId} • Free 24h Valley Express & 5% Cashback Active`
                  : "Free Kashmir 24h express delivery, priority bat knocking & VIP deals"}
              </p>
            </div>
          </button>

          {/* Card 4: Your Addresses */}
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

          {/* Card 5: Academy & Wholesale Hub */}
          <Link
            href="/wholesale"
            className="flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                Academy &amp; Wholesale
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Institutional discounts up to 30%, GST invoice & bulk bat crates
              </p>
            </div>
          </Link>

          {/* Card 6: Payment options */}
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
                UPI, Cash on Delivery, and instant checkout preferences
              </p>
            </div>
          </Link>

          {/* Card 7: Sportify Pay Balance */}
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
                Instant refunds, wallet balance & 1-tap fast order
              </p>
            </div>
          </div>

          {/* Card 8: Contact Us */}
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
                Contact Srinagar customer service via WhatsApp or direct phone
              </p>
            </div>
          </Link>

          {/* Card 9: 🌐 Real Language Settings & Live Switcher */}
          <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
                <Globe className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Language Settings
                  </h2>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                    {currentLangOption.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose your preferred store language
                </p>
              </div>
            </div>

            {/* 4 Interactive Language Pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              {LANGUAGES.map((l) => {
                const active = l.code === language;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      toast.success(`Language changed to ${l.name} (${l.nativeName})`);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                      active
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </span>
                    {active && <Check size={13} className="text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Amazon-Style "Buy It Again" Section with Real Product Images ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 sm:p-7 border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Buy it again
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Frequently purchased Kashmir sports items &amp; recommendations
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
                    className="block relative aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-2 mb-2"
                  >
                    <ProductImage
                      product={prod}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <div>
                    <Link href={`/product/${prod._id}`}>
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-orange-600 transition">
                        {prod.name}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-extrabold text-orange-600">
                        ₹{Math.round(price).toLocaleString("en-IN")}
                      </span>
                      {prod.discount > 0 && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{prod.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleQuickAddToCart(prod._id, e)}
                    disabled={addingCartId === prod._id}
                    className="mt-2.5 w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {addingCartId === prod._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={12} />
                    )}
                    <span>Add to cart</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Amazon-Style 3-Column Directory Footer Links ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs">
            {/* Col 1 */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-sm pb-1 border-b border-gray-100 dark:border-gray-700">
                Orders &amp; Shopping
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/orders" className="hover:text-orange-600 hover:underline">Your Orders &amp; Invoices</Link></li>
                <li><Link href="/wishlist" className="hover:text-orange-600 hover:underline">Your Wishlist</Link></li>
                <li><Link href="/cart" className="hover:text-orange-600 hover:underline">View Shopping Cart</Link></li>
                <li><Link href="/wholesale" className="hover:text-orange-600 hover:underline">Academy Bulk Orders</Link></li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-sm pb-1 border-b border-gray-100 dark:border-gray-700">
                Account Settings
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  <button type="button" onClick={() => setIsEditModalOpen(true)} className="hover:text-orange-600 hover:underline text-left cursor-pointer">
                    Edit Personal Profile &amp; Photo
                  </button>
                </li>
                <li><Link href="/address" className="hover:text-orange-600 hover:underline">Manage Delivery Addresses</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("show-pwa-install"))}
                    className="hover:text-orange-600 hover:underline text-left cursor-pointer"
                  >
                    Install Sportify App (PWA)
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handleLogout} className="text-red-600 hover:underline text-left cursor-pointer">
                    Sign Out of Account
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2.5">
              <h4 className="font-extrabold text-gray-900 dark:text-white text-sm pb-1 border-b border-gray-100 dark:border-gray-700">
                Help &amp; Customer Support
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/contact" className="hover:text-orange-600 hover:underline">Customer Service &amp; Help Desk</Link></li>
                <li><Link href="/faq" className="hover:text-orange-600 hover:underline">Frequently Asked Questions</Link></li>
                <li><Link href="/return-policy" className="hover:text-orange-600 hover:underline">Returns &amp; Replacement Policy</Link></li>
                <li><Link href="/shipping-policy" className="hover:text-orange-600 hover:underline">Kashmir Express Shipping Rates</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          EDIT PROFILE MODAL & DIALOG
      ═══════════════════════════════════════════════════════════════════════ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Edit Profile &amp; Settings</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update your Sportify Kashmir personal details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setPreviewUrl(null);
                  setSelectedProfilePic(null);
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveChanges} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              {/* Photo Upload In Modal */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-orange-500 shrink-0 flex items-center justify-center">
                  {profileImageUrl && !imageError ? (
                    <img src={profileImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs">Profile Photo</p>
                  <p className="text-[11px] text-gray-500 mb-1.5">PNG, JPG or WEBP under 5MB</p>
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
                  >
                    Select New Photo
                  </button>
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleModalPhotoSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name / Username *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="e.g. warmuzamil"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="e.g. muzamil@example.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Phone / Mobile Number (for Kashmir Delivery &amp; OTP)
                </label>
                <input
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  placeholder="e.g. 9682645127"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Sports Interests Selector */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Your Favorite Sports Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Cricket 🏏", "Football ⚽", "Badminton 🏸", "Gym & Fitness 🏋️", "Tennis 🎾", "Basketball 🏀", "Apparel & Shoes 👟"].map((sport) => {
                    const isSelected = selectedSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleSport(sport)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                          isSelected
                            ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {sport}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Change Password (Optional) */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Lock size={14} className="text-orange-500" />
                    <span>Change Password (Optional)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-orange-600 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password (min 6 chars)"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  <span>{updatingProfile ? "Saving Changes..." : "Save Profile Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setPreviewUrl(null);
                    setSelectedProfilePic(null);
                  }}
                  className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sportify Prime VIP Modal */}
      <PrimeMembershipModal
        isOpen={isPrimeModalOpen}
        onClose={() => setIsPrimeModalOpen(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}