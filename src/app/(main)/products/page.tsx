"use client";

import { Suspense } from "react";
import { Filter, Grid, List, Search, ChevronDown, Heart, ShoppingCart, Eye, Star, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  colors: string[];
  sizes: string[];
  isAvailable: boolean;
  isArchived: boolean;
  category?: { _id: string; name: string };
  brand?: { _id: string; name: string } | string;
  stock: number;
  rating?: number;
  reviewCount?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand { _id: string; name: string }

// Inner component that uses useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${API_URL}/uploads/${url}`;
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        setWishlist([]);
      }
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/product/getAll`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.success && result.data) {
        const availableProducts = result.data.filter(
          (product: any) => product.isAvailable && !product.isArchived
        );
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/category/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_URL}/brand/all`);
      const result = await response.json();
      if (result.success && result.data) setBrands(result.data);
    } catch (error) { console.error("Error fetching brands:", error); }
  };

  const suggestions = searchTerm.length > 1
    ? products.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];
  const allSizes = Array.from(new Set(products.flatMap((product) => product.sizes || []))).sort();
  const allColors = Array.from(new Set(products.flatMap((product) => product.colors || []))).sort();

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => typeof product.category === "object" ? product.category?._id === selectedCategory : product.category === selectedCategory
      );
    }

    if (selectedBrand !== "all") filtered = filtered.filter((product) => typeof product.brand === "object" ? product.brand?._id === selectedBrand : product.brand === selectedBrand);
    if (selectedSize !== "all") filtered = filtered.filter((product) => product.sizes?.includes(selectedSize));
    if (selectedColor !== "all") filtered = filtered.filter((product) => product.colors?.includes(selectedColor));
    if (minRating > 0) filtered = filtered.filter((product) => (product.rating || 4.5) >= minRating);
    if (availability === "in-stock") filtered = filtered.filter((product) => product.stock > 0 && product.isAvailable);
    if (availability === "out-of-stock") filtered = filtered.filter((product) => product.stock === 0 || !product.isAvailable);

    filtered = filtered.filter(
      (product) => product.price >= priceRange.min && product.price <= priceRange.max
    );

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => (b._id?.localeCompare(a._id) || 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, priceRange, products, selectedCategory, selectedBrand, selectedSize, selectedColor, minRating, availability, sortBy]);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        window.location.href = "/login";
        return;
      }

      const headers: Record<string, string> = { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/addtoCart/${productId}`, {
        method: "POST",
        headers,
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
      toast.error("Failed to add to cart");
    }
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let newWishlist: string[];
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
      toast.success("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, productId];
      toast.success("Added to wishlist");
    }
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedSize("all");
    setSelectedColor("all");
    setMinRating(0);
    setAvailability("all");
    setPriceRange({ min: 0, max: 50000 });
    setSortBy("newest");
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "discount", label: "Biggest Discount" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero Banner: Main Heading 30–36px */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-8 md:py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-[28px] sm:text-[32px] md:text-[36px] font-extrabold mb-2 tracking-tight">
            Shop All Products
          </h1>
          <p className="text-[14px] sm:text-[16px] text-orange-100 max-w-xl mx-auto px-2">
            Discover premium sports equipment and gear at unbeatable prices across Kashmir
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sticky top-16 z-20">
          {/* Row 1: Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[14px] bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 overflow-hidden rounded-xl border bg-white shadow-xl">
                {suggestions.map((product) => (
                  <Link key={product._id} href={`/product/${product._id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50">
                    <img src={getImageUrl(product.productImgUrls?.[0])} alt="" loading="lazy" className="h-9 w-9 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{product.name}</span>
                    <span className="text-xs text-orange-600">₹{calculateDiscountedPrice(product.price, product.discount).toFixed(0)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Row 2: Sort, View Mode, Filter Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative flex-1 min-w-[140px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 text-[13px] sm:text-[14px] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 cursor-pointer font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-gray-200 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-orange-500 text-white shadow-xs" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-orange-500 text-white shadow-xs" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[13px] sm:text-[14px] font-medium rounded-lg border transition ${showFilters ? "bg-orange-500 text-white border-orange-500 shadow-xs" : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
            >
              <SlidersHorizontal size={15} />
              <span>Filter</span>
              {(selectedCategory !== "all" || searchTerm || priceRange.min > 0 || priceRange.max < 50000) && (
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Filter */}
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 text-[13px] sm:text-[14px] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-1">Price Range</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full pl-6 pr-2 py-1.5 text-[13px] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">-</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">₹</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full pl-6 pr-2 py-1.5 text-[13px] border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Brand<select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="mt-1 w-full p-2 text-[13px] border rounded-lg bg-white dark:bg-gray-700"><option value="all">All Brands</option>{brands.map((brand) => <option key={brand._id} value={brand._id}>{brand.name}</option>)}</select></label>
                <label className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Rating<select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="mt-1 w-full p-2 text-[13px] border rounded-lg bg-white dark:bg-gray-700"><option value={0}>Any rating</option><option value={4}>4★ & above</option><option value={3}>3★ & above</option></select></label>
                <label className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Size<select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="mt-1 w-full p-2 text-[13px] border rounded-lg bg-white dark:bg-gray-700"><option value="all">All Sizes</option>{allSizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
                <label className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Color<select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="mt-1 w-full p-2 text-[13px] border rounded-lg bg-white dark:bg-gray-700"><option value="all">All Colors</option>{allColors.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
                <label className="text-[12px] font-semibold text-gray-700 dark:text-gray-300 sm:col-span-2">Availability<select value={availability} onChange={(e) => setAvailability(e.target.value)} className="mt-1 w-full p-2 text-[13px] border rounded-lg bg-white dark:bg-gray-700"><option value="all">All products</option><option value="in-stock">In stock</option><option value="out-of-stock">Out of stock</option></select></label>
              </div>

              {/* Clear Filters Button */}
              <button
                type="button"
                onClick={clearFilters}
                className="w-full py-1.5 text-[13px] font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <p className="text-[13px] sm:text-[14px] text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span> products
          </p>
        </div>

        {/* Products View */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No products found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
            <button onClick={clearFilters} className="bg-orange-500 text-white px-5 py-2 text-[14px] font-medium rounded-lg hover:bg-orange-600 transition">
              Clear Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* 2 cols on mobile, 3 on sm, 4 on md/lg, 5 on xl */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = Boolean(product.discount && product.discount > 0);
              
              return (
                <ProductCard
                  key={product._id}
                  product={product}
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
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = product.discount && product.discount > 0;
              
              return (
                <div key={product._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Product Image */}
                    <Link href={`/product/${product._id}`} className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 dark:bg-gray-850 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2">
                      {product.productImgUrls?.[0] ? (
                        <img
                          src={getImageUrl(product.productImgUrls[0])}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {product.discount}% OFF
                        </div>
                      )}
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${product._id}`}>
                          <h3 className="font-semibold text-[14px] sm:text-[15px] text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-orange-600 transition">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-[13px] mb-2 line-clamp-1 sm:line-clamp-2">{product.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {product.category && (
                            <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {typeof product.category === 'object' ? product.category.name : product.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <span className="text-[18px] sm:text-[20px] font-bold text-gray-900 dark:text-white">
                            ₹{Math.round(discountedPrice).toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 line-through">
                              ₹{Math.round(product.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(product._id, e)}
                          disabled={!product.isAvailable || product.stock === 0}
                          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] sm:text-[14px] rounded-lg font-medium hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <ShoppingCart size={14} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
