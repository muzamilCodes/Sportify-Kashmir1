"use client";

import Link from "next/link";
import { Home, ShoppingBag, Tag, Heart, User, Mail, Info, FileText, Ruler, Repeat, Shield, XCircle, BookOpen, MapPin, Phone } from "lucide-react";

export default function SitemapPage() {
  const sections = [
    {
      title: "Main Pages",
      icon: <Home className="w-5 h-5" />,
      links: [
        { name: "Home", href: "/" },
        { name: "Products", href: "/products" },
        { name: "Categories", href: "/categories" },
        { name: "Brands", href: "/brands" },
        { name: "Sale", href: "/sale" },
        { name: "Blog", href: "/blog" },
        { name: "About Us", href: "/about" },
        { name: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Account Pages",
      icon: <User className="w-5 h-5" />,
      links: [
        { name: "My Account", href: "/profile" },
        { name: "My Orders", href: "/orders" },
        { name: "Wishlist", href: "/wishlist" },
        { name: "Cart", href: "/cart" },
        { name: "Checkout", href: "/checkout" },
        { name: "Login", href: "/login" },
        { name: "Register", href: "/register" },
      ],
    },
    {
      title: "Help & Support",
      icon: <Info className="w-5 h-5" />,
      links: [
        { name: "Product Guides", href: "/product-guides" },
        { name: "Size Guide", href: "/size-guide" },
        { name: "Maintenance Tips", href: "/maintenance-tips" },
        { name: "Team Orders", href: "/team-orders" },
        { name: "Bulk Purchases", href: "/bulk-purchases" },
        { name: "Track Order", href: "/orders" },
      ],
    },
    {
      title: "Policies",
      icon: <Shield className="w-5 h-5" />,
      links: [
        { name: "7-Day Return Policy", href: "/return-policy" },
        { name: "Shipping Policy", href: "/shipping-policy" },
        { name: "Exchange Policy", href: "/exchange-policy" },
        { name: "Cancellation Policy", href: "/cancellation-policy" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms & Conditions", href: "/terms-conditions" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sitemap</h1>
          <p className="text-gray-600 mt-2">Quick navigation to all pages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sections.map((section, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <div className="text-orange-500">{section.icon}</div>
                <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-600 hover:text-orange-500 transition text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-orange-50 rounded-xl p-6 text-center">
            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">Can't find what you're looking for? Contact our support team.</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">
                Contact Us
              </Link>
              <Link href="/" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}