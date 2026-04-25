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
  ArrowRight
} from "lucide-react";
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getAll`);
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

  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 8);
  };

  const showLoadMore = products.length > visibleProducts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  const displayedProducts = products.slice(0, visibleProducts);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
              Sportify Kashmir
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-orange-100">
              Premium Sports Equipment & Gear
            </p>
            <p className="text-lg mb-8 text-white/80">
              Kashmir's fastest sports delivery | 100% authentic products | Free shipping above ₹999
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">
                Shop Now
              </Link>
              <Link href="/sale" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">
                View Sale
              </Link>
            </div>
          </div>
        </div>
        {/* Wave SVG */}
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64L1440 120L1380 120C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120L0 120Z" fill="#F9FAFB"/>
        </svg>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-1">New arrivals & popular picks</p>
              </div>
              <Link href="/products" className="text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium">
                View All <ChevronRight size={18} />
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
          <section className="mb-16">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">🔥 Flash Sale</h2>
                  <p className="text-gray-600 mt-1">Limited time offers up to 50% off</p>
                </div>
                <Link href="/sale" className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition flex items-center gap-1">
                  View All <ChevronRight size={16} />
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
        <section>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">All Products</h2>
              <p className="text-gray-600 mt-1">Browse our complete collection</p>
            </div>
            <p className="text-sm text-gray-500">{products.length} products available</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Products will appear here once added by admin</p>
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
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition shadow-md"
                  >
                    Load More Products
                    <ArrowRight size={18} />
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    Showing {visibleProducts} of {products.length} products
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Features Section */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Free Delivery</h3>
            <p className="text-gray-600 text-sm">On orders above ₹999</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Secure Payment</h3>
            <p className="text-gray-600 text-sm">100% secure transactions</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">2-3 days across Kashmir</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Authentic Products</h3>
            <p className="text-gray-600 text-sm">100% genuine guarantee</p>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
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
  handleAddToCart: (id: string, e: React.MouseEvent) => void; 
  toggleWishlist: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <Link href={`/product/${product._id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.productImgUrls?.[0] ? (
            <img
              src={getImageUrl(product.productImgUrls[0])}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
          )}
          
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {product.discount}% OFF
            </div>
          )}

          <button
            onClick={(e) => toggleWishlist(product._id, e)}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:shadow-lg transition"
          >
            <Heart size={14} className={wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"} />
          </button>

          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              Only {product.stock} left
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <Star className="w-3 h-3 text-gray-300" />
            <span className="text-xs text-gray-500 ml-1">(128)</span>
          </div>

          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <span className="text-base font-bold text-orange-600">₹{discountedPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={(e) => handleAddToCart(product._id, e)}
            disabled={!product.isAvailable || product.stock === 0}
            className="w-full bg-gray-900 text-white py-1.5 text-sm rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-1 mt-auto"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}