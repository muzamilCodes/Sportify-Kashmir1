"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Package,
  Percent,
  Truck,
  ShieldCheck,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  Award,
  Sparkles,
  ChevronRight,
  FileText,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const BULK_TIERS = [
  {
    range: "10 – 25 Items",
    discount: "10% OFF",
    perks: ["GST Tax Invoice", "Standard 3-day Delivery", "Free Bat Gripping"],
    color: "from-blue-500 to-indigo-600",
    badge: "Starter Academy",
  },
  {
    range: "26 – 50 Items",
    discount: "18% OFF",
    perks: ["Priority WhatsApp Support", "Free Knocking & Oiling", "Custom Name Printing", "Free Delivery across Kashmir"],
    color: "from-orange-500 to-red-600",
    badge: "Most Popular",
    featured: true,
  },
  {
    range: "50+ Bulk Units",
    discount: "25% - 30% OFF",
    perks: ["Wholesale Factory Pricing", "Custom Club Logo Printing", "Direct Srinagar Warehouse Dispatch", "Flexible Institutional Credit"],
    color: "from-purple-600 to-pink-600",
    badge: "Institutions & Clubs",
  },
];

const WHOLESALE_CATEGORIES = [
  { name: "Kashmir Willow Bat Crates", desc: "Batch of 10, 25, 50 Handcrafted Kashmiri Willow bats for academies", icon: "🏏" },
  { name: "Match & Practice Leather Balls", desc: "Boxes of 12 / 24 four-piece alum tanned & club practice balls", icon: "🔴" },
  { name: "Complete Team Cricket Kits", desc: "Full team kits with bats, pads, gloves, helmets & wheelie bags", icon: "🎒" },
  { name: "Football Tournament Sets", desc: "FIFA standard balls, cones, agility ladders, bibs & goal nets", icon: "⚽" },
  { name: "Custom Team Jerseys & Wear", desc: "Sublimation printed club uniforms with team names and sponsor logos", icon: "🎽" },
  { name: "Tournament Trophies & Medals", desc: "Custom engraved championship cups, shields and gold/silver medals", icon: "🏆" },
];

export default function WholesalePage() {
  const [form, setForm] = useState({
    name: "",
    orgName: "",
    orgType: "Academy",
    phone: "",
    email: "",
    district: "Srinagar",
    requirements: "",
    quantity: "25-50",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.requirements) {
      toast.error("Please fill in your name, phone number, and requirements");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Wholesale inquiry received! Our Srinagar team will contact you within 2 hours.");
      
      // Auto open WhatsApp for fast direct confirmation
      const msg = `Hello Sportify Kashmir Wholesale Team,\nI would like a bulk quotation:\n• Name: ${form.name}\n• Organization: ${form.orgName} (${form.orgType})\n• Phone: ${form.phone}\n• District: ${form.district}\n• Quantity: ${form.quantity}\n• Items: ${form.requirements}`;
      const url = `https://wa.me/919682645127?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");

      setForm({
        name: "",
        orgName: "",
        orgType: "Academy",
        phone: "",
        email: "",
        district: "Srinagar",
        requirements: "",
        quantity: "25-50",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* ─── Hero Header ─── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-850 to-orange-950 text-white rounded-3xl p-6 sm:p-12 shadow-xl border border-gray-750">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 size={14} />
              <span>B2B Institutional & Academy Wholesale Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Equip Your Sports Academy with <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Direct Factory Wholesale</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
              Specialized procurement for schools, colleges, cricket academies, and sports clubs across Jammu & Kashmir. Get genuine handcrafted Kashmiri willow, match footballs, and custom uniforms with full GST invoicing.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#inquiry"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl text-sm shadow-lg transition"
              >
                Request Fast Bulk Quote
              </a>
              <a
                href="https://wa.me/919682645127?text=Hello%20Sportify%20Kashmir,%20I%20want%20to%20inquire%20about%20academy%20wholesale%20rates"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg transition"
              >
                <MessageSquare size={16} />
                <span>WhatsApp Wholesale Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* ─── Wholesale Discount Tiers ─── */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Transparent Bulk Pricing Tiers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Higher the quantity, greater the savings for your club or school
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BULK_TIERS.map((tier) => (
              <div
                key={tier.range}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-7 border ${
                  tier.featured
                    ? "border-orange-500 ring-2 ring-orange-500/20 shadow-xl"
                    : "border-gray-200 dark:border-gray-700 shadow-sm"
                } flex flex-col justify-between`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    {tier.badge}
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {tier.range}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-2 mb-4">
                    {tier.discount}
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {tier.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="#inquiry"
                  className={`mt-6 w-full py-2.5 text-center font-bold text-xs sm:text-sm rounded-xl transition ${
                    tier.featured
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:from-orange-600 hover:to-red-600"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                  }`}
                >
                  Choose {tier.range}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Wholesale Categories ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Popular Bulk Packages for Kashmiri Clubs
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customized combinations ready for immediate dispatch from our Srinagar warehouse
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {WHOLESALE_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-orange-500/50 transition group"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-orange-600 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Inquiry Form & Direct Contact ─── */}
        <div id="inquiry" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              Request a Fast Institutional Quotation
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Fill out your requirements below. Our wholesale manager will respond with an official quotation within 2 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muzamil Ahmad"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Academy / School / Club Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kashmir Cricket Academy"
                    value={form.orgName}
                    onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 96826 45127"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Kashmir District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {["Srinagar", "Anantnag", "Baramulla", "Pulwama", "Budgam", "Kupwara", "Shopian", "Kulgam", "Ganderbal", "Bandipora", "Jammu"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Estimated Quantity Required</label>
                <select
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="10-25">10 – 25 Items (Tier 1 Discount)</option>
                  <option value="26-50">26 – 50 Items (Tier 2 Discount)</option>
                  <option value="50-100">50 – 100 Items (Wholesale Factory Rate)</option>
                  <option value="100+">100+ Institutional Full Season Supply</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Items & Special Requirements *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please list the items (e.g. 20 Kashmir Willow bats, 12 Leather balls, 15 Custom football jerseys with size breakdown)..."
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Submit Wholesale Inquiry</span>
              </button>
            </form>
          </div>

          {/* Direct Contact & Support Details */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" />
                <span>Why Partner With Sportify Kashmir?</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <span><strong>100% Genuine Handcrafted Willow:</strong> Direct from Sangam & Halmulla bat clusters without middlemen markup.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <span><strong>GST Compliant Invoicing:</strong> Official bills for educational institutions, sports trusts & government tenders.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <span><strong>24-48h Delivery:</strong> Free dedicated vehicle dispatch across all 10 Kashmir districts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <span><strong>Free Bat Knocking:</strong> Every wholesale bat is professionally machine-knocked and oiled before delivery.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-750 rounded-3xl p-6 border border-orange-200 dark:border-gray-700 space-y-3">
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                Need Immediate Help?
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Speak directly with our Srinagar wholesale procurement lead:
              </p>
              <div className="space-y-2 pt-1 text-xs sm:text-sm font-semibold">
                <a
                  href="tel:+919682645127"
                  className="flex items-center gap-2.5 p-3 bg-white dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white hover:text-orange-600 transition"
                >
                  <Phone size={16} className="text-orange-500" />
                  <span>+91 96826 45127</span>
                </a>
                <a
                  href="mailto:wholesale@sportifykashmir.com"
                  className="flex items-center gap-2.5 p-3 bg-white dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white hover:text-orange-600 transition"
                >
                  <Mail size={16} className="text-orange-500" />
                  <span>wholesale@sportifykashmir.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
