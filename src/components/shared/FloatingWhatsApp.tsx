"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";

const WHATSAPP_NUMBER = "919682645127"; // Sportify Kashmir WhatsApp support number

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenWhatsApp = (customMsg?: string) => {
    const text = customMsg || "Assalamu Alaikum Sportify Kashmir! I need assistance regarding sports gear & delivery.";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 flex flex-col items-end">
      {/* Quick Questions Popup Menu */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <MessageCircle size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900 dark:text-white">Sportify Kashmir Support</h4>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online • Instant Reply
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 my-3 leading-relaxed">
            Need help selecting Kashmir Willow bats, football studs, or custom team jerseys? Chat directly with our sports specialists!
          </p>

          {/* Quick Question Chips */}
          <div className="space-y-1.5">
            {[
              "🏏 Help me choose Kashmir Willow Bat",
              "📦 Kashmir 24-48h Delivery Inquiry",
              "👕 Custom Team Jersey & Bulk Order",
              "💵 Cash on Delivery (COD) Questions",
            ].map((msg, i) => (
              <button
                key={i}
                onClick={() => handleOpenWhatsApp(msg)}
                className="w-full text-left px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 rounded-xl transition cursor-pointer flex items-center justify-between"
              >
                <span>{msg}</span>
                <span className="text-emerald-500 font-bold">›</span>
              </button>
            ))}
          </div>

          {/* Direct Chat CTA */}
          <button
            onClick={() => handleOpenWhatsApp()}
            className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <MessageCircle size={15} />
            <span>Start WhatsApp Chat</span>
          </button>
        </div>
      )}

      {/* Tooltip on First Visit */}
      {showTooltip && !isOpen && (
        <div className="mb-2 hidden sm:flex items-center gap-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-xs font-bold animate-bounce">
          <Sparkles size={14} className="text-emerald-500" />
          <span>Chat with Sports Expert</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-gray-400 hover:text-gray-600 ml-1 text-xs"
          >
            ×
          </button>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Sportify Kashmir on WhatsApp"
        className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer ring-4 ring-emerald-500/20 group"
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
