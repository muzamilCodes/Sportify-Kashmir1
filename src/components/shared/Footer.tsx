"use client";

import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Shield,
  Truck,
  Twitter,
  Youtube,
  RefreshCw,
  Headphones,
  Download,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

function Link(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const quickLinks = [
    { name: "Shop All", link: "/products" },
    { name: "Sports Blog & Guides", link: "/blog" },
    { name: "Track Orders", link: "/orders" },
    { name: "Wishlist", link: "/wishlist" },
    { name: "Return Policy", link: "/return-policy" },
    { name: "About Us", link: "/about" },
    { name: "Contact Us", link: "/contact" },
  ];

  const categories = [
    { name: "Cricket Gear", link: "/categories/cricket" },
    { name: "Football", link: "/categories/football" },
    { name: "Fitness & Gym", link: "/categories/fitness" },
    { name: "Badminton", link: "/categories/badminton" },
    { name: "Sports Wear", link: "/categories/sports-wear" },
    { name: "Shoes", link: "/categories/sports-shoes" },
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-300 mt-12 pb-20 md:pb-8 text-xs border-t border-zinc-800">
      {/* ─── Compact Trust Strip ─── */}
      <div className="bg-gradient-to-r from-orange-500/10 via-zinc-900 to-red-500/10 border-b border-zinc-800/80 py-3">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-zinc-300">
            <div className="flex items-center justify-center gap-1.5">
              <Truck size={15} className="text-orange-500 shrink-0" />
              <span className="font-semibold text-[11px]">Free Shipping Over ₹999</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Shield size={15} className="text-orange-400 shrink-0" />
              <span className="font-semibold text-[11px]">100% Genuine Gear</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <RefreshCw size={15} className="text-emerald-500 shrink-0" />
              <span className="font-semibold text-[11px]">7-Day Easy Returns</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Headphones size={15} className="text-red-400 shrink-0" />
              <span className="font-semibold text-[11px]">24/7 Dedicated Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Compact Main Footer Grid ─── */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Socials */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/25">
                SK
              </div>
              <h3 className="font-display text-base font-bold text-white tracking-tight">
                Sportify <span className="text-orange-500">Kashmir</span>
              </h3>
            </div>
            <p className="text-zinc-400 text-[12px] leading-relaxed max-w-xs">
              Kashmir&apos;s premier sports destination. Authentic gear, apparel & cricket equipment from the Valley.
            </p>
            <div className="flex gap-2 pt-1">
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-zinc-400 transition" aria-label="Instagram">
                <Instagram size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-zinc-400 transition" aria-label="Facebook">
                <Facebook size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-zinc-400 transition" aria-label="Twitter">
                <Twitter size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-zinc-400 transition" aria-label="YouTube">
                <Youtube size={14} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-orange-500 rounded-full"></span>
              {t("nav.all", "Categories")}
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  href={c.link}
                  className="text-gray-400 hover:text-orange-400 transition truncate text-[11px]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-orange-500 rounded-full"></span>
              {t("footer.quickLinks", "Quick Links")}
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {quickLinks.map((l) => (
                <Link
                  key={l.name}
                  href={l.link}
                  className="text-gray-400 hover:text-orange-400 transition truncate text-[11px]"
                >
                  {l.name}
                </Link>
              ))}
            </div>
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("show-pwa-install"))}
                className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-semibold text-[11px] transition cursor-pointer"
              >
                <Download size={12} />
                Install App (PWA)
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-orange-500 rounded-full"></span>
              {t("footer.customerService", "Contact Us")}
            </h4>
            <div className="space-y-1.5 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-orange-500 shrink-0" />
                <span>Handwara, Qalamabad, Kashmir</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-orange-500 shrink-0" />
                <a href="tel:+919682645127" className="hover:text-orange-400 transition">+91 9682645127</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-orange-500 shrink-0" />
                <a href="mailto:sportify68@gmail.com" className="hover:text-orange-400 transition truncate">sportify68@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Compact Bottom Bar ─── */}
        <div className="mt-6 pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-gray-500">
          <p>© {currentYear} Sportify Kashmir. {t("footer.allRights", "All rights reserved.")}</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy-policy" className="hover:text-orange-400 transition">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms-conditions" className="hover:text-orange-400 transition">
              Terms
            </Link>
            <span>•</span>
            <Link href="/return-policy" className="text-orange-400 hover:underline">
              7-Day Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
