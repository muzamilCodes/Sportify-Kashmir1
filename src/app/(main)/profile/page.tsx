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
  ExternalLink,
  BookOpen,
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

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined" && localStorage.getItem("user")) {
      return false;
    }
    return true;
  });
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(tabParam === "wallet");
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [primeData, setPrimeData] = useState<any>(null);
  
  // Sportify Pay & Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(500);
  const [addAmount, setAddAmount] = useState<string>("");
  const [isAddingMoney, setIsAddingMoney] = useState<boolean>(false);
  const [walletTransactions, setWalletTransactions] = useState<Array<{
    id: string;
    title: string;
    type: "credit" | "debit";
    amount: number;
    date: string;
    status: string;
  }>>([
    {
      id: "tx-1",
      title: "Welcome Athlete Cashback Bonus",
      type: "credit",
      amount: 500,
      date: "Active",
      status: "Completed",
    },
    {
      id: "tx-2",
      title: "Lucky Spin Wheel Reward",
      type: "credit",
      amount: 50,
      date: "Recent",
      status: "Completed",
    },
  ]);

  const [securityForm, setSecurityForm] = useState({
    username: "",
    email: "",
    mobile: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingSecurity, setUpdatingSecurity] = useState(false);
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
  const [updatingProfile, setUpdatingProfile] = useState(false);
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

  const { language, setLanguage, currentLangOption } = useLanguage();

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

  // Load persistent wallet balance & transactions
  useEffect(() => {
    try {
      const savedBal = localStorage.getItem("sportify_wallet_balance");
      if (savedBal !== null) {
        setWalletBalance(parseFloat(savedBal));
      }
      const savedTxs = localStorage.getItem("sportify_wallet_transactions");
      if (savedTxs) {
        setWalletTransactions(JSON.parse(savedTxs));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (tabParam === "wallet") {
      setIsWalletModalOpen(true);
    } else if (tabParam === "security" || tabParam === "login") {
      setIsSecurityModalOpen(true);
    } else if (tabParam === "edit" || tabParam === "settings") {
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
      const token = localStorage.getItem("token");
      if (!token) {
        const cachedUser = localStorage.getItem("user");
        if (!cachedUser) {
          router.push("/login");
        }
        return;
      }

      const response = await fetch(`${API_URL}/user/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      const profileUser = result.payload || result.user || result.data;
      if (profileUser) {
        setUser(profileUser);
        localStorage.setItem("user", JSON.stringify(profileUser));
        setEditForm({
          username: profileUser.username || "",
          email: profileUser.email || "",
          mobile: profileUser.mobile || "",
          city: "Srinagar",
          pincode: "190009",
          newPassword: "",
          confirmPassword: "",
          currentPassword: "",
          sportsInterests: profileUser.sportsInterests || [],
        });
        setSecurityForm({
          username: profileUser.username || "",
          email: profileUser.email || "",
          mobile: profileUser.mobile || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        if (profileUser.sportsInterests) {
          setSelectedSports(profileUser.sportsInterests);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
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

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!securityForm.username.trim()) {
        toast.error("Username cannot be empty");
        return;
      }
      if (!securityForm.email.trim() || !securityForm.email.includes("@")) {
        toast.error("Please enter a valid email");
        return;
      }

      if (securityForm.newPassword) {
        if (!securityForm.currentPassword) {
          toast.error("Please enter your current password to set a new password");
          return;
        }
        if (securityForm.newPassword.length < 6) {
          toast.error("New password must be at least 6 characters");
          return;
        }
        if (securityForm.newPassword !== securityForm.confirmPassword) {
          toast.error("New passwords do not match");
          return;
        }
      }

      setUpdatingSecurity(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        router.push("/login");
        return;
      }

      const payload: any = {
        username: securityForm.username.trim(),
        email: securityForm.email.trim(),
        mobile: securityForm.mobile.trim(),
      };

      if (securityForm.newPassword) {
        payload.currentPassword = securityForm.currentPassword;
        payload.newPassword = securityForm.newPassword;
      }

      const response = await fetch(`${API_URL}/user/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        const updatedUser = result.user || {
          ...user,
          username: securityForm.username,
          email: securityForm.email,
          mobile: securityForm.mobile,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("authUpdated"));
        toast.success(
          securityForm.newPassword
            ? "Password & Security settings updated successfully!"
            : "Login & Security settings saved!"
        );
        setIsSecurityModalOpen(false);
        setSecurityForm((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        fetchUserProfile();
      } else {
        toast.error(result.message || "Failed to update security settings");
      }
    } catch {
      toast.error("Network error while updating security settings");
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const handleAddWalletMoney = (amountToAdd?: number) => {
    const amount = amountToAdd || parseFloat(addAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount to recharge");
      return;
    }
    setIsAddingMoney(true);
    setTimeout(() => {
      const newBal = walletBalance + amount;
      setWalletBalance(newBal);
      localStorage.setItem("sportify_wallet_balance", newBal.toString());
      const newTx = {
        id: `tx-${Date.now()}`,
        title: "Sportify Pay Wallet Recharge (UPI/Card)",
        type: "credit" as const,
        amount,
        date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        status: "Completed",
      };
      const updatedTxs = [newTx, ...walletTransactions];
      setWalletTransactions(updatedTxs);
      localStorage.setItem("sportify_wallet_transactions", JSON.stringify(updatedTxs));
      setIsAddingMoney(false);
      setAddAmount("");
      toast.success(`₹${amount.toLocaleString('en-IN')} added to Sportify Pay successfully! 🎉`);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#10b981", "#f59e0b", "#3b82f6"],
        });
      } catch {}
    }, 400);
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
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-4 sm:py-8 px-3 sm:px-6 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════════
            TOP PROFILE HERO CARD — WITH PROMINENT TOP "SIGN OUT OF ACCOUNT"
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-850 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-gray-200/90 dark:border-gray-700/80 shadow-xs dark:shadow-none relative overflow-hidden">
          {/* Subtle Kashmir decorative ambient backdrop */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20 blur-2xl" />

          <div className="relative z-1 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            {/* Left: Avatar + User Info */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-5">
              {/* Profile Avatar with Camera Overlay */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-orange-500 shadow-md">
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
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500/70 dark:text-orange-400/80" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Change profile photo"
                  aria-label="Change profile photo"
                  className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-1.5 sm:p-2 rounded-full shadow-md border-2 border-white dark:border-gray-800 cursor-pointer active:scale-95 transition"
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

              {/* User Identity & Info */}
              <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight break-words">
                    {user.username}
                  </h1>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="text-[10px] font-extrabold bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs hover:opacity-90 flex items-center gap-1 shrink-0 active:scale-95 transition"
                      title="Open Admin Dashboard"
                    >
                      <Shield size={10} />
                      <span>Admin Panel ›</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPrimeModalOpen(true)}
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase cursor-pointer hover:opacity-90 transition flex items-center gap-1 shrink-0 ${
                      primeData?.isActive
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 shadow-xs"
                        : "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800"
                    }`}
                  >
                    <Crown size={11} className={primeData?.isActive ? "fill-current" : ""} />
                    <span>{primeData?.isActive ? "Kashmir VIP Member" : "Sportify Prime"}</span>
                  </button>
                </div>

                {/* Email, Phone, Location chips */}
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 min-w-0 max-w-full">
                    <Mail size={13} className="text-orange-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </span>
                  {user.mobile && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Phone size={13} className="text-orange-500 shrink-0" />
                      <span>{user.mobile}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 shrink-0 hidden sm:inline-flex">
                    <MapPin size={13} className="text-orange-500 shrink-0" />
                    <span>Srinagar, Kashmir 190009</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ─── Top Action Buttons Row: Edit Profile, Change Photo & PROMINENT Sign Out ─── */}
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700/60">
              {/* 1. Edit Profile */}
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="py-2.5 px-3 sm:px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>

              {/* 2. Change Photo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 sm:px-4 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-600 active:scale-95"
              >
                <Camera size={15} />
                <span className="hidden xs:inline">Change </span>Photo
              </button>

              {/* 3. Sign Out of Account (TOP PROMINENT BUTTON) */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="py-2.5 px-3 sm:px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                title="Sign Out of Account"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Prominent Admin Control Panel Banner (Visible on mobile & desktop when Admin) ─── */}
        {user.isAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 text-white rounded-2xl border-2 border-orange-500/50 hover:border-orange-500 shadow-md hover:shadow-xl transition group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                  <span>Open Admin Control Panel</span>
                  <span className="text-[9px] font-extrabold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">
                    Admin Portal
                  </span>
                </p>
                <p className="text-[11px] text-gray-400">
                  Manage store catalog, live orders, customers &amp; inventory
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-orange-400 group-hover:text-white flex items-center gap-1 shrink-0 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/30">
              <span className="hidden xs:inline">Admin Dashboard</span>
              <ChevronRight size={14} />
            </span>
          </Link>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            AMAZON-STYLE 4-PILL QUICK SHORTCUT STRIP (HIGH PRIORITY ON MOBILE)
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Quick 1: Orders */}
          <Link
            href="/orders"
            className="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 shadow-xs hover:shadow-md transition active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Package size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition">
                Your Orders
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Track shipments
              </p>
            </div>
          </Link>

          {/* Quick 2: Buy Again */}
          <a
            href="#buy-again"
            className="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 shadow-xs hover:shadow-md transition active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-800/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
              <RefreshCw size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition">
                Buy Again
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Fast reorder
              </p>
            </div>
          </a>

          {/* Quick 3: Wishlist */}
          <Link
            href="/wishlist"
            className="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 shadow-xs hover:shadow-md transition active:scale-[0.98] group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-105 transition-transform">
              <Heart size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition">
                Your Wishlist
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Saved bats &amp; gear
              </p>
            </div>
          </Link>

          {/* Quick 4: Sportify Pay Wallet */}
          <button
            type="button"
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-3 p-3 sm:p-3.5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 shadow-xs hover:shadow-md transition active:scale-[0.98] group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <Wallet size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition">
                  Sportify Pay
                </p>
                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{walletBalance.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Wallet balance (Tap to Manage)
              </p>
            </div>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            AMAZON-STYLE 8-CARD CORE SERVICES & SETTINGS GRID
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 0: Admin Dashboard (Only visible for Admins) */}
          {user.isAdmin && (
            <Link
              href="/admin"
              className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-gradient-to-br from-orange-500/10 to-red-500/5 dark:bg-gray-850 rounded-2xl border-2 border-orange-500 hover:shadow-lg transition active:scale-[0.99] group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-black text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                    Admin Dashboard
                  </h2>
                  <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Manage live catalog, customer orders, categories, refunds &amp; store analytics
                </p>
              </div>
            </Link>
          )}

          {/* Card 1: Your Orders */}
          <Link
            href="/orders"
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Your Orders
                </h2>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Track, return, or buy Kashmir willow bats &amp; athletic gear again
              </p>
            </div>
          </Link>

          {/* Card 2: Login & Security */}
          <button
            type="button"
            onClick={() => {
              setSecurityForm({
                username: user?.username || "",
                email: user?.email || "",
                mobile: user?.mobile || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setIsSecurityModalOpen(true);
            }}
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] text-left group cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Login &amp; Security
                </h2>
                <span className="text-[11px] font-bold text-orange-600 hover:underline">Manage ›</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Change password, update email, username, and manage account credentials
              </p>
            </div>
          </button>

          {/* Card 3: Sportify Prime */}
          <button
            type="button"
            onClick={() => setIsPrimeModalOpen(true)}
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group text-left cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                    Sportify Prime
                  </h2>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                    primeData?.isActive
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                  }`}>
                    {primeData?.isActive ? "VIP Active" : "30-Day Trial"}
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
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Your Addresses
                </h2>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Edit delivery addresses for home, academy, and sports clubs
              </p>
            </div>
          </Link>

          {/* Card 5: Academy & Wholesale Hub */}
          <Link
            href="/wholesale"
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Academy &amp; Wholesale
                </h2>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Institutional discounts up to 30%, GST invoice &amp; bulk bat crates
              </p>
            </div>
          </Link>

          {/* Card 6: Payment options */}
          <Link
            href="/cart"
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Payment Options
                </h2>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                UPI, Cash on Delivery, and instant checkout preferences
              </p>
            </div>
          </Link>

          {/* Card 7: Sportify Pay Balance */}
          <button
            type="button"
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group text-left cursor-pointer"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Sportify Pay Balance
                </h2>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Instant refunds, wallet balance &amp; 1-tap fast order (Tap to View)
              </p>
            </div>
          </button>

          {/* Card 8: Contact Us */}
          <Link
            href="/contact"
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Contact Us
                </h2>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Contact Srinagar customer service via WhatsApp or direct phone
              </p>
            </div>
          </Link>

          {/* Card 8.5: Sports Blog & Equipment Guides */}
          <Link
            href="/blog"
            className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition active:scale-[0.99] group"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-800/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  Sports Blog &amp; Guides
                </h2>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Kashmir willow maintenance, bat knocking tutorials &amp; athlete tips
              </p>
            </div>
          </Link>

          {/* Card 9: 🌐 Real Language Settings & Live Switcher */}
          <div className="p-4 sm:p-5 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition flex flex-col justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
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
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer active:scale-95 ${
                      active
                        ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                        : "bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600"
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

        {/* ═══════════════════════════════════════════════════════════════════════
            AMAZON-STYLE "BUY IT AGAIN" SECTION WITH PRODUCT CARDS
        ═══════════════════════════════════════════════════════════════════════ */}
        <div id="buy-again" className="bg-white dark:bg-gray-850 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-gray-200/90 dark:border-gray-700/80 shadow-xs scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-xl font-black text-gray-900 dark:text-white">
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
              <span>View All</span>
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
                  className="bg-gray-50 dark:bg-gray-750/80 rounded-2xl p-2.5 sm:p-3 border border-gray-200/80 dark:border-gray-700 flex flex-col justify-between hover:shadow-md hover:border-orange-500/40 transition group"
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
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400">
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
                    className="mt-2.5 w-full py-2 sm:py-1.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-gray-900 rounded-xl sm:rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
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

        {/* ═══════════════════════════════════════════════════════════════════════
            AMAZON-STYLE 3-COLUMN DIRECTORY & ACCOUNT FOOTER LINKS
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-850 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-200/90 dark:border-gray-700/80 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-xs">
            {/* Col 1 */}
            <div className="space-y-2.5">
              <h4 className="font-black text-gray-900 dark:text-white text-sm pb-1.5 border-b border-gray-100 dark:border-gray-700/80 flex items-center gap-2">
                <ShoppingBag size={16} className="text-orange-500" />
                <span>Orders &amp; Shopping</span>
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/orders" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>Your Orders &amp; Invoices</span></Link></li>
                <li><Link href="/wishlist" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>Your Wishlist</span></Link></li>
                <li><Link href="/cart" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>View Shopping Cart</span></Link></li>
                <li><Link href="/wholesale" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>Academy Bulk Orders</span></Link></li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="space-y-2.5">
              <h4 className="font-black text-gray-900 dark:text-white text-sm pb-1.5 border-b border-gray-100 dark:border-gray-700/80 flex items-center gap-2">
                <Settings size={16} className="text-orange-500" />
                <span>Account Settings</span>
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  <button type="button" onClick={() => setIsEditModalOpen(true)} className="hover:text-orange-600 hover:underline text-left cursor-pointer flex items-center gap-1.5">
                    <span>•</span><span>Edit Personal Profile &amp; Photo</span>
                  </button>
                </li>
                <li>
                  <Link href="/address" className="hover:text-orange-600 hover:underline flex items-center gap-1.5">
                    <span>•</span><span>Manage Delivery Addresses</span>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent("show-pwa-install"))}
                    className="hover:text-orange-600 hover:underline text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <span>•</span><span>Install Sportify App (PWA)</span>
                  </button>
                </li>
                <li className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut size={13} />
                    <span>Sign Out of Account</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2.5">
              <h4 className="font-black text-gray-900 dark:text-white text-sm pb-1.5 border-b border-gray-100 dark:border-gray-700/80 flex items-center gap-2">
                <Headphones size={16} className="text-orange-500" />
                <span>Help &amp; Customer Support</span>
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/contact" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>Customer Service &amp; Help Desk</span></Link></li>
                <li><Link href="/faq" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>Frequently Asked Questions</span></Link></li>
                <li><Link href="/return-policy" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>Returns &amp; Replacement Policy</span></Link></li>
                <li><Link href="/shipping-policy" className="hover:text-orange-600 hover:underline flex items-center gap-1.5"><span>•</span><span>Kashmir Express Shipping Rates</span></Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONFIRM SIGN OUT MODAL DIALOG
      ═══════════════════════════════════════════════════════════════════════ */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 dark:border-gray-700 text-center space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 rounded-full flex items-center justify-center mx-auto text-rose-600">
              <LogOut size={26} />
            </div>
            <div>
              <h3 className="text-lg font-black">Sign Out of Account?</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to sign out of Sportify Kashmir on this device?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
              >
                Yes, Sign Out
              </button>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Edit Profile &amp; Settings</h3>
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
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveChanges} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              {/* Photo Upload In Modal */}
              <div className="flex items-center gap-3.5 sm:gap-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-orange-500 shrink-0 flex items-center justify-center">
                  {profileImageUrl && !imageError ? (
                    <img src={profileImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
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
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
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
                  className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          LOGIN & SECURITY DEDICATED MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Login &amp; Security</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage credentials, password &amp; account protection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSecurityModalOpen(false);
                  setSecurityForm((prev) => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }));
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSecurity} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
              {/* Account Overview Tag */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  🔒
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-blue-950 dark:text-blue-200">
                    256-Bit SSL Protected Account
                  </p>
                  <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                    Your password and login credentials are encrypted with salted BCrypt hashing.
                  </p>
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Account Username *
                </label>
                <input
                  type="text"
                  required
                  value={securityForm.username}
                  onChange={(e) => setSecurityForm({ ...securityForm, username: e.target.value })}
                  placeholder="e.g. warmuzamil"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address (Primary Login ID) *
                </label>
                <input
                  type="email"
                  required
                  value={securityForm.email}
                  onChange={(e) => setSecurityForm({ ...securityForm, email: e.target.value })}
                  placeholder="e.g. muzamil@example.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Mobile Phone Field */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number (for Delivery &amp; OTP Verification)
                </label>
                <input
                  type="tel"
                  value={securityForm.mobile}
                  onChange={(e) => setSecurityForm({ ...securityForm, mobile: e.target.value })}
                  placeholder="e.g. 9682645127"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* ─── Change Password Section ─── */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Lock size={15} className="text-orange-500" />
                    <span>Change Account Password</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">Leave blank to keep unchanged</span>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block font-semibold text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                      New Password (min 6 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New password"
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 pr-10 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[11px] text-gray-600 dark:text-gray-400 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Repeat new password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={updatingSecurity}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {updatingSecurity ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>{updatingSecurity ? "Saving Security Changes..." : "Save Security Changes"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSecurityModalOpen(false);
                    setSecurityForm((prev) => ({
                      ...prev,
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    }));
                  }}
                  className="px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════════════════════
          SPORTIFY PAY & WALLET DEDICATED MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Wallet size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Sportify Pay &amp; Wallet</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Instant checkout, rewards &amp; athlete cashback</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWalletModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-500 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 sm:p-6 space-y-5">
              {/* 1. Main Wallet Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between relative z-1 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                      Sportify Pay
                    </span>
                    <span className="text-[10px] bg-emerald-400/30 text-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Verified Athlete
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-200">24h Valley Express</span>
                </div>

                <div className="relative z-1 mb-5">
                  <p className="text-xs text-emerald-100 font-medium">Available Wallet Balance</p>
                  <h2 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">
                    ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </h2>
                </div>

                <div className="relative z-1 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
                  <span className="truncate">VPA: {user?.username?.toLowerCase() || "user"}@sportifypay</span>
                  <span className="font-mono text-[11px]">SK-WAL-{user?._id?.slice(-6).toUpperCase() || "789123"}</span>
                </div>
              </div>

              {/* 2. Add Money / Recharge Wallet */}
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>⚡ Recharge Sportify Pay</span>
                  </h4>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Instant Top-up</span>
                </div>

                {/* Quick Add Chips */}
                <div className="flex gap-2 flex-wrap">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddWalletMoney(amt)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-600 transition cursor-pointer active:scale-95 shadow-xs"
                    >
                      + ₹{amt}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Form */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="Enter custom amount"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddWalletMoney()}
                    disabled={isAddingMoney}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isAddingMoney ? "Adding..." : "Add Money"}
                  </button>
                </div>
              </div>

              {/* 3. Account Details Overview */}
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                  Linked Account Information
                </h4>
                <div className="divide-y divide-gray-100 dark:divide-gray-750 bg-gray-50 dark:bg-gray-750 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Account Holder:</span>
                    <span className="font-bold">{user?.username || "Verified Athlete"}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Linked Mobile:</span>
                    <span className="font-bold">{user?.mobile || "+91 9682645127"}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Linked Email:</span>
                    <span className="font-bold truncate max-w-[200px]">{user?.email}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">KYC Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified ✅</span>
                  </div>
                </div>
              </div>

              {/* 4. Recent Wallet Transactions */}
              <div className="space-y-2 text-xs">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                  Recent Wallet Activity
                </h4>
                <div className="space-y-2">
                  {walletTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-white dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <p className="font-bold text-xs text-gray-900 dark:text-white">{tx.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{tx.date} • {tx.status}</p>
                      </div>
                      <span
                        className={`text-xs font-black ${
                          tx.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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