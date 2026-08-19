"use client";

import {
  Clock,
  Heart,
  ShoppingCart,
  Tag,
  TrendingDown,
  Filter,
  ChevronDown,
  Zap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import { resolveProductImage } from "@/lib/imageHelper";

interface SaleProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  productImgUrls: string[];
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  isAvailable: boolean;
  stock: number;
  onSale?: boolean;
}

export default function SalePage() {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("discount");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const getImageUrl = (url: string) => {
    return resolveProductImage(url);
  };

  const getCategoryName = (category: SaleProduct["category"]) => {
    if (!category) return "";
    if (typeof category === "string") return category;
    return category.name || "";
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount || discount <= 0) return price;
    return price - (price * discount) / 100;
  };

  useEffect(() => {
    fetchSaleProducts();
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        setWishlist([]);
      }
    }
  }, []);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      // Try dedicated /product/sale endpoint, fallback to /product/getAll
      let rawList: any[] = [];
      try {
        const res = await fetch(`${API_URL}/product/sale`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            rawList = Array.isArray(json.data) ? json.data : json.data?.items || [];
          }
        }
      } catch (err) {
        console.warn("Could not fetch /product/sale, falling back to /product/getAll", err);
      }

      if (rawList.length === 0) {
        const allRes = await fetch(`${API_URL}/product/getAll`);
        if (allRes.ok) {
          const allJson = await allRes.json();
          if (allJson.success && allJson.data) {
            const allItems = Array.isArray(allJson.data) ? allJson.data : allJson.data?.items || [];
            rawList = allItems.filter(
              (p: any) =>
                p.isAvailable !== false &&
                !p.isArchived &&
                (p.onSale === true || (p.discount && p.discount > 0))
            );
            // If still empty, show all available products
            if (rawList.length === 0) {
              rawList = allItems.filter((p: any) => p.isAvailable !== false && !p.isArchived);
            }
          }
        }
      }

      const availableSaleProducts = rawList.filter((p: any) => p.isAvailable !== false && !p.isArchived);
      setProducts(availableSaleProducts);
      setFilteredProducts(availableSaleProducts);

      // Extract unique categories
      const uniqueCategories = new Map<string, { id: string; name: string }>();
      availableSaleProducts.forEach((p: any) => {
        const catName = getCategoryName(p.category);
        if (catName && !uniqueCategories.has(catName.toLowerCase())) {
          uniqueCategories.set(catName.toLowerCase(), {
            id: catName.toLowerCase(),
            name: catName,
          });
        }
      });
      setCategories([
        { id: "all", name: "All Deals" },
        ...Array.from(uniqueCategories.values()),
      ]);
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
        (product) =>
          getCategoryName(product.category)?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter((product) => {
      const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
      return discountedPrice >= priceRange.min && discountedPrice <= priceRange.max;
    });

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = calculateDiscountedPrice(a.price, a.discount);
          const priceB = calculateDiscountedPrice(b.price, b.discount);
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = calculateDiscountedPrice(a.price, a.discount);
          const priceB = calculateDiscountedPrice(b.price, b.discount);
          return priceB - priceA;
        });
        break;
      case "discount":
      default:
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [filterCategory, priceRange, sortBy, products]);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/addtoCart/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let newWishlist: string[];
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter((id) => id !== productId);
      toast.success("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, productId];
      toast.success("Added to wishlist");
    }
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3">
            <span>🔥</span> LIMITED TIME DEALS
          </span>
          <h1 className="text-[28px] sm:text-[32px] md:text-[36px] font-extrabold mb-2 tracking-tight">
            Flash Sale & Hot Deals
          </h1>
          <p className="text-[14px] sm:text-[16px] text-red-100 max-w-xl mx-auto">
            Save up to 50% on authentic sports gear with Kashmir-wide express delivery
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] sm:text-[14px] font-medium text-gray-700 dark:text-gray-300">
                Sort by:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 text-[13px] sm:text-[14px] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="discount">Biggest Discount</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={14}
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] sm:text-[14px] font-medium rounded-lg border transition ${
                showFilters
                  ? "bg-red-600 text-white border-red-600"
                  : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              }`}
            >
              <Filter size={15} />
              Filter Deals
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        filterCategory === cat.id
                          ? "bg-red-600 text-white shadow-xs"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Price Range (₹{priceRange.min} - ₹{priceRange.max})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="100"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: Number(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] sm:text-[14px] text-gray-600 dark:text-gray-400">
            Found{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {filteredProducts.length}
            </span>{" "}
            products on sale
          </p>
          {filterCategory !== "all" && (
            <button
              onClick={() => setFilterCategory("all")}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-red-500 border-t-transparent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
            <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              No sale items found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Check back later for amazing deals!
            </p>
            <Link
              href="/products"
              className="inline-block bg-red-600 text-white px-5 py-2 rounded-lg text-[14px] font-semibold hover:bg-red-700 transition"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = !!(product.discount && product.discount > 0);

              return (
                <ProductCard
                  key={product._id}
                  product={product as any}
                  discountedPrice={discountedPrice}
                  hasDiscount={hasDiscount}
                  wishlist={wishlist}
                  getImageUrl={getImageUrl}
                  handleAddToCart={handleAddToCart}
                  toggleWishlist={toggleWishlist}
                />
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
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-white"
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