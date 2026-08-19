"use client";

import {
  Clock,
  Heart,
  ShoppingCart,
  Tag,
  Sparkles,
  Filter,
  ChevronDown,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";

interface Product {
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

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    fetchNewProducts();
    // Load wishlist
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist:", e);
      }
    }
  }, []);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith('http')) return url;
    return `${API_URL}/uploads/${url}`;
  };

  const fetchNewProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/product/getAll`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const rawList = Array.isArray(result.data) ? result.data : result.data?.items || [];
        const availableProducts = rawList.filter((p: any) => p.isAvailable !== false && !p.isArchived);
        const sortedProducts = availableProducts.sort((a: any, b: any) => {
          return (b.createdAt || b._id || "").localeCompare(a.createdAt || a._id || "");
        });
        setProducts(sortedProducts.slice(0, 20));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load new arrivals");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
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
        body: JSON.stringify({
          quantity: 1,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Added to cart");
        window.dispatchEvent(new Event("cartUpdated"));
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred");
    }
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    let newWishlist;
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
      toast.success("Removed from wishlist", { icon: "💔" });
    } else {
      newWishlist = [...wishlist, productId];
      toast.success("Added to wishlist", { icon: "❤️" });
    }
    
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-16">
      {/* Hero Section: 30–36px Heading */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 py-12 md:py-16 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-2.5 bg-white/10 rounded-xl backdrop-blur-md mb-4 border border-white/20 shadow-md">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-[28px] sm:text-[32px] md:text-[36px] font-extrabold mb-3 tracking-tight">
            New Arrivals
          </h1>
          <p className="text-[14px] sm:text-[16px] text-orange-100 max-w-xl mx-auto leading-relaxed">
            Discover the latest sports gear & equipment fresh in stock across Kashmir
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 -mt-6 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-4 sm:p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-gray-900 dark:text-white">Fresh Drops</h2>
            <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">Showing the latest {products.length} products</p>
          </div>
        </div>

        {/* Products Grid: 2 cols on mobile, 3 sm, 4 md/lg, 5 xl */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-200 border-t-orange-600 mb-3"></div>
            <p className="text-sm text-gray-500 font-medium">Loading new arrivals...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
            {products.map((product) => {
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
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No New Arrivals Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Check back soon for the latest sports equipment and apparel.
            </p>
            <Link href="/products" className="inline-flex bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full text-[14px] font-semibold hover:bg-orange-600 dark:hover:bg-orange-500 transition shadow-xs">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
