"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, 
  Shield, 
  Clock, 
  Award,
  ChevronRight,
  ArrowRight,
  ShoppingCart
} from "lucide-react";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { ProductGridSkeleton } from "@/components/shared/SkeletonLoaders";
import { resolveProductImage } from "@/lib/imageHelper";

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
  stock: number;
  category?: { _id: string; name: string } | string;
  onSale?: boolean;
  createdAt: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const getImageUrl = (url: string) => {
    return resolveProductImage(url);
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  useEffect(() => {
    fetchProducts();
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
        const rawList = Array.isArray(result.data) ? result.data : result.data?.items || [];
        const availableProducts = rawList.filter(
          (product: any) => product.isAvailable !== false && !product.isArchived
        );
        setProducts(availableProducts);
        
        // Featured products (newest first, 5 products)
        const featured = [...availableProducts]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);
        setFeaturedProducts(featured.length > 0 ? featured : availableProducts.slice(0, 5));
        
        // Sale products (products with discount or onSale flag)
        const sale = availableProducts.filter((p: any) => p.onSale === true || (p.discount && p.discount > 0)).slice(0, 5);
        setSaleProducts(sale);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to add items to cart");
        window.location.href = "/login";
        return;
      }

      const headers: Record<string, string> = { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };

      const response = await fetch(`${API_URL}/cart/addtoCart/${productId}`, {
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

  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 10);
  };

  const showLoadMore = products.length > visibleProducts;

  // Skeleton loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        {/* Hero Skeleton */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
          <div className="container mx-auto px-4 relative z-10 py-12">
            <div className="text-center space-y-3 animate-pulse">
              <div className="h-10 w-2/3 mx-auto skeleton-shimmer rounded-lg" />
              <div className="h-5 w-1/2 mx-auto skeleton-shimmer rounded-lg" />
              <div className="flex justify-center gap-3 mt-6">
                <div className="h-11 w-36 skeleton-shimmer rounded-full" />
                <div className="h-11 w-36 skeleton-shimmer rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-3 sm:px-4 py-8 space-y-12">
          <div>
            <div className="h-7 w-52 skeleton-shimmer rounded-lg mb-4" />
            <ProductGridSkeleton count={5} />
          </div>
          <div>
            <div className="h-7 w-48 skeleton-shimmer rounded-lg mb-4" />
            <ProductGridSkeleton count={10} />
          </div>
        </div>
      </div>
    );
  }

  const displayedProducts = products.slice(0, visibleProducts);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero Section: Main Heading 30–36px */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 dark:bg-orange-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200 dark:bg-red-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 relative z-10 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
              <h1 className="text-[28px] sm:text-[32px] md:text-[36px] font-extrabold mb-4 animate-fade-in-up leading-tight tracking-tight">
                <span className="text-gray-900 dark:text-white">Elevate Your</span>{" "}
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                  Game in Kashmir
                </span>
              </h1>
              <p className="text-[14px] sm:text-[16px] mb-6 text-gray-600 dark:text-gray-300 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
                Premium sports gear & equipment delivered across Kashmir with unmatched speed. 100% authentic products guaranteed.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/products" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-full text-[14px] sm:text-[15px] font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                  Shop Collection
                </Link>
                <Link href="/sale" className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-gray-700 text-orange-600 dark:text-orange-400 px-6 py-2.5 rounded-full text-[14px] sm:text-[15px] font-semibold hover:border-orange-500 transition-all duration-200">
                  View Sale Deals
                </Link>
              </div>
            </div>

            {/* Right: Image Content */}
            <div className="relative animate-fade-in-up flex justify-center" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-pink-200 dark:from-orange-500/20 dark:to-pink-500/20 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-spin-slow opacity-60"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/hero-sports.png" 
                  alt="Premium Sports Equipment" 
                  className="absolute inset-0 w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-3 sm:px-4 py-8">
        {/* Featured Products Section: Section Heading 24–28px */}
        {featuredProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
                  Featured Products
                </h2>
                <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">New arrivals & trending picks</p>
              </div>
              <Link href="/products" className="group text-[13px] sm:text-[14px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 transition-all">
                View All <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            {/* 2 cols mobile, 3 sm, 4 md/lg, 5 xl */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
              {featuredProducts.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                const hasDiscount = !!(product.discount && product.discount > 0);
                
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
          </section>
        )}

        {/* Flash Sale Banner & Grid */}
        {saleProducts.length > 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-5 sm:p-6 mb-6 shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-[22px] sm:text-[26px] md:text-[28px] font-bold text-white flex items-center gap-2">
                    <span>🔥</span> Flash Sale
                  </h2>
                  <p className="text-white/90 text-[13px] sm:text-[14px] mt-0.5">Limited time offers with discounts up to 50%</p>
                </div>
                <Link href="/sale" className="bg-white text-red-600 px-5 py-2 rounded-full text-[13px] sm:text-[14px] font-bold hover:bg-gray-50 transition shadow-sm flex items-center gap-1">
                  View All Deals <ChevronRight size={16} />
                </Link>
              </div>
            </div>
            {/* 2 cols mobile, 3 sm, 4 md/lg, 5 xl */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
              {saleProducts.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                const hasDiscount = !!(product.discount && product.discount > 0);
                
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
          </section>
        )}

        {/* All Products Section: Section Heading 24–28px */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
                All Products
              </h2>
              <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">Explore our complete catalog</p>
            </div>
            <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full font-semibold text-[12px] sm:text-[13px]">
              {products.length} Items
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No products found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Products will appear here once added</p>
            </div>
          ) : (
            <>
              {/* 2 cols mobile, 3 sm, 4 md/lg, 5 xl */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
                {displayedProducts.map((product) => {
                  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                  const hasDiscount = !!(product.discount && product.discount > 0);
                  
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

              {/* Load More Button: Button Text 14–15px */}
              {showLoadMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMoreProducts}
                    className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full text-[14px] font-semibold hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition shadow-sm"
                  >
                    Load More Products
                    <ArrowRight size={16} />
                  </button>
                  <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 mt-2">
                    Showing {displayedProducts.length} of {products.length} products
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        <RecentlyViewed products={products} />

        {/* Features Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2.5">
              <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-[14px] mb-0.5">Free Delivery</h3>
            <p className="text-gray-500 dark:text-gray-400 text-[12px]">On orders above ₹999</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2.5">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-[14px] mb-0.5">Secure Payment</h3>
            <p className="text-gray-500 dark:text-gray-400 text-[12px]">100% secure checkout</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2.5">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-[14px] mb-0.5">Fast Delivery</h3>
            <p className="text-gray-500 dark:text-gray-400 text-[12px]">2-3 days across Kashmir</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2.5">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-[14px] mb-0.5">Authentic Gear</h3>
            <p className="text-gray-500 dark:text-gray-400 text-[12px]">100% genuine guaranteed</p>
          </div>
        </section>
      </div>
    </div>
  );
}
