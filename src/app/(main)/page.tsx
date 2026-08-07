"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  Clock, 
  Award,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { ProductGridSkeleton } from "@/components/shared/SkeletonLoaders";

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
  const [visibleProducts, setVisibleProducts] = useState(8); // Initially show 8 products
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

  const getCategoryName = (category: Product['category']): string => {
    if (!category) return '';
    if (typeof category === 'object' && category !== null) {
      return category.name || '';
    }
    if (typeof category === 'string') return category;
    return '';
  };

  useEffect(() => {
    fetchProducts();
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
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
        
        // Featured products (newest first)
        const featured = [...availableProducts]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);
        setFeaturedProducts(featured);
        
        // Sale products
        const sale = availableProducts.filter((p: any) => p.onSale === true).slice(0, 8);
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
      const cartId = localStorage.getItem("cartId");

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body: any = { quantity: 1 };
      if (!token && cartId) body.cartId = cartId;

      const response = await fetch(`${API_URL}/cart/addtoCart/${productId}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        if (!token && result.data?._id) localStorage.setItem("cartId", result.data._id);
        toast.success("Added to cart!");
        
        // Dispatch event to update cart counter in header
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

  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 8);
  };

  const showLoadMore = products.length > visibleProducts;

  // ✅ Skeleton loading state instead of basic spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        {/* Hero Skeleton */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
          <div className="container mx-auto px-4 relative z-10 py-16">
            <div className="text-center space-y-4 animate-pulse">
              <div className="h-12 w-2/3 mx-auto skeleton-shimmer rounded-lg" />
              <div className="h-6 w-1/2 mx-auto skeleton-shimmer rounded-lg" />
              <div className="flex justify-center gap-4 mt-8">
                <div className="h-14 w-44 skeleton-shimmer rounded-full" />
                <div className="h-14 w-44 skeleton-shimmer rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 space-y-16">
          <div>
            <div className="h-8 w-64 skeleton-shimmer rounded-lg mb-6" />
            <ProductGridSkeleton count={4} />
          </div>
          <div>
            <div className="h-8 w-48 skeleton-shimmer rounded-lg mb-6" />
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      </div>
    );
  }

  const displayedProducts = products.slice(0, visibleProducts);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 dark:bg-orange-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200 dark:bg-red-500/10 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="absolute top-1/4 left-[10%] w-4 h-4 bg-orange-500 rounded-full animate-float"></div>
        <div className="absolute top-2/3 right-[15%] w-6 h-6 bg-red-500 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-[20%] w-3 h-3 bg-yellow-500 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up leading-tight">
                <span className="text-gray-900 dark:text-white">Elevate Your</span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">Game in Kashmir</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-gray-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Premium Sports Equipment & Gear with Kashmir&apos;s fastest delivery. 
                100% authentic products guaranteed.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Link href="/products" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  Shop Collection
                </Link>
                <Link href="/sale" className="bg-white dark:bg-gray-800 border-2 border-orange-100 dark:border-gray-700 text-orange-600 dark:text-orange-400 px-8 py-4 rounded-full font-bold hover:border-orange-500 transition-all duration-300">
                  View Sale Deals
                </Link>
              </div>
            </div>

            {/* Right: Image Content */}
            <div className="relative animate-fade-in-up flex justify-center" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-lg aspect-square">
                {/* Decorative blob behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-pink-200 dark:from-orange-500/20 dark:to-pink-500/20 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] animate-spin-slow opacity-60"></div>
                <img 
                  src="/hero-sports.png" 
                  alt="Premium Sports Equipment" 
                  className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Wave SVG */}
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64L1440 120L1380 120C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120L0 120Z" fill="var(--color-bg-primary)"/>
        </svg>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="mb-16 page-enter">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  Featured Products
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">New arrivals & popular picks</p>
              </div>
              <Link href="/products" className="group text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1 font-bold transition-all">
                View All <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 4).map((product) => {
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

        {/* Sale Section */}
        {saleProducts.length > 0 && (
          <section className="mb-16 page-enter">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 mb-10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:opacity-20 transition-opacity"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-2">
                    <span className="animate-bounce">🔥</span> Flash Sale
                  </h2>
                  <p className="text-white/90 mt-2 font-medium text-lg">Limited time offers up to 50% off</p>
                </div>
                <Link href="/sale" className="bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-gray-50 hover:shadow-lg transition flex items-center gap-1 hover-lift">
                  View All Deals <ChevronRight size={18} />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {saleProducts.slice(0, 4).map((product) => {
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

        {/* All Products Section */}
        <section className="page-enter">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                All Products
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Browse our complete collection</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
              {products.length} Items
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 surface-card rounded-xl">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No products found</h3>
              <p className="text-[var(--color-text-secondary)]">Products will appear here once added by admin</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

              {/* Load More Button */}
              {showLoadMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={loadMoreProducts}
                    className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition shadow-md"
                  >
                    Load More Products
                    <ArrowRight size={18} />
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    Showing {visibleProducts} of {products.length} products
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Features Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="surface-card rounded-xl p-6 text-center">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Free Delivery</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">On orders above ₹999</p>
          </div>
          <div className="surface-card rounded-xl p-6 text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Secure Payment</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">100% secure transactions</p>
          </div>
          <div className="surface-card rounded-xl p-6 text-center">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Fast Delivery</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">2-3 days across Kashmir</p>
          </div>
          <div className="surface-card rounded-xl p-6 text-center">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Authentic Products</h3>
            <p className="text-[var(--color-text-secondary)] text-sm">100% genuine guarantee</p>
          </div>
        </section>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  discountedPrice, 
  hasDiscount, 
  wishlist, 
  getImageUrl, 
  handleAddToCart, 
  toggleWishlist 
}: { 
  product: Product; 
  discountedPrice: number; 
  hasDiscount: boolean; 
  wishlist: string[]; 
  getImageUrl: (url: string) => string; 
  handleAddToCart: (id: string, e: React.MouseEvent) => Promise<void> | void; 
  toggleWishlist: (id: string, e: React.MouseEvent) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);

  const onAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    await handleAddToCart(product._id, e);
    setIsAdding(false);
  };

  return (
    <Link href={`/product/${product._id}`} className="group h-full">
      <div className="surface-card rounded-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-2 h-full flex flex-col hover:shadow-2xl dark:hover:shadow-orange-500/5">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden">
          {product.productImgUrls?.[0] ? (
            <img
              src={getImageUrl(product.productImgUrls[0])}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">No image</div>
          )}
          
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {product.discount}% OFF
            </div>
          )}

          <button
            onClick={(e) => toggleWishlist(product._id, e)}
            className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition"
          >
            <Heart size={14} className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400"} />
          </button>

          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              Only {product.stock} left
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-[var(--color-text-primary)] text-base mb-1.5 line-clamp-2 min-h-[44px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 transition-all">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 text-gray-300 dark:text-gray-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(128)</span>
          </div>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xl font-black text-gradient">
              ₹{discountedPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm font-medium text-gray-400 dark:text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={onAddToCartClick}
            disabled={!product.isAvailable || product.stock === 0 || isAdding}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-1.5 text-sm rounded-lg font-medium hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mt-auto hover-lift"
          >
            {isAdding ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}