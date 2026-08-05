"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("verifyEmail");
    if (!stored) {
      toast.error("Session expired. Please register again.");
      router.push("/register");
    } else {
      setEmail(stored);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const verifyRes = await fetch(`${apiUrl}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const verifyData = await verifyRes.json();
      
      if (verifyData.success) {
        localStorage.removeItem("verifyEmail");
        toast.success("Account verified successfully! Please login.");
        router.push("/login");
      } else {
        toast.error(verifyData.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const resendRes = await fetch(`${apiUrl}/user/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const resendData = await resendRes.json();
      
      if (resendData.success) {
        toast.success("OTP resent successfully!");
      } else {
        toast.error(resendData.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">Verify Your Email</h1>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-center mb-4">
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>

            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Email not received?</p>
                <p>Please check your <strong>Spam / Junk folder</strong>. Sometimes emails land there.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-full text-center text-2xl tracking-widest p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Account"}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-orange-500 font-semibold hover:underline disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
