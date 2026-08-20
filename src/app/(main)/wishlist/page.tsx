"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { resolveProductImage } from "@/lib/imageHelper";
import ProductImage from "@/components/ProductImage";

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  productImgUrls?: string[];
  images?: string[];
  stock: number;
  isAvailable: boolean;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const savedWishlist = localStorage.getItem("wishlist");
      const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : [];
      
      if (wishlistIds.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/product/getAll`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const rawList = Array.isArray(result.data) ? result.data : result.data?.items || [];
        const filteredItems = rawList.filter(
          (product: any) => wishlistIds.includes(product._id) && product.isAvailable !== false && !product.isArchived
        );
        setWishlistItems(filteredItems);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (discount && discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(productId);
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
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const removeFromWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemovingId(productId);
    const savedWishlist = localStorage.getItem("wishlist");
    let wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : [];
    wishlistIds = wishlistIds.filter((id: string) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
    
    // Update state
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
    toast.success("Removed from wishlist");
    setRemovingId(null);
  };

  const clearAllWishlist = () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      localStorage.setItem("wishlist", JSON.stringify([]));
      setWishlistItems([]);
      toast.success("Wishlist cleared");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-[26px] sm:text-[30px] font-extrabold text-gray-900 dark:text-white tracking-tight">My Wishlist</h1>
            <p className="text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 mt-0.5">Products you've saved for later</p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={clearAllWishlist}
              className="text-red-500 hover:text-red-600 text-[13px] sm:text-[14px] font-medium flex items-center gap-1 py-1.5 px-3 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <Trash2 size={15} />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-10 text-center">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Save your favorite items here to buy them later</p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-full text-[14px] font-semibold hover:shadow transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* 2 cols on mobile, 3 sm, 4 md/lg, 5 xl */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
              {wishlistItems.map((item) => {
                const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
                const hasDiscount = !!(item.discount && item.discount > 0);
                const isOutOfStock = item.stock === 0 || !item.isAvailable;

                return (
                  <div key={item._id} className="group h-full flex flex-col justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-850 p-2.5 flex items-center justify-center overflow-hidden">
                      <Link href={`/product/${item._id}`} className="w-full h-full relative block">
                        <ProductImage
                          product={item}
                          alt={item.name}
                          fill
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                          {item.discount}% OFF
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                          <span className="bg-gray-900/90 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => removeFromWishlist(item._id, e)}
                        aria-label="Remove from wishlist"
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 shadow hover:scale-110 active:scale-95 transition text-red-500"
                      >
                        {removingId === item._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/product/${item._id}`}>
                          <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 min-h-[40px] leading-snug hover:text-orange-600 transition">
                            {item.name}
                          </h3>
                        </Link>

                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="text-[18px] sm:text-[19px] font-bold text-gray-900 dark:text-white">
                            ₹{Math.round(discountedPrice).toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                              ₹{Math.round(item.price).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(item._id, e)}
                        disabled={isOutOfStock || addingToCart === item._id}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 rounded-lg text-[13px] sm:text-[14px] font-medium hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
                      >
                        {addingToCart === item._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingCart size={14} />
                        )}
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wishlist Stats */}
            <div className="mt-8 p-3.5 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-[13px] sm:text-[14px] text-gray-600 dark:text-gray-400">
                You have <span className="font-bold text-orange-600">{wishlistItems.length}</span> items in your wishlist
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}