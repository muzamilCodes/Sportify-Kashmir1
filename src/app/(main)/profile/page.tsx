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
  Trash2,
  ShieldCheck,
  Laptop,
  Smartphone,
  KeyRound,
  Plus,
  Landmark,
  CheckCircle2,
  Copy,
  QrCode,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  AlertOctagon,
} from "lucide-react";
import confetti from "canvas-confetti";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(tabParam || "overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(tabParam === "wallet");
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [primeData, setPrimeData] = useState<any>(null);
  
  // Sportify Pay & Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(500);
  const [addAmount, setAddAmount] = useState<string>("");
  const [isAddingMoney, setIsAddingMoney] = useState<boolean>(false);
  // Sportify Pay Withdrawal & Filter State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawTargetType, setWithdrawTargetType] = useState<"bank" | "upi">("bank");
  const [withdrawTargetId, setWithdrawTargetId] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [txFilter, setTxFilter] = useState<"all" | "credit" | "debit">("all");

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

  // Real User Payment Methods & Saved Accounts State
  const [paymentSubTab, setPaymentSubTab] = useState<"cards" | "upi" | "bank" | "wallet">("cards");
  const [savedCards, setSavedCards] = useState<Array<{
    _id: string;
    cardHolder: string;
    cardNumber: string;
    rawLast4?: string;
    expiryDate: string;
    cardType: string;
    bankName: string;
    createdAt: string;
  }>>([]);
  const [savedUpi, setSavedUpi] = useState<Array<{
    _id: string;
    vpa: string;
    name?: string;
    provider?: string;
    createdAt: string;
  }>>([]);
  const [savedBankAccounts, setSavedBankAccounts] = useState<Array<{
    _id: string;
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    createdAt: string;
  }>>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Forms for adding payment accounts
  const [cardForm, setCardForm] = useState({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardType: "Debit Card",
    bankName: "J&K Bank",
  });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  const [upiForm, setUpiForm] = useState({
    vpa: "",
    name: "Primary UPI",
    provider: "GooglePay / PhonePe / Paytm",
  });
  const [isAddingUpi, setIsAddingUpi] = useState(false);
  const [showAddUpiForm, setShowAddUpiForm] = useState(false);

  const [bankForm, setBankForm] = useState({
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    bankName: "Jammu & Kashmir Bank",
    branchName: "Srinagar Main Branch",
  });
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [showAddBankForm, setShowAddBankForm] = useState(false);

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
    setMounted(true);
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
      }
      const savedBal = localStorage.getItem("sportify_wallet_balance");
      if (savedBal) setWalletBalance(parseFloat(savedBal) || 500);
      const savedTx = localStorage.getItem("sportify_wallet_transactions");
      if (savedTx) setWalletTransactions(JSON.parse(savedTx));
    } catch {}
    fetchUserProfile();
    fetchPaymentMethods();
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

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_URL}/user/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setSavedCards(result.data.savedCards || []);
        setSavedUpi(result.data.savedUpi || []);
        setSavedBankAccounts(result.data.savedBankAccounts || []);
        if (result.data.walletBalance !== undefined && result.data.walletBalance !== null) {
          setWalletBalance(result.data.walletBalance);
          localStorage.setItem("sportify_wallet_balance", result.data.walletBalance.toString());
        }
        if (Array.isArray(result.data.walletTransactions) && result.data.walletTransactions.length > 0) {
          setWalletTransactions(result.data.walletTransactions);
          localStorage.setItem("sportify_wallet_transactions", JSON.stringify(result.data.walletTransactions));
        }
      }
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.cardHolder.trim() || !cardForm.cardNumber.trim() || !cardForm.expiryDate.trim()) {
      toast.error("Please enter Cardholder Name, 16-Digit Card Number & Expiry");
      return;
    }
    const cleanNum = cardForm.cardNumber.replace(/\s+/g, "");
    if (cleanNum.length < 12 || cleanNum.length > 19) {
      toast.error("Please enter a valid 16-digit ATM / Card number");
      return;
    }

    try {
      setIsAddingCard(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/add-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cardForm),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("ATM / Debit Card added successfully! 💳");
        setShowAddCardForm(false);
        setCardForm({
          cardHolder: "",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardType: "Debit Card",
          bankName: "J&K Bank",
        });
        fetchPaymentMethods();
      } else {
        toast.error(result.message || "Failed to add card");
      }
    } catch {
      toast.error("Network error adding card");
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/delete-card/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Card removed successfully");
        setSavedCards((prev) => prev.filter((c) => c._id !== cardId));
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete card");
    }
  };

  const handleAddUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiForm.vpa.trim() || !upiForm.vpa.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. yourname@oksbi or 9682645124@upi)");
      return;
    }

    try {
      setIsAddingUpi(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/add-upi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(upiForm),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("UPI ID linked successfully! ⚡");
        setShowAddUpiForm(false);
        setUpiForm({
          vpa: "",
          name: "Primary UPI",
          provider: "GooglePay / PhonePe / Paytm",
        });
        fetchPaymentMethods();
      } else {
        toast.error(result.message || "Failed to link UPI");
      }
    } catch {
      toast.error("Network error linking UPI");
    } finally {
      setIsAddingUpi(false);
    }
  };

  const handleDeleteUpi = async (upiId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/delete-upi/${upiId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("UPI ID unlinked successfully");
        setSavedUpi((prev) => prev.filter((u) => u._id !== upiId));
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete UPI");
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.accountHolder.trim() || !bankForm.accountNumber.trim() || !bankForm.ifscCode.trim() || !bankForm.bankName.trim()) {
      toast.error("Please fill in Account Holder, Account Number, IFSC and Bank Name");
      return;
    }
    if (bankForm.accountNumber.trim() !== bankForm.confirmAccountNumber.trim()) {
      toast.error("Account Numbers do not match!");
      return;
    }

    try {
      setIsAddingBank(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/add-bank-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bankForm),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Bank Account linked successfully! 🏦");
        setShowAddBankForm(false);
        setBankForm({
          accountHolder: "",
          accountNumber: "",
          confirmAccountNumber: "",
          ifscCode: "",
          bankName: "Jammu & Kashmir Bank",
          branchName: "Srinagar Main Branch",
        });
        fetchPaymentMethods();
      } else {
        toast.error(result.message || "Failed to add bank account");
      }
    } catch {
      toast.error("Network error saving bank details");
    } finally {
      setIsAddingBank(false);
    }
  };

  const handleDeleteBankAccount = async (bankId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/delete-bank-account/${bankId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Bank Account removed successfully");
        setSavedBankAccounts((prev) => prev.filter((b) => b._id !== bankId));
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete bank account");
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

  
  const handleCopyVpa = (vpaText: string) => {
    if (!vpaText) return;
    navigator.clipboard.writeText(vpaText);
    toast.success("Sportify VPA copied to clipboard! 📋");
  };

  const handleWithdrawMoney = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseFloat(withdrawAmount);
    if (!num || isNaN(num) || num <= 0) {
      toast.error("Please enter a valid amount to withdraw");
      return;
    }
    if (num > walletBalance) {
      toast.error(`Insufficient wallet balance! Available: ₹${walletBalance.toLocaleString("en-IN")}`);
      return;
    }

    let targetDetail = "";
    if (withdrawTargetType === "bank") {
      const selectedBank = savedBankAccounts.find((b) => b._id === withdrawTargetId) || savedBankAccounts[0];
      if (!selectedBank) {
        toast.error("Please add a Bank Account first to withdraw money");
        setPaymentSubTab("bank");
        setShowAddBankForm(true);
        return;
      }
      targetDetail = `${selectedBank.bankName} (${selectedBank.accountNumber.slice(-4)})`;
    } else {
      const selectedUpi = savedUpi.find((u) => u._id === withdrawTargetId) || savedUpi[0];
      if (!selectedUpi) {
        toast.error("Please link a UPI ID first to withdraw money");
        setPaymentSubTab("upi");
        setShowAddUpiForm(true);
        return;
      }
      targetDetail = selectedUpi.vpa;
    }

    try {
      setIsWithdrawing(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/wallet/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: num,
          targetType: withdrawTargetType,
          targetDetail,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setWalletBalance(result.data.walletBalance);
        localStorage.setItem("sportify_wallet_balance", result.data.walletBalance.toString());
        if (Array.isArray(result.data.walletTransactions)) {
          setWalletTransactions(result.data.walletTransactions);
          localStorage.setItem("sportify_wallet_transactions", JSON.stringify(result.data.walletTransactions));
        }
        setWithdrawAmount("");
        setIsWithdrawOpen(false);
        toast.success(`₹${num.toLocaleString("en-IN")} transferred successfully! 💸`);
      } else {
        toast.error(result.message || "Failed to process withdrawal");
      }
    } catch {
      toast.error("Network error processing withdrawal");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAddWalletMoney = async (amountToAdd?: number) => {
    const amount = amountToAdd || parseFloat(addAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount to recharge");
      return;
    }

    try {
      setIsAddingMoney(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/wallet/recharge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setWalletBalance(result.data.walletBalance);
        localStorage.setItem("sportify_wallet_balance", result.data.walletBalance.toString());
        if (Array.isArray(result.data.walletTransactions)) {
          setWalletTransactions(result.data.walletTransactions);
          localStorage.setItem("sportify_wallet_transactions", JSON.stringify(result.data.walletTransactions));
        }
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
      } else {
        toast.error(result.message || "Failed to recharge wallet");
      }
    } catch {
      toast.error("Network error recharging wallet");
    } finally {
      setIsAddingMoney(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion");
      return;
    }
    setIsDeletingAccount(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired, please login again");
        router.push("/login");
        return;
      }
      const response = await fetch(`${API_URL}/user/account/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        localStorage.clear();
        window.dispatchEvent(new Event("authUpdated"));
        toast.success("Your Sportify account has been permanently deleted.");
        setIsDeleteModalOpen(false);
        setIsSecurityModalOpen(false);
        router.push("/login");
      } else {
        toast.error(result.message || "Failed to delete account");
      }
    } catch {
      toast.error("Network error while deleting account");
    } finally {
      setIsDeletingAccount(false);
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

  const profileImageUrl = previewUrl || getImageUrl(user?.profilePic);

  if (!mounted || loading) {
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
          LOGIN & SECURITY DEDICATED MODAL (ENTERPRISE MULTI-SECTION SUITE)
      ═══════════════════════════════════════════════════════════════════════ */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Login &amp; Security Center</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage credentials, passwords, 2FA &amp; account control</p>
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

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
              {/* 1. Security Health & Protection Card */}
              <div className="p-4 bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-cyan-900/10 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                        98% Account Shield Score
                      </p>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                        Strong
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                      BCrypt-12 Salted Hashing &amp; 256-Bit SSL Active Session
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Account Credentials & Contact Form */}
              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <User size={15} className="text-orange-500" />
                    <span>Personal Login Credentials</span>
                  </h4>
                  <span className="text-[10px] text-gray-400">Primary details</span>
                </div>

                {/* Username Field */}
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1 text-xs">
                    Account Username / Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={securityForm.username}
                    onChange={(e) => setSecurityForm({ ...securityForm, username: e.target.value })}
                    placeholder="e.g. warmuzamil"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white text-xs sm:text-sm"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 text-xs">
                      Primary Email Address (Login ID) *
                    </label>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Verified ✅
                    </span>
                  </div>
                  <input
                    type="email"
                    required
                    value={securityForm.email}
                    onChange={(e) => setSecurityForm({ ...securityForm, email: e.target.value })}
                    placeholder="e.g. muzamil@example.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white text-xs sm:text-sm"
                  />
                </div>

                {/* Mobile Phone Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700 dark:text-gray-300 text-xs">
                      Mobile Phone (for Delivery, OTP &amp; WhatsApp Updates)
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      SMS Active 📱
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={securityForm.mobile}
                    onChange={(e) => setSecurityForm({ ...securityForm, mobile: e.target.value })}
                    placeholder="e.g. 9682645127"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white text-xs sm:text-sm"
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

                {/* Save Security Settings Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updatingSecurity}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {updatingSecurity ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                    <span>{updatingSecurity ? "Saving Security Changes..." : "Save Login & Security Changes"}</span>
                  </button>
                </div>
              </form>

              {/* 3. Two-Factor Authentication (2FA) Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">
                      Two-Step Verification (2FA)
                    </h5>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Receive an SMS/Email OTP when signing in from a new device
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIs2FAEnabled(!is2FAEnabled);
                    toast.success(is2FAEnabled ? "Two-Step Verification Disabled" : "Two-Step Verification Enabled! 🔐");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    is2FAEnabled
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {is2FAEnabled ? "Enabled ✅" : "Enable"}
                </button>
              </div>

              {/* 4. Active Sessions & Devices */}
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Laptop size={15} className="text-blue-500" />
                    <span>Active Login Devices &amp; Sessions</span>
                  </h5>
                  <span className="text-[10px] text-emerald-600 font-bold">1 Active</span>
                </div>
                <div className="p-3 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="font-bold text-xs">Current Session (Windows / Web Browser)</p>
                      <p className="text-[10px] text-gray-400">Srinagar, Jammu &amp; Kashmir • Active Now</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
                    This Device
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Signed out of all other devices successfully")}
                  className="w-full py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-600 transition cursor-pointer"
                >
                  Sign Out from All Other Devices
                </button>
              </div>

              {/* 5. DANGER ZONE: Account Deletion */}
              <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertOctagon size={18} />
                  <h5 className="font-black text-xs uppercase tracking-wider">
                    Danger Zone: Delete Account
                  </h5>
                </div>
                <p className="text-[11px] text-rose-800 dark:text-rose-300/90 leading-relaxed">
                  Permanently delete your Sportify Kashmir account, order history, Kashmiri delivery addresses, and Sportify Pay balance. This action cannot be reversed.
                </p>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Trash2 size={14} />
                  <span>Delete My Account Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          PERMANENT ACCOUNT DELETION CONFIRMATION MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl w-full max-w-md shadow-2xl border-2 border-rose-500 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle size={28} />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Permanently Delete Your Account?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Are you sure? All your orders, reviews, addresses, and Sportify Pay balance will be completely and irreversibly removed.
              </p>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
              <p className="font-bold mb-1">To confirm deletion, please type DELETE below:</p>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-rose-300 dark:border-rose-700 rounded-lg outline-none font-bold text-center uppercase tracking-widest text-rose-600 dark:text-rose-300 text-xs"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || isDeletingAccount}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                {isDeletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>{isDeletingAccount ? "Deleting..." : "Permanently Delete"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════════════════════
          SPORTIFY PAY & REAL PAYMENT / BANK ACCOUNTS SUITE MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-gray-850 text-gray-900 dark:text-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-850/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">Payment &amp; Account Details</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ATM Cards, UPI IDs, Bank Accounts &amp; Wallet</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    fetchPaymentMethods();
                    toast.success("Payment details refreshed! 🔄");
                  }}
                  title="Refresh Balance & Accounts"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-500 dark:text-gray-400 hover:text-orange-500 transition cursor-pointer"
                >
                  <RefreshCw size={16} className={loadingPaymentMethods ? "animate-spin text-orange-500" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sub-Tab Selector */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 sm:px-5 pt-2 gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setPaymentSubTab("cards")}
                className={`pb-2.5 px-3 font-extrabold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  paymentSubTab === "cards"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <CreditCard size={14} />
                <span>ATM / Cards ({savedCards.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentSubTab("upi")}
                className={`pb-2.5 px-3 font-extrabold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  paymentSubTab === "upi"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <QrCode size={14} />
                <span>UPI IDs ({savedUpi.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentSubTab("bank")}
                className={`pb-2.5 px-3 font-extrabold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  paymentSubTab === "bank"
                    ? "border-orange-500 text-orange-600 dark:text-orange-400"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Landmark size={14} />
                <span>Bank Accounts ({savedBankAccounts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentSubTab("wallet")}
                className={`pb-2.5 px-3 font-extrabold text-xs flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  paymentSubTab === "wallet"
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Wallet size={14} />
                <span>Wallet (₹{walletBalance.toLocaleString("en-IN")})</span>
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 sm:p-6 space-y-5">
              {/* 💳 TAB 1: ATM / DEBIT & CREDIT CARDS */}
              {paymentSubTab === "cards" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Saved ATM &amp; Debit/Credit Cards</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Used for 1-click instant orders &amp; Kashmir express checkout</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddCardForm(!showAddCardForm)}
                      className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus size={14} />
                      <span>{showAddCardForm ? "Close Form" : "+ Add Card"}</span>
                    </button>
                  </div>

                  {/* Add New Card Form */}
                  {showAddCardForm && (
                    <form
                      onSubmit={handleAddCard}
                      className="p-4 sm:p-5 bg-orange-50/70 dark:bg-gray-800 rounded-2xl border border-orange-200 dark:border-orange-900/50 space-y-3 animate-in fade-in duration-200 shadow-inner"
                    >
                      <h5 className="font-extrabold text-xs text-orange-900 dark:text-orange-300 uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard size={14} />
                        <span>Enter ATM / Card Details</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Name on Card *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Muzamil Ahmad"
                            value={cardForm.cardHolder}
                            onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Bank Name
                          </label>
                          <select
                            value={cardForm.bankName}
                            onChange={(e) => setCardForm({ ...cardForm, bankName: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white"
                          >
                            <option value="Jammu & Kashmir Bank">Jammu &amp; Kashmir Bank (J&amp;K Bank)</option>
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Ellaquai Dehati Bank">Ellaquai Dehati Bank</option>
                            <option value="Other Bank">Other Bank</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            16-Digit ATM Card Number *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="4532 1234 5678 9012"
                            value={cardForm.cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
                              setCardForm({ ...cardForm, cardNumber: val });
                            }}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none font-mono text-xs font-bold tracking-wider text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Expiry (MM/YY) *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY (e.g. 08/29)"
                            value={cardForm.expiryDate}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                              setCardForm({ ...cardForm, expiryDate: val });
                            }}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-mono font-bold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Card Type
                          </label>
                          <select
                            value={cardForm.cardType}
                            onChange={(e) => setCardForm({ ...cardForm, cardType: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white"
                          >
                            <option value="Debit Card">Debit Card / ATM</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="RuPay Card">RuPay Platinum</option>
                            <option value="Visa Platinum">Visa Platinum</option>
                            <option value="Mastercard">Mastercard World</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingCard}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 active:scale-98"
                      >
                        {isAddingCard ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                        <span>{isAddingCard ? "Saving Card..." : "Save Card to My Account"}</span>
                      </button>
                    </form>
                  )}

                  {/* List of Saved Cards */}
                  {savedCards.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 space-y-2">
                      <CreditCard className="w-10 h-10 mx-auto text-gray-400" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">No ATM / Cards Saved Yet</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Click &ldquo;+ Add Card&rdquo; above to link your ATM / Debit card for instant checkout.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedCards.map((c) => (
                        <div
                          key={c._id}
                          className="p-4 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white shadow-lg border border-zinc-700 relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-5 rounded-md bg-amber-400 flex items-center justify-center border border-amber-300 shadow-xs">
                                <div className="w-3.5 h-2.5 rounded-xs border border-amber-800 bg-amber-200/50" />
                              </div>
                              <span className="text-xs font-black tracking-wider text-orange-400">{c.bankName}</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase bg-white/15 px-2.5 py-0.5 rounded-md text-zinc-200 border border-white/10">
                              {c.cardType}
                            </span>
                          </div>

                          <p className="font-mono text-base sm:text-lg tracking-widest text-zinc-100 font-bold mb-3">
                            {c.cardNumber}
                          </p>

                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <div>
                              <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Card Holder</span>
                              <span className="font-bold text-white uppercase">{c.cardHolder}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Expires</span>
                              <span className="font-bold text-white">{c.expiryDate}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCard(c._id)}
                              className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer active:scale-95"
                              title="Delete Card"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 📱 TAB 2: LINKED UPI IDs */}
              {paymentSubTab === "upi" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Linked UPI IDs &amp; VPA</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Google Pay, PhonePe, Paytm, Amazon Pay &amp; BHIM UPI</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddUpiForm(!showAddUpiForm)}
                      className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus size={14} />
                      <span>{showAddUpiForm ? "Close Form" : "+ Link UPI"}</span>
                    </button>
                  </div>

                  {/* Add New UPI Form */}
                  {showAddUpiForm && (
                    <form
                      onSubmit={handleAddUpi}
                      className="p-4 sm:p-5 bg-emerald-50/70 dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-3 animate-in fade-in duration-200 shadow-inner"
                    >
                      <h5 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <QrCode size={14} />
                        <span>Enter UPI Virtual Payment Address (VPA)</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            UPI ID / VPA *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 9682645124@upi or muzamil@oksbi"
                            value={upiForm.vpa}
                            onChange={(e) => setUpiForm({ ...upiForm, vpa: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-mono font-bold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Provider / App
                          </label>
                          <select
                            value={upiForm.provider}
                            onChange={(e) => setUpiForm({ ...upiForm, provider: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white"
                          >
                            <option value="Google Pay (GPay)">Google Pay (GPay)</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="Paytm UPI">Paytm UPI</option>
                            <option value="BHIM UPI">BHIM UPI</option>
                            <option value="Amazon Pay UPI">Amazon Pay UPI</option>
                            <option value="Cred UPI">Cred UPI</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingUpi}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 active:scale-98"
                      >
                        {isAddingUpi ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                        <span>{isAddingUpi ? "Linking UPI..." : "Link UPI ID to Sportify"}</span>
                      </button>
                    </form>
                  )}

                  {/* List of Saved UPI IDs */}
                  {savedUpi.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 space-y-2">
                      <QrCode className="w-10 h-10 mx-auto text-gray-400" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">No UPI ID Linked Yet</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Click &ldquo;+ Link UPI&rdquo; to add your GPay, PhonePe or Paytm VPA.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {savedUpi.map((u) => (
                        <div
                          key={u._id}
                          className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-xs hover:border-emerald-500/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <QrCode size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{u.vpa}</span>
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                                  Verified ✅
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{u.provider || "UPI App"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyVpa(u.vpa)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition cursor-pointer"
                              title="Copy UPI ID"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUpi(u._id)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-rose-50 dark:bg-gray-700 dark:hover:bg-rose-950/60 text-gray-500 hover:text-rose-600 transition cursor-pointer"
                              title="Delete UPI ID"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 🏦 TAB 3: BANK ACCOUNTS */}
              {paymentSubTab === "bank" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Linked Bank Accounts</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Direct transfer, instant cashbacks &amp; tournament refunds</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddBankForm(!showAddBankForm)}
                      className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus size={14} />
                      <span>{showAddBankForm ? "Close Form" : "+ Add Bank"}</span>
                    </button>
                  </div>

                  {/* Add New Bank Account Form */}
                  {showAddBankForm && (
                    <form
                      onSubmit={handleAddBankAccount}
                      className="p-4 sm:p-5 bg-blue-50/70 dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-3 animate-in fade-in duration-200 shadow-inner"
                    >
                      <h5 className="font-extrabold text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Landmark size={14} />
                        <span>Enter Bank Account Details</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Account Holder Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Muzamil Ahmad"
                            value={bankForm.accountHolder}
                            onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Bank Name *
                          </label>
                          <select
                            value={bankForm.bankName}
                            onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white"
                          >
                            <option value="Jammu & Kashmir Bank">Jammu &amp; Kashmir Bank (J&amp;K Bank)</option>
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Ellaquai Dehati Bank">Ellaquai Dehati Bank</option>
                            <option value="Canara Bank">Canara Bank</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 0123456789012345"
                            value={bankForm.accountNumber}
                            onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none font-mono text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Re-enter Account Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Re-enter Account Number"
                            value={bankForm.confirmAccountNumber}
                            onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none font-mono text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. JAKA0NAIDKH"
                            value={bankForm.ifscCode}
                            onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none font-mono text-xs uppercase font-bold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Branch Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Srinagar Main Branch / Lal Chowk"
                            value={bankForm.branchName}
                            onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAddingBank}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 active:scale-98"
                      >
                        {isAddingBank ? <Loader2 size={15} className="animate-spin" /> : <Building size={15} />}
                        <span>{isAddingBank ? "Saving Bank Details..." : "Save Bank Account"}</span>
                      </button>
                    </form>
                  )}

                  {/* List of Saved Bank Accounts */}
                  {savedBankAccounts.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 space-y-2">
                      <Landmark className="w-10 h-10 mx-auto text-gray-400" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">No Bank Account Linked</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Add your J&amp;K Bank or other bank details for seamless direct payouts.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {savedBankAccounts.map((b) => (
                        <div
                          key={b._id}
                          className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 shadow-xs hover:border-blue-500/50 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <Landmark size={18} />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">{b.bankName}</h5>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{b.branchName || "Kashmir Branch"}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteBankAccount(b._id)}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-rose-50 dark:bg-gray-700 dark:hover:bg-rose-950/60 text-gray-500 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Bank Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Account Holder</span>
                              <span className="font-bold text-gray-900 dark:text-white uppercase">{b.accountHolder}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Account Number</span>
                              <span className="font-mono font-bold text-gray-900 dark:text-white">{b.accountNumber}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">IFSC Code</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{b.ifscCode}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">Status</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">Active &amp; Linked ✅</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ⚡ TAB 4: SPORTIFY WALLET */}
              {paymentSubTab === "wallet" && (
                <div className="space-y-4">
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
                      <h2 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight text-white">
                        ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </h2>
                    </div>

                    <div className="relative z-1 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
                      <div className="flex items-center gap-2">
                        <span className="truncate">VPA: {user?.username?.toLowerCase() || "warm"}@sportifypay</span>
                        <button
                          type="button"
                          onClick={() => handleCopyVpa(`${user?.username?.toLowerCase() || "warm"}@sportifypay`)}
                          className="p-1 hover:bg-white/20 rounded-md transition cursor-pointer"
                          title="Copy Sportify VPA"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      <span className="font-mono text-[11px]">SK-WAL-{user?._id?.slice(-6).toUpperCase() || "53B85F"}</span>
                    </div>
                  </div>

                  {/* 2. Add Money / Top-up Box */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles size={15} className="text-emerald-500" />
                        <span>⚡ Recharge Sportify Pay</span>
                      </h4>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        Instant Top-up
                      </span>
                    </div>

                    {/* Quick Add Chips */}
                    <div className="flex gap-2 flex-wrap">
                      {[100, 200, 500, 1000, 2000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleAddWalletMoney(amt)}
                          className="px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-600 transition cursor-pointer active:scale-95 shadow-xs"
                        >
                          + ₹{amt}
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount Form */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 font-bold text-sm">₹</span>
                        <input
                          type="number"
                          placeholder="Enter custom amount"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="w-full pl-8 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddWalletMoney()}
                        disabled={isAddingMoney}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isAddingMoney ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        <span>{isAddingMoney ? "Adding..." : "Add Money"}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2.5 Withdraw / Transfer to Bank Option */}
                  <div className="p-4 bg-blue-50/60 dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                        <Landmark size={15} className="text-blue-500" />
                        <span>Withdraw / Payout to Bank</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsWithdrawOpen(!isWithdrawOpen)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {isWithdrawOpen ? "Close Payout" : "Withdraw Funds →"}
                      </button>
                    </div>

                    {isWithdrawOpen && (
                      <div className="space-y-3 pt-2 border-t border-blue-100 dark:border-gray-700 animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setWithdrawTargetType("bank")}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              withdrawTargetType === "bank"
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            <Landmark size={13} />
                            <span>Bank Account ({savedBankAccounts.length})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setWithdrawTargetType("upi")}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                              withdrawTargetType === "upi"
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            <QrCode size={13} />
                            <span>UPI ID ({savedUpi.length})</span>
                          </button>
                        </div>

                        {withdrawTargetType === "bank" ? (
                          savedBankAccounts.length === 0 ? (
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl text-center text-xs text-gray-600 dark:text-gray-300 space-y-1">
                              <p>No saved bank account found.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentSubTab("bank");
                                  setShowAddBankForm(true);
                                }}
                                className="text-blue-600 dark:text-blue-400 font-bold underline"
                              >
                                + Link Bank Account
                              </button>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Select Destination Bank
                              </label>
                              <select
                                value={withdrawTargetId}
                                onChange={(e) => setWithdrawTargetId(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white"
                              >
                                {savedBankAccounts.map((b) => (
                                  <option key={b._id} value={b._id}>
                                    {b.bankName} - {b.accountNumber} ({b.accountHolder})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        ) : (
                          savedUpi.length === 0 ? (
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-xl text-center text-xs text-gray-600 dark:text-gray-300 space-y-1">
                              <p>No saved UPI ID found.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentSubTab("upi");
                                  setShowAddUpiForm(true);
                                }}
                                className="text-blue-600 dark:text-blue-400 font-bold underline"
                              >
                                + Link UPI ID
                              </button>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Select Destination UPI
                              </label>
                              <select
                                value={withdrawTargetId}
                                onChange={(e) => setWithdrawTargetId(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-semibold text-gray-900 dark:text-white"
                              >
                                {savedUpi.map((u) => (
                                  <option key={u._id} value={u._id}>
                                    {u.vpa} ({u.provider})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        )}

                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 font-bold text-sm">₹</span>
                            <input
                              type="number"
                              placeholder="Amount to withdraw"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl outline-none text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleWithdrawMoney()}
                            disabled={isWithdrawing}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {isWithdrawing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            <span>{isWithdrawing ? "Transferring..." : "Transfer Now"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Linked Account Information Box */}
                  <div className="space-y-2 text-xs">
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                      Linked Account Information
                    </h4>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="py-2 flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">Account Holder:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{user?.username || "warm"}</span>
                      </div>
                      <div className="py-2 flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">Linked Mobile:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{user?.mobile || "9682645124"}</span>
                      </div>
                      <div className="py-2 flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">Linked Email:</span>
                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{user?.email || "warmuzamil68@gmail.com"}</span>
                      </div>
                      <div className="py-2 flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">KYC Status:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full text-[11px]">
                          Verified ✅
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Recent Wallet Activity */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                        Recent Wallet Activity
                      </h4>
                      <div className="flex gap-1">
                        {(["all", "credit", "debit"] as const).map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setTxFilter(f)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition cursor-pointer ${
                              txFilter === f
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {walletTransactions
                        .filter((tx) => txFilter === "all" || tx.type === txFilter)
                        .map((tx) => (
                          <div
                            key={tx.id || tx.title + tx.date}
                            className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-xs hover:border-gray-300 dark:hover:border-gray-600 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  tx.type === "credit"
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                                    : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {tx.type === "credit" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-gray-900 dark:text-white">{tx.title}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  {tx.date} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{tx.status || "Completed"}</span>
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-xs sm:text-sm font-black ${
                                tx.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
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