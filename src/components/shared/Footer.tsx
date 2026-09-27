"use client";

import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  Download,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

function Link(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const quickLinks = [
    { name: "Shop All", link: "/products" },
    { name: "Blog", link: "/blog" },
    { name: "Track Orders", link: "/orders" },
    { name: "Wishlist", link: "/wishlist" },
    { name: "Return Policy", link: "/return-policy" },
    { name: "Contact", link: "/contact" },
  ];

  const categories = [
    { name: "Cricket Bats", link: "/categories/cricket" },
    { name: "Football", link: "/categories/football" },
    { name: "Gym & Fitness", link: "/categories/fitness" },
    { name: "Badminton", link: "/categories/badminton" },
    { name: "Sports Wear", link: "/categories/sports-wear" },
    { name: "Shoes", link: "/categories/sports-shoes" },
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-400 mt-0 pt-3 pb-16 md:pb-3 text-xs border-t border-zinc-800">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2.5">
          {/* 1. Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center text-white font-black text-[10px] shrink-0">
                SK
              </div>
              <span className="font-bold text-white text-xs tracking-tight">
                Sportify <span className="text-orange-500">Kashmir</span>
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Valley&apos;s authentic cricket &amp; sports equipment.
            </p>
            <div className="flex items-center gap-1 pt-0.5">
              <a href="#" className="w-5 h-5 rounded bg-zinc-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-zinc-400 transition" aria-label="Instagram">
                <Instagram size={10} />
              </a>
              <a href="#" className="w-5 h-5 rounded bg-zinc-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-zinc-400 transition" aria-label="Facebook">
                <Facebook size={10} />
              </a>
              <a href="#" className="w-5 h-5 rounded bg-zinc-900 hover:bg-orange-500 hover:text-white flex items-center justify-center text-zinc-400 transition" aria-label="YouTube">
                <Youtube size={10} />
              </a>
            </div>
          </div>

          {/* 2. Categories */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1">
              <span className="w-1 h-2 bg-orange-500 rounded-full"></span>
              Categories
            </h4>
            <div className="space-y-0.5">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  href={c.link}
                  className="block text-zinc-400 hover:text-orange-400 transition text-[10px] truncate leading-tight"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1">
              <span className="w-1 h-2 bg-orange-500 rounded-full"></span>
              Quick Links
            </h4>
            <div className="space-y-0.5">
              {quickLinks.map((l) => (
                <Link
                  key={l.name}
                  href={l.link}
                  className="block text-zinc-400 hover:text-orange-400 transition text-[10px] truncate leading-tight"
                >
                  {l.name}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("show-pwa-install"))}
                className="inline-flex items-center gap-0.5 text-orange-400 hover:text-orange-300 font-semibold text-[10px] cursor-pointer"
              >
                <Download size={9} />
                <span>Install App</span>
              </button>
            </div>
          </div>

          {/* 4. Contact */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 mb-1 flex items-center gap-1">
              <span className="w-1 h-2 bg-orange-500 rounded-full"></span>
              Contact
            </h4>
            <div className="space-y-1 text-[10px] text-zinc-400">
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-orange-500 shrink-0" />
                <span className="truncate">Handwara, Kashmir</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone size={10} className="text-orange-500 shrink-0" />
                <a href="tel:+919682645127" className="hover:text-orange-400 transition font-medium text-zinc-300">
                  +91 9682645127
                </a>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Mail size={10} className="text-orange-500 shrink-0" />
                <a href="mailto:sportify68@gmail.com" className="hover:text-orange-400 transition truncate">
                  sportify68@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 1-Line Bar */}
        <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-1 text-[9px] text-zinc-500">
          <p>© {currentYear} Sportify Kashmir</p>
          <div className="flex items-center gap-1.5">
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
