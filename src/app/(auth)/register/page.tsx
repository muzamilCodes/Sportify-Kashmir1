"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Sparkles,
  ArrowRight,
  Camera,
  Upload,
  X,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Profile image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (PNG, JPG, WEBP)");
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const cleanApiUrl = apiUrl.replace(/\/$/, "");

      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username.trim());
      formDataToSend.append("email", formData.email.trim().toLowerCase());
      formDataToSend.append("mobile", cleanMobile);
      formDataToSend.append("password", formData.password);
      if (profilePicture) {
        formDataToSend.append("profilePicture", profilePicture);
        formDataToSend.append("profilePic", profilePicture);
      }

      const response = await fetch(`${cleanApiUrl}/user/register`, {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("verifyEmail", formData.email.trim().toLowerCase());
        if (result.otpSent === false) {
          toast.error(result.message || "OTP email failed to send. Click Resend OTP on the next screen.");
        } else {
          toast.success(result.message || "OTP sent! Please verify your email to complete registration.");
        }
        router.push("/otp");
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration submit error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-gray-850 dark:to-orange-950/40">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 dark:bg-orange-600 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-300 dark:bg-red-600 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md my-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Create Sportify Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Join Kashmir&apos;s #1 Sports &amp; Handcrafted Willow Hub
          </p>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-7 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ─── Profile Picture Upload Section (Always Visible & Prominent) ─── */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-750/80 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-500 transition">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  {previewUrl ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 shadow-md">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition cursor-pointer"
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex flex-col items-center justify-center border-2 border-gray-300 dark:border-gray-600 text-gray-400 hover:text-orange-500 hover:border-orange-500 transition cursor-pointer shadow-xs"
                    >
                      <Camera size={22} />
                      <span className="text-[9px] font-bold mt-0.5">+ Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
                      Profile Picture
                    </span>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                      (Optional)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                    Add your photo for personalized delivery &amp; account avatar
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={12} />
                    <span>{previewUrl ? "Change Photo" : "Upload Avatar"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="username"
                required
                placeholder="Full Name / Username *"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                required
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            {/* Mobile Phone */}
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                name="mobile"
                required
                placeholder="Mobile Number (10 digits) *"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="new-password"
                placeholder="Password * (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm text-gray-900 dark:text-white outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-[11px] text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link href="/terms" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Already have an account?
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full border border-orange-500 text-orange-600 dark:text-orange-400 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-orange-50 dark:hover:bg-orange-950/30 transition cursor-pointer"
          >
            Login Instead
          </button>
        </div>
      </div>
    </div>
  );
}
