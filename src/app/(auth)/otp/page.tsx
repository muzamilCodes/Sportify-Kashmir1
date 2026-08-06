"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("verifyEmail");
    if (!stored) {
      toast.error("Session expired. Please register again.");
      router.push("/register");
    } else {
      setEmail(stored);
      console.log("Verifying OTP for email:", stored);
    }
  }, []);

  const handleVerify = async () => {
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: cleanOtp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.removeItem("verifyEmail");
        toast.success("Verified successfully!");
        router.push("/");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/user/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) toast.success("OTP resent!");
      else toast.error(data.message);
    } catch (error) {
      toast.error("Failed to resend");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6 text-white">
            <div className="flex items-center justify-center gap-3">
              <Mail className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Verify OTP</h1>
            </div>
            <p className="text-center text-orange-100 mt-2">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Email display */}
            <div className="text-center mb-6">
              <p className="text-gray-600">We've sent a code to</p>
              <p className="font-semibold text-gray-800 text-lg mt-1">{email}</p>
            </div>

            {/* Spam Warning */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Email not received?</p>
                <p className="mt-1">
                  Check your <strong> Email Spam / Junk folder</strong>. Sometimes emails land there.
                </p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full text-center text-3xl tracking-[0.5em] p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                autoFocus
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify OTP
                </>
              )}
            </button>

            {/* Resend */}
            <div className="text-center mt-6">
              <button
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
              >
                Didn't receive OTP? Click here to resend
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-500 text-xs mt-6">
          The OTP is valid for 10 minutes. For security, never share it with anyone.
        </p>
      </div>
    </div>
  );
}