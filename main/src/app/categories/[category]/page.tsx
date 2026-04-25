"use client";

import { Filter, Grid, List, Search, ChevronDown, Heart, ShoppingCart, Star, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  category?: { _id: string; name: string } | string;
  stock: number;
  onSale?: boolean;
  subcategory?: string; // Add subcategory field
}

// Subcategories for each main category
const subcategoriesMap: { [key: string]: string[] } = {
  cricket: ["Bats", "Balls", "Pads", "Gloves", "Helmets", "Shoes", "Clothing"],
  football: ["Boots", "Balls", "Jerseys", "Shin Guards", "Goal Gloves", "Socks"],
  basketball: ["Shoes", "Balls", "Jerseys", "Hoops", "Accessories"],
  tennis: ["Rackets", "Balls", "Strings", "Grips", "Shoes", "Bags"],
  fitness: ["Dumbbells", "Yoga Mats", "Gym Wear", "Supplements", "Bench", "Accessories"],
  apparel: ["Jerseys", "Shorts", "Tracksuits", "Compression Wear", "Socks", "Caps"],
};

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = params.category as string;
  const subcategoryParam = searchParams.get("subcategory");

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryParam);

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

  const getCategoryName = (category: Product['category']): string => {
    if (!category) return '';
    if (typeof category === 'object' && category !== null) {
      return category.name || '';
    }
    if (typeof category === 'string') return category;
    return '';
  };

  const categoryTitle = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  const subcategories = subcategoriesMap[categorySlug.toLowerCase()] || [];

  useEffect(() => {
    fetchProductsByCategory();
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [categorySlug]);

  useEffect(() => {
    setSelectedSubcategory(subcategoryParam);
  }, [subcategoryParam]);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/category/${categorySlug}`);
      const result = await response.json();

      if (result.success && result.data) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters, sorting, and subcategory filter
  useEffect(() => {
    let filtered = [...products];

    // Subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter((product) => {
        // Check if product name contains subcategory keyword
        const productName = product.name.toLowerCase();
        const subcategoryLower = selectedSubcategory.toLowerCase();
        
        // Match based on keywords
        if (subcategoryLower === "bats") {
          return productName.includes("bat") || productName.includes("batting");
        }
        if (subcategoryLower === "balls") {
          return productName.includes("ball");
        }
        if (subcategoryLower === "pads") {
          return productName.includes("pad") || productName.includes("leg guard");
        }
        if (subcategoryLower === "gloves") {
          return productName.includes("glove") || productName.includes("batting glove");
        }
        if (subcategoryLower === "helmets") {
          return productName.includes("helmet");
        }
        if (subcategoryLower === "shoes") {
          return productName.includes("shoe") || productName.includes("boot");
        }
        if (subcategoryLower === "jerseys") {
          return productName.includes("jersey") || productName.includes("shirt");
        }
        return true;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(
      (product) => product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sorting
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
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [searchTerm, priceRange, products, sortBy, selectedSubcategory]);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const cartId = localStorage.getItem("cartId");

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body: any = { quantity: 1 };
      if (!token && cartId) body.cartId = cartId;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/addtoCart/${productId}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        if (!token && result.data?._id) localStorage.setItem("cartId", result.data._id);
        toast.success("Added to cart!");
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

  const handleSubcategoryClick = (subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      // Deselect if already selected
      router.push(`/categories/${categorySlug}`);
      setSelectedSubcategory(null);
    } else {
      router.push(`/categories/${categorySlug}?subcategory=${subcategory.toLowerCase()}`);
      setSelectedSubcategory(subcategory);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceRange({ min: 0, max: 50000 });
    setSortBy("newest");
    router.push(`/categories/${categorySlug}`);
    setSelectedSubcategory(null);
  };

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "discount", label: "Biggest Discount" },
  ];

  const getCategoryGradient = () => {
    const cat = categorySlug.toLowerCase();
    if (cat === "cricket") return "from-green-600 to-emerald-700";
    if (cat === "football") return "from-blue-600 to-indigo-700";
    if (cat === "basketball") return "from-orange-500 to-red-600";
    if (cat === "tennis") return "from-yellow-500 to-yellow-700";
    if (cat === "fitness") return "from-red-500 to-orange-600";
    if (cat === "apparel") return "from-pink-500 to-rose-600";
    return "from-gray-600 to-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${getCategoryGradient()} text-white py-8 md:py-12`}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2">{categoryTitle} Products</h1>
          <p className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto">
            Browse our premium collection of {categoryTitle.toLowerCase()} equipment and gear
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Subcategories Navigation - Like Amazon */}
        {subcategories.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border mb-4 sm:mb-6 overflow-x-auto">
            <div className="flex items-center gap-1 p-2 min-w-max">
              <span className="text-xs font-semibold text-gray-500 px-2">Shop by:</span>
              <button
                onClick={() => {
                  router.push(`/categories/${categorySlug}`);
                  setSelectedSubcategory(null);
                }}
                className={`px-3 py-1.5 text-sm rounded-full transition ${
                  !selectedSubcategory 
                    ? "bg-orange-500 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All {categoryTitle}
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubcategoryClick(sub)}
                  className={`px-3 py-1.5 text-sm rounded-full transition whitespace-nowrap ${
                    selectedSubcategory === sub
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6 sticky top-0 z-20">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${categoryTitle} products...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition ${showFilters ? "bg-orange-500 text-white border-orange-500" : "hover:bg-gray-50"}`}
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
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

        {/* Results Count */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{products.length}</span> products
          </p>
          {selectedSubcategory && (
            <p className="text-xs text-orange-600">
              Filtered by: <span className="font-semibold">{selectedSubcategory}</span>
            </p>
          )}
        </div>

        {/* Products Grid/List View */}
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
            <p className="text-sm text-gray-600 mb-4">
              {selectedSubcategory 
                ? `No ${selectedSubcategory.toLowerCase()} available in ${categoryTitle} category yet.` 
                : "Try adjusting your search or filter criteria"}
            </p>
            <button onClick={clearFilters} className="bg-orange-500 text-white px-5 py-2 text-sm rounded-lg">
              Clear Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = product.discount && product.discount > 0;
              
              return (
                <Link key={product._id} href={`/product/${product._id}`} className="group">
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group-hover:-translate-y-1 h-full flex flex-col">
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
                      
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {product.discount}%
                        </div>
                      )}

                      <button
                        onClick={(e) => toggleWishlist(product._id, e)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md"
                      >
                        <Heart size={14} className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"} />
                      </button>

                      {product.stock < 5 && product.stock > 0 && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          Only {product.stock}
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 min-h-[32px] group-hover:text-orange-600">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-orange-600">₹{discountedPrice.toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(product._id, e)}
                        disabled={!product.isAvailable || product.stock === 0}
                        className="w-full bg-gray-900 text-white py-1.5 text-xs sm:text-sm rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-1 mt-auto"
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
          <div className="space-y-3 sm:space-y-4">
            {filteredProducts.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = product.discount && product.discount > 0;
              
              return (
                <Link key={product._id} href={`/product/${product._id}`} className="group">
                  <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-3 sm:p-4 hover:shadow-lg transition">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.productImgUrls?.[0] ? (
                          <img src={getImageUrl(product.productImgUrls[0])} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                        {hasDiscount && (
                          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded">
                            {product.discount}%
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-0.5 line-clamp-2 group-hover:text-orange-600">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm mb-1.5 line-clamp-1 sm:line-clamp-2">{product.description}</p>

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