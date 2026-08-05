"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, LogIn, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        toast.success("Login successful!");
        
        if (result.user.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500 to-red-500 rounded-2xl shadow-xl shadow-orange-500/20 mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500">Login to your Sportify Kashmir account</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/5 p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-400 font-medium"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-400 font-medium"
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl text-white font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 overflow-hidden transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -ml-20 group-hover:animate-shine"></div>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 relative z-10">
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 font-medium">
              Don't have an account?{" "}
              <Link href="/register" className="text-orange-600 hover:text-orange-700 font-bold hover:underline transition-all">
                Create one now
              </Link>
            </p>
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