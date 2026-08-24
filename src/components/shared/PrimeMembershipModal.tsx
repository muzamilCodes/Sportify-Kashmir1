"use client";

import { 
  Zap, 
  ShieldCheck, 
  Percent, 
  Truck, 
  X, 
  CheckCircle2, 
  Sparkles,
  Award
} from "lucide-react";
import toast from "react-hot-toast";

interface PrimeMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrimeMembershipModal({ isOpen, onClose }: PrimeMembershipModalProps) {
  if (!isOpen) return null;

  const benefits = [
    {
      icon: <Truck className="text-amber-500" size={20} />,
      title: "FREE Express Delivery",
      desc: "Guaranteed 24-48 hr fast shipping across Srinagar & Kashmir Valley.",
    },
    {
      icon: <Percent className="text-emerald-500" size={20} />,
      title: "5% Sportify Wallet Cashback",
      desc: "Automatic instant cashback credited to your wallet on every single purchase.",
    },
    {
      icon: <Sparkles className="text-sky-500" size={20} />,
      title: "Early Access to Flash Sales",
      desc: "Access blockbuster season sales 24 hours before everyone else.",
    },
    {
      icon: <ShieldCheck className="text-purple-500" size={20} />,
      title: "Extended 1-Year Warranty",
      desc: "Free replacement guarantee on Willow handles, gym pulley cables & seams.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition z-10"
        >
          <X size={18} />
        </button>

        {/* Top Prime Banner */}
        <div className="bg-gradient-to-r from-[#002f36] via-[#005f73] to-[#0a9396] text-white p-6 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#00a8e1] text-white text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              Prime Member
            </span>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <Zap size={14} /> Kashmir VIP
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight leading-tight">
            sportify <span className="text-[#00a8e1]">prime</span>
          </h2>
          <p className="text-xs text-cyan-100 mt-1">
            Unlimited Free Delivery, Exclusive Member Discounts & Wallet Cashback
          </p>
        </div>

        {/* Prime Benefits List */}
        <div className="p-5 space-y-3.5">
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-xs shrink-0">
                {b.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  {b.title}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Pricing & CTA */}
          <div className="pt-2">
            <button
              onClick={() => {
                toast.success("Welcome to Sportify Prime! 30-Day Free Trial activated.");
                onClose();
              }}
              className="w-full py-3 bg-[#00a8e1] hover:bg-[#0092c7] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
            >
              <span>Start 30-Day Free Trial</span>
              <span className="text-[11px] font-normal opacity-90">(Then ₹499/year)</span>
            </button>
            <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-2">
              Cancel anytime with 1 click in your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
