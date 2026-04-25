"use client";

import { Suspense } from "react";
import { Filter, Grid, List, Search, ChevronDown, Heart, ShoppingCart, Eye, Star, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

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
  stock: number;
}

interface Category {
  _id: string;
  name: string;
}

// Inner component that uses useSearchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
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
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getAll`);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/all`);
      const result = await response.json();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
        (product) => product.category?._id === selectedCategory
      );
    }

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
  }, [searchTerm, priceRange, products, selectedCategory, sortBy]);

  // const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   try {
  //     const token = localStorage.getItem("token");
  //     const cartId = localStorage.getItem("cartId");

  //     const headers: Record<string, string> = { "Content-Type": "application/json" };
  //     if (token) headers["Authorization"] = `Bearer ${token}`;

  //     const body: any = { quantity: 1 };
  //     if (!token && cartId) body.cartId = cartId;

  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/addtoCart/${productId}`, {
  //       method: "POST",
  //       headers,
  //       body: JSON.stringify(body),
  //     });

  //     const result = await response.json();
  //     if (result.success) {
  //       if (!token && result.data?._id) localStorage.setItem("cartId", result.data._id);
  //       toast.success("Added to cart!");
  //     } else {
  //       toast.error(result.message || "Failed to add to cart");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to add to cart");
  //   }
  // };
const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
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
      
      // ✅ Trigger cart update for header
      window.dispatchEvent(new Event("cartUpdated"));
      
    } else {
      toast.error(result.message || "Failed to add to cart");
    }
  } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Mobile Responsive */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">Shop All Products</h1>
          <p className="text-sm md:text-lg text-orange-100 max-w-2xl mx-auto px-2">
            Discover premium sports equipment and gear at unbeatable prices
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Search and Filter Bar - Mobile Responsive */}
        <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6 sticky top-0 z-20">
          {/* Row 1: Search - Full width on mobile */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Row 2: Sort, View Mode, Filter Button - Horizontal scroll on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative flex-1 min-w-[130px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition ${viewMode === "grid" ? "bg-orange-500 text-white" : "hover:bg-gray-100"}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition ${viewMode === "list" ? "bg-orange-500 text-white" : "hover:bg-gray-100"}`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${showFilters ? "bg-orange-500 text-white border-orange-500" : "hover:bg-gray-50"}`}
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
              {(selectedCategory !== "all" || searchTerm || priceRange.min > 0 || priceRange.max < 50000) && (
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Expanded Filters - Mobile Responsive */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t">
              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Price Range</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full pl-6 pr-2 py-2 text-sm border rounded-lg"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">-</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full pl-6 pr-2 py-2 text-sm border rounded-lg"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count - Mobile Responsive */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{products.length}</span> products
          </p>
        </div>

        {/* Products Grid/List View - Mobile Responsive */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
            <p className="text-sm text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button onClick={clearFilters} className="bg-orange-500 text-white px-5 py-2 text-sm rounded-lg hover:bg-orange-600">
              Clear Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          // Grid View - Responsive columns
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = product.discount && product.discount > 0;
              
              return (
                <Link key={product._id} href={`/product/${product._id}`} className="group">
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:-translate-y-1 h-full flex flex-col">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {product.productImgUrls?.[0] ? (
                        <img
                          src={getImageUrl(product.productImgUrls[0])}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                      )}
                      
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {product.discount}%
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => toggleWishlist(product._id, e)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition"
                      >
                        <Heart
                          size={14}
                          className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"}
                        />
                      </button>

                      {/* Stock Status */}
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          Only {product.stock}
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-xs font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-orange-600 transition">
                        {product.name}
                      </h3>
                      
                      {/* Rating - Hide on very small screens */}
                      <div className="hidden sm:flex items-center gap-0.5 mb-1.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <Star className="w-3 h-3 text-gray-300" />
                        <span className="text-xs text-gray-500 ml-1">(128)</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-orange-600">₹{discountedPrice.toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(product._id, e)}
                        disabled={!product.isAvailable || product.stock === 0}
                        className="w-full bg-gray-900 text-white py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mt-auto"
                      >
                        <ShoppingCart size={14} />
                        <span className="hidden xs:inline">Add to Cart</span>
                        <span className="xs:hidden">Cart</span>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // List View - Mobile Responsive
          <div className="space-y-3 sm:space-y-4">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = product.discount && product.discount > 0;
              
              return (
                <Link key={product._id} href={`/product/${product._id}`} className="group">
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-lg transition">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.productImgUrls?.[0] ? (
                          <img
                            src={getImageUrl(product.productImgUrls[0])}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                        {hasDiscount && (
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded">
                            {product.discount}%
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 line-clamp-2 group-hover:text-orange-600 transition">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm mb-1.5 line-clamp-1 sm:line-clamp-2">{product.description}</p>
                        
                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-2">
                          {product.category && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {typeof product.category === 'object' ? product.category.name : product.category}
                            </span>
                          )}
                          {product.colors?.length > 0 && (
                            <span className="text-xs text-gray-500">
                              Colors: {product.colors.slice(0, 2).join(", ")}{product.colors.length > 2 && "..."}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-base sm:text-lg font-bold text-orange-600">₹{discountedPrice.toFixed(2)}</span>
                            {hasDiscount && (
                              <span className="ml-1.5 text-xs text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleAddToCart(product._id, e)}
                            disabled={!product.isAvailable || product.stock === 0}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            <ShoppingCart size={14} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary (ERROR FIX)
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}