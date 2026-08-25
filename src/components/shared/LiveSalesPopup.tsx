"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

interface LiveSaleNotification {
  id: string;
  name: string;
  location: string;
  productName: string;
  image: string;
  timeAgo: string;
  link: string;
}

const KASHMIR_BUYERS = [
  { name: "Zubair A.", location: "Lal Chowk, Srinagar" },
  { name: "Aadil M.", location: "Sangam, Anantnag" },
  { name: "Farhan K.", location: "Baramulla Stadium" },
  { name: "Tariq H.", location: "Sopore, Kashmir" },
  { name: "Shahid B.", location: "Pulwama Town" },
  { name: "Danish R.", location: "Budgam Express" },
  { name: "Umer G.", location: "Ganderbal, Kashmir" },
  { name: "Irfan M.", location: "Kupwara Border Hub" },
  { name: "Bilal W.", location: "Kulgam Town" },
  { name: "Yawar N.", location: "Shopian Apple Belt" },
  { name: "Mehraj D.", location: "Bandipora Sports Club" },
  { name: "Faheem S.", location: "Sanat Nagar, Srinagar" },
];

const TIME_AGOS = [
  "Just now",
  "2 mins ago",
  "4 mins ago",
  "7 mins ago",
  "11 mins ago",
  "14 mins ago",
  "18 mins ago",
  "22 mins ago",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const getImageUrl = (url?: string) => {
  if (!url) return "/hero-banner-1.webp";
  if (url.startsWith("http")) return url;
  return `${API_URL}/uploads/${url}`;
};

export default function LiveSalesPopup() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentNotification, setCurrentNotification] = useState<LiveSaleNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch real active products from database
  useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/product/getAll?limit=20`);
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.data?.items)
          ? data.data.items
          : [];

        if (items.length > 0) {
          const available = items.filter((p: any) => p.isAvailable && !p.isArchived);
          setProducts(available.length > 0 ? available : items);
        }
      } catch (err) {
        console.debug("Live sales products fetch issue:", err);
      }
    };

    fetchLiveProducts();
  }, []);

  // 2. Schedule rotating live popups
  useEffect(() => {
    if (isDismissed) return;

    const showNotification = () => {
      if (products.length === 0) {
        // Fallback default notification
        const buyer = KASHMIR_BUYERS[Math.floor(Math.random() * KASHMIR_BUYERS.length)];
        const timeAgo = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];
        setCurrentNotification({
          id: Math.random().toString(),
          name: buyer.name,
          location: buyer.location,
          productName: "SG Player Kashmir Willow Cricket Bat",
          image: "/hero-banner-1.webp",
          timeAgo,
          link: "/products?search=cricket",
        });
      } else {
        const product = products[Math.floor(Math.random() * products.length)];
        const buyer = KASHMIR_BUYERS[Math.floor(Math.random() * KASHMIR_BUYERS.length)];
        const timeAgo = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];
        const img =
          product.productImgUrls && product.productImgUrls.length > 0
            ? getImageUrl(product.productImgUrls[0])
            : "/hero-banner-1.webp";

        setCurrentNotification({
          id: product._id || Math.random().toString(),
          name: buyer.name,
          location: buyer.location,
          productName: product.name,
          image: img,
          timeAgo,
          link: `/product/${product._id}`,
        });
      }

      setIsVisible(true);

      // Auto-hide popup after 6.5 seconds
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 6500);
    };

    // First popup after 4 seconds
    const initialTimer = setTimeout(showNotification, 4000);

    // Subsequent popups every 22 seconds
    const interval = setInterval(showNotification, 22000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [products, isDismissed]);

  if (isDismissed || !currentNotification || !isVisible) return null;

  return (
    <div className="fixed bottom-36 md:bottom-20 left-4 z-40 max-w-[330px] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative bg-white/95 dark:bg-gray-900/95 rounded-2xl p-3 shadow-2xl border border-gray-200/90 dark:border-gray-800 flex items-center gap-3 backdrop-blur-md">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setIsDismissed(true);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center text-xs shadow-sm cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X size={12} />
        </button>

        {/* Product Thumbnail */}
        <Link
          href={currentNotification.link}
          className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/60 dark:border-gray-700 flex items-center justify-center p-1 group"
        >
          <img
            src={currentNotification.image}
            alt={currentNotification.productName}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/hero-banner-1.webp";
            }}
          />
        </Link>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-900 dark:text-white">
            <span className="truncate">{currentNotification.name}</span>
            <span className="text-gray-400 font-normal">in</span>
            <span className="text-orange-600 dark:text-orange-400 truncate">{currentNotification.location}</span>
          </div>

          <Link
            href={currentNotification.link}
            className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 line-clamp-1 hover:text-orange-600 transition-colors block mt-0.5"
          >
            {currentNotification.productName}
          </Link>

          <div className="flex items-center justify-between mt-1 text-[10px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle2 size={11} /> Verified Buyer
            </span>
            <span className="text-gray-400 font-medium">{currentNotification.timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
