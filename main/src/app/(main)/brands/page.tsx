"use client";

import { Award, ShoppingBag, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
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
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brand/all`,
      );
      const result = await response.json();
      if (result.success && result.data) {
        // Transform to match the expected interface
        const transformedBrands = result.data.map((brand: any) => ({
          _id: brand._id,
          name: brand.name,
          logo: "/brands/default.png", // Default logo since backend doesn't have logos
          description: brand.description || "Premium sports equipment",
          category: "general", // Default category
          rating: 4.5, // Default rating
          totalProducts: 0, // Would need to count products per brand
          isPopular: false,
          discount: 0,
        }));
        setBrands(transformedBrands);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
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

  const popularBrands = brands.filter((brand) => brand.isPopular);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
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
            trusted by athletes worldwide
          </p>
        </div>

        {/* Popular Brands Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Brands</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularBrands.map((brand) => (
              <Link
                key={brand._id}
                href={`/products?brand=${brand.name.toLowerCase().replace(" ", "-")}`}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{brand.name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {brand.rating}
                    </span>
                  </div>
                  {brand.discount && (
                    <div className="text-sm font-semibold text-green-600">
                      Up to {brand.discount}% OFF
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* All Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Brand Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  {brand.discount && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {brand.discount}% OFF
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{brand.name}</h3>
                <p className="text-blue-100 text-sm">{brand.description}</p>
              </div>

              {/* Brand Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{brand.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">
                        {brand.totalProducts}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Products</div>
                  </div>
                </div>

                <Link
                  href={`/products?brand=${brand.name.toLowerCase().replace(" ", "-")}`}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop {brand.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <TrendingUp className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Can't Find Your Favorite Brand?
          </h3>
          <p className="text-xl mb-6 text-blue-100">
            We're constantly adding new premium brands. Let us know which brands
            you'd like to see!
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
            Request a Brand
          </button>
        </div>
      </div>
    </div>
  );
}
