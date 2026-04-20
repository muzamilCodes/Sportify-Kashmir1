"use client";

import {
  Clock,
  Heart,
  ShoppingCart,
  Tag,
  TrendingDown,
  Filter,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SaleProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  productImgUrls: string[];
  category?: { _id: string; name: string } | string;
  isAvailable: boolean;
  stock: number;
  onSale: boolean;
}

export default function SalePage() {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("discount");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });

  // Get unique categories from products
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  const getCategoryName = (category: SaleProduct['category']) => {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category.name || '';
  };

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getAll`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter products that are on sale
        const saleProducts = result.data.filter((p: any) => p.onSale === true && p.isAvailable === true);
        setProducts(saleProducts);
        setFilteredProducts(saleProducts);
        
        // Extract unique categories
        const uniqueCategories = new Map();
        saleProducts.forEach((p: any) => {
          const catName = getCategoryName(p.category);
          if (catName && !uniqueCategories.has(catName.toLowerCase())) {
            uniqueCategories.set(catName.toLowerCase(), { id: catName.toLowerCase(), name: catName });
          }
        });
        setCategories([{ id: "all", name: "All Categories" }, ...Array.from(uniqueCategories.values())]);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error fetching sale products:", error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (product) => getCategoryName(product.category)?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Price filter
    filtered = filtered.filter(
      (product) => {
        const discountedPrice = product.price - (product.price * product.discount) / 100;
        return discountedPrice >= priceRange.min && discountedPrice <= priceRange.max;
      }
    );

    // Sorting
    filtered.sort((a, b) => {
      const priceA = a.price - (a.price * a.discount) / 100;
      const priceB = b.price - (b.price * b.discount) / 100;
      
      switch (sortBy) {
        case "discount":
          return b.discount - a.discount;
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, filterCategory, sortBy, priceRange]);

  const handleAddToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      const cartId = localStorage.getItem("cartId");

      if (!token && !cartId) {
        toast.error("Please login to add to cart");
        return;
      }

      let response;
      if (token) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/addtoCart/${productId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity: 1 }),
          }
        );
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cart/addtoCart/${productId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: 1, cartId }),
          }
        );
      }

      const result = await response.json();
      if (result.success) {
        if (!token && result.data && result.data._id) {
          localStorage.setItem("cartId", result.data._id);
        }
        toast.success("Added to cart!");
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add to cart");
    }
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Tag className="w-16 h-16 mx-auto mb-4 animate-bounce" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Flash Sale!</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Grab the hottest deals on premium sports equipment. Limited time offers!
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="font-bold">{products.length}</span> Items on Sale
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="font-bold">Up to 50%</span> OFF
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8 sticky top-20 z-10">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          filterCategory === cat.id
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price Range: ₹{priceRange.min} - ₹{priceRange.max}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">Found {filteredProducts.length} products on sale</p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sale items found</h3>
            <p className="text-gray-600 mb-6">Check back later for amazing deals!</p>
            <Link href="/products" className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const saving = product.price - discountedPrice;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  {/* Product Image */}
                  <Link href={`/product/${product._id}`}>
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {product.productImgUrls?.[0] ? (
                        <img
                          src={getImageUrl(product.productImgUrls[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      
                      {/* Discount Badge */}
                      <div className="absolute top-3 left-3 bg-red-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                        {product.discount}% OFF
                      </div>
                      
                      {/* Sale Badge */}
                      <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        SALE
                      </div>
                      
                      {/* Stock Warning */}
                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Only {product.stock} left
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">SOLD OUT</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/product/${product._id}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-red-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {getCategoryName(product.category)}
                    </p>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-red-600">
                          ₹{discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        Save ₹{saving.toFixed(2)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      disabled={!product.isAvailable || product.stock === 0}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.isAvailable && product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-8 text-center text-white">
          <Tag className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Don't Miss Future Sales!</h3>
          <p className="text-lg mb-6 text-red-100">
            Subscribe to get notified about upcoming sales and exclusive deals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}