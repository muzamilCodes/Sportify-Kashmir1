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

function Link(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Shop All", link: "/products" },
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
    <footer className="bg-gray-950 text-gray-300 mt-10 pb-20 md:pb-6 text-xs border-t border-gray-800">
      {/* ─── Compact Trust Strip ─── */}
      <div className="bg-gray-900/80 border-b border-gray-800/80 py-2.5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-gray-300">
            <div className="flex items-center justify-center gap-1.5">
              <Truck size={15} className="text-orange-500 shrink-0" />
              <span className="font-semibold text-[11px]">Free Shipping Over ₹999</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Shield size={15} className="text-blue-500 shrink-0" />
              <span className="font-semibold text-[11px]">100% Genuine Gear</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <RefreshCw size={15} className="text-emerald-500 shrink-0" />
              <span className="font-semibold text-[11px]">7-Day Easy Returns</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Headphones size={15} className="text-purple-500 shrink-0" />
              <span className="font-semibold text-[11px]">24/7 Dedicated Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Compact Main Footer Grid ─── */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand & Socials */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md">
                SK
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Sportify <span className="text-orange-500">Kashmir</span>
              </h3>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Kashmir&apos;s premier sports destination. Authentic gear, apparel & cricket equipment.
            </p>
            <div className="flex gap-2.5 pt-1">
              <a href="#" className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-400 transition" aria-label="Instagram">
                <Instagram size={13} />
              </a>
              <a href="#" className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-400 transition" aria-label="Facebook">
                <Facebook size={13} />
              </a>
              <a href="#" className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-400 transition" aria-label="Twitter">
                <Twitter size={13} />
              </a>
              <a href="#" className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-gray-400 transition" aria-label="YouTube">
                <Youtube size={13} />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-orange-500 rounded-full"></span>
              Categories
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
              Quick Links
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
              Contact Us
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
          <p>© {currentYear} Sportify Kashmir. All rights reserved.</p>
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
