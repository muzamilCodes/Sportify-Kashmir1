"use client";

import { Suspense, useMemo, useEffect, useState, useCallback } from "react";
import { Grid, List, Search, ChevronDown, SlidersHorizontal, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import { cachedJson, setCachedJson } from "@/lib/clientCache";
import { resolveProductImage } from "@/lib/imageHelper";
import ProductImage from "@/components/ProductImage";

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
  tags?: string[];
  stock: number;
  rating?: number;
  reviewCount?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

const ITEMS_PER_PAGE = 16;

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
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
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const getImageUrl = useCallback((url: string) => {
    return resolveProductImage(url);
  }, []);

  const calculateDiscountedPrice = useCallback((price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [prodRes, catRes, brandRes] = await Promise.all([
          cachedJson<{ success: boolean; data: any }>(`${API_URL}/product/getAll`),
          cachedJson<{ success: boolean; data: any }>(`${API_URL}/category/all`).catch(() => ({ success: false, data: [] })),
          cachedJson<{ success: boolean; data: any }>(`${API_URL}/brand/all`).catch(() => ({ success: false, data: [] })),
        ]);

        if (isMounted) {
          if (prodRes.success && prodRes.data) {
            const rawList = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data?.items || [];
            rawList.forEach((p: any) => {
              if (p?._id) {
                setCachedJson(`${API_URL}/product/get/${p._id}`, { success: true, data: p }, 120_000);
              }
            });
            const availableProducts = rawList.filter(
              (product: any) => product.isAvailable !== false && !product.isArchived
            );
            setProducts(availableProducts);
          }
          if (catRes.success && catRes.data) {
            setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.items || []);
          }
          if (brandRes.success && brandRes.data) {
            setBrands(Array.isArray(brandRes.data) ? brandRes.data : brandRes.data?.items || []);
          }
        }
      } catch (error) {
        console.error("Error loading products data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        setWishlist([]);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || searchParams.get("q") || "";
    const currentCategory = searchParams.get("category") || "all";
    setSearchTerm(currentSearch);
    setSelectedCategory(currentCategory);
  }, [searchParams]);

  const allSizes = useMemo(() => {
    return Array.from(new Set(products.flatMap((product) => product.sizes || []))).sort();
  }, [products]);

  const allColors = useMemo(() => {
    return Array.from(new Set(products.flatMap((product) => product.colors || []))).sort();
  }, [products]);

  // High performance memoized filtering & sorting
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const words = q.split(/\s+/).filter(Boolean);

      filtered = filtered.filter((product) => {
        const catName = typeof product.category === "object" ? product.category?.name?.toLowerCase() || "" : String(product.category || "").toLowerCase();
        const brandName = typeof product.brand === "object" ? product.brand?.name?.toLowerCase() || "" : String(product.brand || "").toLowerCase();
        const tags = Array.isArray(product.tags) ? product.tags.join(" ").toLowerCase() : "";
        const name = (product.name || "").toLowerCase();
        const desc = (product.description || "").toLowerCase();
        const fullContent = `${name} ${desc} ${catName} ${brandName} ${tags}`;

        // Sport category aliases
        if (q === "cricket" || q === "willow") {
          if (
            fullContent.includes("cricket") ||
            fullContent.includes("bat") ||
            fullContent.includes("willow") ||
            fullContent.includes("sg") ||
            fullContent.includes("ss") ||
            fullContent.includes("leather") ||
            fullContent.includes("ball") ||
            fullContent.includes("wicket")
          ) {
            return true;
          }
        }
        if (q === "football" || q === "soccer") {
          if (
            fullContent.includes("football") ||
            fullContent.includes("stud") ||
            fullContent.includes("soccer") ||
            fullContent.includes("turf") ||
            fullContent.includes("nivia")
          ) {
            return true;
          }
        }
        if (q === "badminton") {
          if (
            fullContent.includes("badminton") ||
            fullContent.includes("racket") ||
            fullContent.includes("shuttle") ||
            fullContent.includes("yonex") ||
            fullContent.includes("lining")
          ) {
            return true;
          }
        }
        if (q === "gym" || q === "fitness") {
          if (
            fullContent.includes("gym") ||
            fullContent.includes("fitness") ||
            fullContent.includes("dumbbell") ||
            fullContent.includes("weight") ||
            fullContent.includes("bench") ||
            fullContent.includes("workout")
          ) {
            return true;
          }
        }

        return words.every((w) => fullContent.includes(w));
      });
    }

    if (selectedCategory !== "all") {
      const catLower = selectedCategory.toLowerCase();
      filtered = filtered.filter((product) => {
        const catId = typeof product.category === "object" ? product.category?._id : product.category;
        const catName = typeof product.category === "object" ? product.category?.name?.toLowerCase() : String(product.category || "").toLowerCase();
        return (
          catId === selectedCategory ||
          (catName && (catName === catLower || catName.includes(catLower) || catLower.includes(catName)))
        );
      });
    }

    if (selectedBrand !== "all") {
      filtered = filtered.filter((product) =>
        typeof product.brand === "object" ? product.brand?._id === selectedBrand : product.brand === selectedBrand
      );
    }

    if (selectedSize !== "all") {
      filtered = filtered.filter((product) => product.sizes?.includes(selectedSize));
    }

    if (selectedColor !== "all") {
      filtered = filtered.filter((product) => product.colors?.includes(selectedColor));
    }

    if (minRating > 0) {
      filtered = filtered.filter((product) => (product.rating || 4.5) >= minRating);
    }

    if (availability === "in-stock") {
      filtered = filtered.filter((product) => product.stock > 0 && product.isAvailable);
    } else if (availability === "out-of-stock") {
      filtered = filtered.filter((product) => product.stock === 0 || !product.isAvailable);
    }

    if (priceRange.min > 0 || priceRange.max < 50000) {
      filtered = filtered.filter(
        (product) => product.price >= priceRange.min && product.price <= priceRange.max
      );
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => (b._id?.localeCompare(a._id) || 0));
        break;
    }

    return sorted;
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedSize, selectedColor, minRating, availability, priceRange, sortBy]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrand, selectedSize, selectedColor, minRating, availability, priceRange, sortBy]);

  // Paginated items for DOM reduction & super fast rendering
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const suggestions = useMemo(() => {
    if (searchTerm.trim().length < 2) return [];
    const q = searchTerm.toLowerCase();
    return products
      .filter((product) => product.name.toLowerCase().includes(q))
      .slice(0, 4);
  }, [products, searchTerm]);

  const handleAddToCart = useCallback(async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        window.location.href = "/login";
        return;
      }

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
      toast.error("Failed to add to cart");
    }
  }, [API_URL]);

  const toggleWishlist = useCallback((productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      let updated: string[];
      if (prev.includes(productId)) {
        updated = prev.filter((id) => id !== productId);
        toast.success("Removed from wishlist");
      } else {
        updated = [...prev, productId];
        toast.success("Added to wishlist");
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedSize("all");
    setSelectedColor("all");
    setMinRating(0);
    setAvailability("all");
    setPriceRange({ min: 0, max: 50000 });
    setSortBy("newest");
    setCurrentPage(1);
  }, []);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "discount", label: "Biggest Discount" },
  ];

  return (
    <div className="sk-page-shell">
      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-8 md:py-11">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_45%)] pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1.5 tracking-tight text-white">
            Shop All Products
          </h1>
          <p className="text-sm sm:text-base text-white/95 max-w-xl mx-auto font-medium">
            Discover premium cricket, football, and athletic sports gear across Kashmir
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* ─── Search & Controls Bar ─── */}
        <div className="bg-white/95 dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 mb-4 sticky top-16 z-20 backdrop-blur-md">
          {/* Row 1: Search */}
          <div className="relative mb-3">
            <label htmlFor="products-search-input" className="sr-only">
              Search products by name or category
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={17} />
            <input
              id="products-search-input"
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/60 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl divide-y divide-gray-100 dark:divide-gray-700">
                {suggestions.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product._id}`}
                    className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                  >
                    <div className="relative h-9 w-9 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                      <ProductImage
                        product={product}
                        alt={product.name}
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">₹{calculateDiscountedPrice(product.price, product.discount).toFixed(0)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Row 2: Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative flex-1 min-w-[140px]">
              <label htmlFor="products-sort-select" className="sr-only">
                Sort products
              </label>
              <select
                id="products-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="w-full appearance-none pl-3 pr-8 py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 cursor-pointer font-medium"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={15} />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-gray-300 dark:border-gray-600 rounded-xl p-1 bg-white dark:bg-gray-700" role="group" aria-label="Product layout mode">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Switch to grid view"
                aria-pressed={viewMode === "grid"}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Switch to list view"
                aria-pressed={viewMode === "list"}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filter options"
              aria-expanded={showFilters}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition cursor-pointer ${
                showFilters
                  ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {(selectedCategory !== "all" || searchTerm || priceRange.min > 0 || priceRange.max < 50000) && (
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* ─── Expanded Filters ─── */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Filter */}
                <div>
                  <label htmlFor="filter-category" className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Category
                  </label>
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Filter by category"
                    className="w-full p-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Price Range (₹)
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                      <input
                        id="filter-price-min"
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        aria-label="Minimum price"
                        className="w-full pl-6 pr-2 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Min"
                      />
                    </div>
                    <span className="text-gray-500 text-xs">-</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">₹</span>
                      <input
                        id="filter-price-max"
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        aria-label="Maximum price"
                        className="w-full pl-6 pr-2 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Brand */}
                <div>
                  <label htmlFor="filter-brand" className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Brand
                  </label>
                  <select
                    id="filter-brand"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    aria-label="Filter by brand"
                    className="w-full p-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Brands</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label htmlFor="filter-rating" className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Rating
                  </label>
                  <select
                    id="filter-rating"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    aria-label="Filter by minimum rating"
                    className="w-full p-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={0}>Any rating</option>
                    <option value={4}>4★ & above</option>
                    <option value={3}>3★ & above</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label htmlFor="filter-availability" className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1">
                    Availability
                  </label>
                  <select
                    id="filter-availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    aria-label="Filter by availability"
                    className="w-full p-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All products</option>
                    <option value="in-stock">In stock</option>
                    <option value="out-of-stock">Out of stock</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                type="button"
                onClick={clearFilters}
                className="w-full py-2 text-xs font-bold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* ─── Results Count Summary ─── */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
            Showing <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of{" "}
            <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length}</span> items
          </p>
        </div>

        {/* ─── Product Grid View ─── */}
        {loading ? (
          /* Shimmer Skeleton Grid to prevent CLS */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-14 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-7 h-7 text-gray-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">No products match your filters</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Try clearing filters or searching for something else</p>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-orange-500 text-white px-5 py-2 text-xs font-bold rounded-xl hover:bg-orange-600 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {paginatedProducts.map((product, index) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = Boolean(product.discount && product.discount > 0);

              return (
                <ProductCard
                  key={product._id}
                  product={product}
                  priority={index < 4 && currentPage === 1}
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
            {paginatedProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = Boolean(product.discount && product.discount > 0);

              return (
                <div key={product._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition">
                  <div className="flex gap-3 sm:gap-4">
                    <Link href={`/product/${product._id}`} className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 dark:bg-gray-850 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2">
                      <ProductImage
                        product={product}
                        alt={product.name}
                        fill
                        className="w-full h-full object-contain"
                      />
                      {hasDiscount && (
                        <div className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                          {product.discount}% OFF
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${product._id}`}>
                          <h2 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-orange-600 transition">
                            {product.name}
                          </h2>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div>
                          <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            ₹{Math.round(discountedPrice).toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              ₹{Math.round(product.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(product._id, e)}
                          disabled={!product.isAvailable || product.stock === 0}
                          aria-label={`Add ${product.name} to cart`}
                          className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs sm:text-sm rounded-xl font-semibold hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
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

        {/* ─── Pagination Controls ─── */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.max(p - 1, 1));
                window.scrollTo({ top: 180, behavior: "smooth" });
              }}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 180, behavior: "smooth" });
                      }}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={currentPage === pageNum ? "page" : undefined}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xs"
                          : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentPage((p) => Math.min(p + 1, totalPages));
                window.scrollTo({ top: 180, behavior: "smooth" });
              }}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-orange-500 border-t-transparent" />
            <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
