"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  Tag,
  Truck,
  Shield,
} from "lucide-react";

// Custom icons for sports (not available in lucide-react)
const CricketIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11.5 12.5 6 18c-2.5-1.5-5-.5-7 2 2.5 1.5 5 .5 7-2l5.5-5.5Z" />
    <path d="m12 12 5.5-5.5c2.5 1.5 5 .5 7-2-2.5-1.5-5-.5-7 2L12 12Z" />
    <path d="m9 15-4.5 4.5c-2.5-1.5-5-.5-7 2 2.5 1.5 5 .5 7-2L9 15Z" />
    <path d="m15 9 4.5-4.5c2.5 1.5 5 .5 7-2-2.5-1.5-5-.5-7 2L15 9Z" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const FootballIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4 15.3 15.3 0 0 1-10 4 15.3 15.3 0 0 1-10-4z" />
  </svg>
);

const BasketballIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4 15.3 15.3 0 0 1-10 4 15.3 15.3 0 0 1-10-4z" />
  </svg>
);

const TennisIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12a15.3 15.3 0 0 1 10-4 15.3 15.3 0 0 1 10 4" />
  </svg>
);

const BadmintonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="12" cy="18" r="2" />
    <path d="M8 6h8" />
    <path d="M8 18h8" />
  </svg>
);

const FitnessIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 4v16" />
    <path d="M18 4v16" />
    <rect x="2" y="8" width="20" height="8" rx="2" />
    <path d="M8 12h8" />
  </svg>
);

const ApparelIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 4h-4L12 2 8 4H4v4l4 2v10h8V10l4-2V4z" />
    <path d="M8 4l4 2 4-2" />
  </svg>
);

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  slug?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/all`);
      const result = await response.json();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("cricket")) {
      return <CricketIcon className="w-12 h-12" />;
    } else if (lowerName.includes("football")) {
      return <FootballIcon className="w-12 h-12" />;
    } else if (lowerName.includes("basketball")) {
      return <BasketballIcon className="w-12 h-12" />;
    } else if (lowerName.includes("tennis")) {
      return <TennisIcon className="w-12 h-12" />;
    } else if (lowerName.includes("badminton")) {
      return <BadmintonIcon className="w-12 h-12" />;
    } else if (lowerName.includes("fitness") || lowerName.includes("gym")) {
      return <FitnessIcon className="w-12 h-12" />;
    } else if (lowerName.includes("apparel") || lowerName.includes("clothing")) {
      return <ApparelIcon className="w-12 h-12" />;
    }
    return <Star className="w-12 h-12" />;
  };

  const getCategoryGradient = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("cricket")) return "from-green-600 to-emerald-700";
    if (lowerName.includes("football")) return "from-blue-600 to-indigo-700";
    if (lowerName.includes("basketball")) return "from-orange-500 to-red-600";
    if (lowerName.includes("tennis")) return "from-yellow-500 to-yellow-700";
    if (lowerName.includes("badminton")) return "from-purple-500 to-pink-600";
    if (lowerName.includes("fitness")) return "from-red-500 to-orange-600";
    if (lowerName.includes("apparel")) return "from-pink-500 to-rose-600";
    return "from-gray-600 to-gray-800";
  };

  const getPopularItems = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("cricket")) return ["Bats", "Balls", "Pads", "Gloves", "Helmets"];
    if (lowerName.includes("football")) return ["Boots", "Jerseys", "Shin Guards", "Goal Keeper Gloves"];
    if (lowerName.includes("basketball")) return ["Basketballs", "Shoes", "Jerseys", "Hoops"];
    if (lowerName.includes("tennis")) return ["Rackets", "Balls", "Grips", "Shoes"];
    if (lowerName.includes("badminton")) return ["Rackets", "Shuttlecocks", "Grips", "Net"];
    if (lowerName.includes("fitness")) return ["Dumbbells", "Yoga Mats", "Gym Wear", "Supplements"];
    if (lowerName.includes("apparel")) return ["Jerseys", "Shorts", "Tracksuits", "Compression Wear"];
    return ["Equipment", "Accessories", "Gear"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );

    
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop by Sports
            </h1>
            <p className="text-xl text-orange-100 mb-6">
              Find everything you need for your favorite sport
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm">
                🏆 Premium Quality
              </div>
              <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm">
                🚚 Free Shipping
              </div>
              <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm">
                💯 Authentic Products
              </div>
            </div>
          </div>
        </div>
        {/* Wave SVG */}
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64L1440 120L1380 120C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120L0 120Z" fill="#F9FAFB"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Categories Banner */}
        <div className="mb-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Tag className="w-8 h-8 text-orange-500 mb-2" />
              <h2 className="text-2xl font-bold text-gray-900">Limited Time Offers</h2>
              <p className="text-gray-600 mt-1">Up to 50% off on selected categories</p>
            </div>
            <Link href="/sale" className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition flex items-center gap-2">
              View All Deals
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category._id}
              className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              onMouseEnter={() => setHoveredCategory(category._id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(category.name)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Content */}
              <div className="relative p-6 z-10">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${hoveredCategory === category._id ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'} group-hover:bg-white/20 group-hover:text-white`}>
                  {getCategoryIcon(category.name)}
                </div>

                {/* Category Name */}
                <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${hoveredCategory === category._id ? 'text-white' : 'text-gray-900'} group-hover:text-white`}>
                  {category.name}
                </h3>

                {/* Description */}
                <p className={`text-sm mb-4 transition-colors duration-300 ${hoveredCategory === category._id ? 'text-white/80' : 'text-gray-600'} group-hover:text-white/80 line-clamp-2`}>
                  {category.description || `Shop the best ${category.name} equipment and gear`}
                </p>

                {/* Popular Items */}
                <div className="mb-5">
                  <p className={`text-xs font-medium mb-2 transition-colors duration-300 ${hoveredCategory === category._id ? 'text-white/70' : 'text-gray-500'} group-hover:text-white/70`}>
                    Popular in this category:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getPopularItems(category.name).slice(0, 4).map((item) => (
                      <span
                        key={item}
                        className={`text-xs px-2 py-1 rounded-full transition-all duration-300 ${hoveredCategory === category._id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'} group-hover:bg-white/20 group-hover:text-white`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Shop Now Button */}
                <Link
                  href={`/categories/${category.name.toLowerCase()}`}
                  className={`inline-flex items-center gap-2 font-semibold transition-all duration-300 ${hoveredCategory === category._id ? 'text-white' : 'text-orange-600'} group-hover:text-white group-hover:gap-3`}
                >
                  Shop Now
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Decorative Elements */}
              <div className={`absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className={`absolute -top-4 -left-4 w-24 h-24 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100`}></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">Categories will appear here once added by admin</p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Free Delivery</h3>
            <p className="text-gray-600 text-sm">On orders above ₹999</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-gray-600 text-sm">100% secure transactions</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Get help anytime</p>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
          <p className="text-gray-300 mb-6">Subscribe to get updates on new arrivals and special offers</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}