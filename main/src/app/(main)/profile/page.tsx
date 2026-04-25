"use client";

import { Camera, Heart, LogOut, Mail, MapPin, Phone, Settings, ShoppingBag, User, ChevronRight, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
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

  // ✅ Get image URL - Use live backend URL
  const getImageUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // ✅ Use live API URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      console.log("Profile response:", result);
      
      if (result.payload) {
        setUser(result.payload);
        setEditForm({
          username: result.payload.username || "",
          email: result.payload.email || "",
          mobile: result.payload.mobile || "",
        });
      } else {
        window.location.href = "/login";
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
        window.location.href = "/login";
        return;
      }

      const formData = new FormData();
      formData.append("username", editForm.username);
      formData.append("email", editForm.email);
      if (editForm.mobile) formData.append("mobile", editForm.mobile);
      if (selectedProfilePic) {
        formData.append("profilePic", selectedProfilePic);
      }

      // ✅ Use live API URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/edit/user`, {
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

  const profileImageUrl = getImageUrl(user?.profilePic);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-4">Please login to view your profile</p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
            Login here
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Profile Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl border-4 border-white/30">
                  {profileImageUrl && !imageError ? (
                    <img
                      src={profileImageUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <User className="w-14 h-14 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2 cursor-pointer hover:bg-orange-600 transition shadow-lg">
                    <Camera size={16} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                  </label>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{user.username}</h1>
                <div className="space-y-1">
                  <p className="text-blue-100 flex items-center justify-center md:justify-start gap-2">
                    <Mail size={16} /> {user.email}
                  </p>
                  {user.mobile && (
                    <p className="text-blue-100 flex items-center justify-center md:justify-start gap-2">
                      <Phone size={16} /> {user.mobile}
                    </p>
                  )}
                </div>
                {user.isAdmin && (
                  <div className="mt-3 inline-block bg-yellow-400/20 text-yellow-200 text-xs px-3 py-1 rounded-full font-semibold">
                    ⭐ Admin
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur rounded-2xl shadow-lg mb-8 border border-white/10">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "orders", label: "My Orders", icon: ShoppingBag },
              { id: "addresses", label: "Addresses", icon: MapPin },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 border-b-2 border-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur rounded-2xl shadow-lg border border-white/10 p-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4">Account Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                      <User size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={20} className="text-purple-300" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Account Type</p>
                      <p className="text-white font-semibold">{user.isAdmin ? "Admin" : "Customer"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/orders" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <span className="text-gray-300 group-hover:text-white">View Orders</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                  </Link>
                  <Link href="/cart" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <span className="text-gray-300 group-hover:text-white">My Cart</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                  </Link>
                  <Link href="/address" className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                    <span className="text-gray-300 group-hover:text-white">Addresses</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-white/10">
                <h3 className="text-white font-bold text-lg mb-4">Profile Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">User ID</p>
                    <p className="text-white font-mono text-xs mt-1">{user._id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="text-green-400 font-semibold mt-1">✓ Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
              
              {!isEditing ? (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-gray-400 text-sm mb-2">Username</p>
                        <p className="text-white text-lg font-semibold">{user.username}</p>
                      </div>
                      <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-gray-400 text-sm mb-2">Email</p>
                        <p className="text-white text-lg font-semibold">{user.email}</p>
                      </div>
                      <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-gray-400 text-sm mb-2">Mobile</p>
                        <p className="text-white text-lg font-semibold">{user.mobile || "Not provided"}</p>
                      </div>
                      <div className="p-4 bg-white/10 rounded-xl">
                        <p className="text-gray-400 text-sm mb-2">Account Type</p>
                        <p className="text-white text-lg font-semibold">{user.isAdmin ? "Admin" : "Customer"}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button onClick={handleEditClick} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-6">Edit Profile</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={editForm.mobile}
                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>

                    {previewUrl && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">New Profile Picture Preview</label>
                        <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-orange-500" />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveChanges}
                        disabled={updatingProfile}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {updatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check size={20} />}
                        {updatingProfile ? "Saving..." : "Save Changes"}
                      </button>
                      <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 rounded-lg font-bold transition-all">
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
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Order History</h3>
              <p className="text-gray-400 mb-6">Check all your orders in the full order page</p>
              <Link href="/orders" className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-bold transition-all">
                View All Orders
              </Link>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Address Book</h3>
              <p className="text-gray-400 mb-6">Manage your delivery addresses</p>
              <Link href="/address" className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-bold transition-all">
                Manage Addresses
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}