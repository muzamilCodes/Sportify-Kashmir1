"use client";

import { AlertTriangle, Award, Loader2, ShoppingBag, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import { resolveProductImage } from "@/lib/imageHelper";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
  image?: string;
  description: string;
  category: string;
  rating: number;
  totalProducts: number;
  isPopular: boolean;
  discount?: number;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchBrands();
  }, []);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const getBrandHref = (brandName: string) => `/brands/${slugify(brandName)}`;

  const fetchBrands = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(`${API_URL}/brand/all`);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        const transformedBrands = result.data.map((brand: any) => ({
          _id: brand._id,
          name: brand.name,
          image: brand.image || brand.logo || "",
          logo: brand.image || brand.logo || "",
          description: brand.description || "Premium sports equipment",
          category: brand.category || "general",
          rating: typeof brand.rating === "number" ? brand.rating : 4.5,
          totalProducts: typeof brand.totalProducts === "number" ? brand.totalProducts : 0,
          isPopular: Boolean(brand.isPopular !== false),
          discount: typeof brand.discount === "number" ? brand.discount : 10,
        }));
        setBrands(transformedBrands);
      } else {
        setBrands([]);
        setError(result.message || "No brands were returned from the server.");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setError("We couldn't load brands right now. Please try again.");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", label: "All Brands" },
    { id: "cricket", label: "Cricket" },
    { id: "apparel", label: "Apparel" },
    { id: "tennis", label: "Tennis" },
    { id: "fitness", label: "Fitness" },
    { id: "football", label: "Football" },
    { id: "basketball", label: "Basketball" },
  ];

  const filteredBrands =
    selectedCategory === "all"
      ? brands
      : brands.filter((brand) => brand.category === selectedCategory);

  const popularBrands = brands.filter((brand) => brand.isPopular).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        variant="default"
        icon={<AlertTriangle className="w-12 h-12" />}
        title="Brands are unavailable"
        description={error}
        actionLabel="Try Again"
        onAction={fetchBrands}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Premium Sports Brands
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover top-quality sports equipment from world-renowned brands
            trusted by athletes in Kashmir and worldwide
          </p>
        </div>

        {/* Popular Brands Section */}
        {popularBrands.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Brands</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {popularBrands.map((brand) => (
                <Link
                  key={brand._id}
                  href={getBrandHref(brand.name)}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col items-center text-center overflow-hidden border border-gray-100"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 overflow-hidden p-2 border group-hover:scale-105 transition-transform">
                    {brand.image ? (
                      <img
                        src={resolveProductImage(brand.image)}
                        alt={brand.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Award className="w-10 h-10 text-blue-600" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{brand.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">{brand.description}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700">
                      {brand.rating}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Brands Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Sports Brands</h2>
        </div>

        {filteredBrands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10">
            <p className="text-center text-gray-600">
              No brands matched the selected category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-gray-100"
              >
                {/* Brand Header Banner with Image */}
                <div className="relative h-36 bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex flex-col justify-between overflow-hidden">
                  {brand.image && (
                    <img
                      src={resolveProductImage(brand.image)}
                      alt={brand.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-25"
                    />
                  )}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      Sportify Partner
                    </span>
                    {brand.discount && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow">
                        Up to {brand.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold">{brand.name}</h3>
                  </div>
                </div>

                {/* Brand Details */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{brand.description}</p>
                  
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-800">{brand.rating}</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                      Official Store
                    </span>
                  </div>

                  <Link
                    href={getBrandHref(brand.name)}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Shop {brand.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
