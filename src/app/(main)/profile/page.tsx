"use client";

import { Camera, Heart, LogOut, Mail, MapPin, Phone, Settings, ShoppingBag, User, ChevronRight, Check, X, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  profilePic?: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    mobile: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // ✅ Get image URL
  const getImageUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return `${API_URL}/uploads/${url}`;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
      console.error("Error:", error);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email,
        mobile: user.mobile || "",
      });
    }
    setSelectedProfilePic(null);
    setPreviewUrl(null);
    setImageError(false);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all your data.")) return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await fetch(`${API_URL}/user/account/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
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
    } catch(err) {
      toast.error("Network error");
    }
  };

  const profileImageUrl = getImageUrl(user?.profilePic);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border">
          <p className="text-gray-600 text-lg mb-4">Please login to view your profile</p>
          <Link href="/login" className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
            Login here
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Profile Card */}
        <div className="glass rounded-3xl p-8 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-brand rounded-full blur-3xl opacity-20 -mr-20 -mt-20 group-hover:opacity-30 transition-opacity duration-700"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-3xl opacity-20 -ml-20 -mb-20 group-hover:opacity-30 transition-opacity duration-700"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shadow-md border-4 border-white">
                  {profileImageUrl && !imageError ? (
                    <img
                      src={profileImageUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-orange-500 rounded-full p-2.5 cursor-pointer hover:bg-orange-600 transition shadow-lg border-2 border-white">
                    <Camera size={18} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                  </label>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{user.username}</h1>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 font-medium">
                    <Mail size={16} className="text-orange-500" /> {user.email}
                  </p>
                  {user.mobile && (
                    <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 font-medium">
                      <Phone size={16} className="text-orange-500" /> {user.mobile}
                    </p>
                  )}
                </div>
                {user.isAdmin && (
                  <div className="mt-4 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wide">
                    ⭐ Admin
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl font-bold transition-all duration-300 shadow-sm hover-lift"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-8 border border-gray-100 p-2">
          <div className="flex overflow-x-auto gap-2">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "orders", label: "My Orders", icon: ShoppingBag },
              { id: "addresses", label: "Addresses", icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-orange-200 transition-colors">
                <h3 className="text-gray-900 font-bold text-lg mb-4">Account Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                      <User size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Member Since</p>
                      <p className="text-gray-900 font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100">
                      <ShoppingBag size={24} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Account Type</p>
                      <p className="text-gray-900 font-bold">{user.isAdmin ? "Admin" : "Customer"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-orange-200 transition-colors">
                <h3 className="text-gray-900 font-bold text-lg mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/orders" className="flex items-center justify-between p-3.5 bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm rounded-xl transition-all group">
                    <span className="text-gray-700 font-semibold group-hover:text-orange-600">View Orders</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500" />
                  </Link>
                  <Link href="/cart" className="flex items-center justify-between p-3.5 bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm rounded-xl transition-all group">
                    <span className="text-gray-700 font-semibold group-hover:text-orange-600">My Cart</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500" />
                  </Link>
                  <Link href="/address" className="flex items-center justify-between p-3.5 bg-white border border-gray-100 hover:border-orange-200 hover:shadow-sm rounded-xl transition-all group">
                    <span className="text-gray-700 font-semibold group-hover:text-orange-600">Addresses</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500" />
                  </Link>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-orange-200 transition-colors">
                <h3 className="text-gray-900 font-bold text-lg mb-4">Profile Status</h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">User ID</p>
                    <p className="text-gray-900 font-mono text-sm mt-1 font-bold">{user._id}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <p className="text-gray-500 text-sm font-medium">Status</p>
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Account Settings</h2>
              
              {!isEditing ? (
                <div className="space-y-8">
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                      <button onClick={handleEditClick} className="px-5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-lg font-bold transition-all">
                        Edit Profile
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Username</p>
                        <p className="text-gray-900 text-lg font-bold">{user.username}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Email</p>
                        <p className="text-gray-900 text-lg font-bold">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Mobile</p>
                        <p className="text-gray-900 text-lg font-bold">{user.mobile || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
                    <h3 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h3>
                    <p className="text-red-600/80 mb-6 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-6 py-3 bg-white border-2 border-red-200 hover:border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                      <AlertTriangle size={18} />
                      Delete Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-8">Edit Personal Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                      />
                    </div>

                    {previewUrl && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-3">New Profile Picture Preview</label>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                      <button
                        onClick={handleSaveChanges}
                        disabled={updatingProfile}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                      >
                        {updatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} />}
                        {updatingProfile ? "Saving..." : "Save Changes"}
                      </button>
                      <button 
                        onClick={handleCancel} 
                        className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-all"
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <ShoppingBag className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Order History</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Track your packages, write reviews, or view invoice details in the orders page.</p>
              <Link href="/orders" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                View All Orders
                <ChevronRight size={18} />
              </Link>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-24 h-24 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <MapPin className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Address Book</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Manage your delivery addresses for faster and smoother checkout experiences.</p>
              <Link href="/address" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                Manage Addresses
                <ChevronRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}