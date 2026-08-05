"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("resetEmail");
    if (!stored) {
      toast.error("Session expired. Please request OTP again.");
      router.push("/forgot-password");
    } else {
      setEmail(stored);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const verifyRes = await fetch(`${apiUrl}/user/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        toast.error(verifyData.message || "Invalid OTP");
        setLoading(false);
        return;
      }
      const resetRes = await fetch(`${apiUrl}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const resetData = await resetRes.json();
      if (resetData.success) {
        localStorage.removeItem("resetEmail");
        toast.success("Password reset successfully! Please login.");
        router.push("/login");
      } else {
        toast.error(resetData.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10 my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl shadow-xl shadow-orange-500/20 mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Set New Password</h1>
          <p className="text-gray-500">Secure your Sportify Kashmir account</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 p-8 border border-white/50">
          <div className="mb-6">
            <p className="text-gray-600 text-center text-sm">
              We've sent a 6-digit OTP to <strong className="text-gray-900">{email}</strong>
            </p>
          </div>

          <div className="mb-6 p-4 bg-orange-50/50 backdrop-blur border border-orange-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">Email not received?</p>
              <p className="opacity-90">Please check your <strong>Spam / Junk folder</strong>. Sometimes emails land there.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                className="w-full text-center text-2xl tracking-widest py-3 border border-gray-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-300 font-bold"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••• (min 6 characters)"
                  className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-400 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-white font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 overflow-hidden transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 mt-2"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -ml-20 group-hover:animate-shine"></div>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Resetting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 relative z-10">
                  <span>Reset Password</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shine {
          100% { transform: translateX(100%) skewX(-12deg); }
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}