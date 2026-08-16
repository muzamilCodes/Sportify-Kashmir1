"use client";

import { ShoppingBag, ShoppingCart, Zap, Star, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export interface ProductItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  productImgUrls?: string[];
  images?: string[];
  category?: { _id: string; name: string } | string;
  isAvailable?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  onSale?: boolean;
}

interface ProductCardProps {
  product: ProductItem;
  showCategory?: boolean;
  discountedPrice?: number;
  hasDiscount?: boolean;
  wishlist?: string[];
  getImageUrl?: (url: string) => string;
  handleAddToCart?: (id: string, e: React.MouseEvent) => Promise<void> | void;
  handleBuyNow?: (id: string, e: React.MouseEvent) => Promise<void> | void;
  toggleWishlist?: (id: string, e: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  showCategory = false,
  discountedPrice,
  hasDiscount,
  wishlist = [],
  getImageUrl: customGetImageUrl,
  handleAddToCart: customAddToCart,
  handleBuyNow: customBuyNow,
  toggleWishlist: customToggleWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [localWishlist, setLocalWishlist] = useState<string[]>(wishlist);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const discountPercent = product.discount ?? 0;
  const isDiscounted = hasDiscount !== undefined ? hasDiscount : discountPercent > 0;
  
  const resolvedDiscountPrice = discountedPrice ?? (
    isDiscounted ? product.price - (product.price * discountPercent) / 100 : product.price
  );

  const isWishlisted = (localWishlist.length > 0 ? localWishlist : wishlist).includes(product._id);

  const imageUrls = product.productImgUrls || product.images || [];
  const rawImage = imageUrls.length > 0 ? imageUrls[0] : null;

  const resolveImageUrl = (url: string | null) => {
    if (!url) return "/placeholder.jpg";
    if (customGetImageUrl) return customGetImageUrl(url);
    if (url.startsWith("http")) return url;
    return `${API_URL}/uploads/${url}`;
  };

  const finalImageUrl = resolveImageUrl(rawImage);

  const isAvailable = product.isAvailable !== false && (product.stock === undefined || product.stock > 0);
  const stockCount = product.stock ?? 10;

  // Default internal Add to Cart handler
  const onAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (customAddToCart) {
      setIsAddingToCart(true);
      try {
        await customAddToCart(product._id, e);
      } finally {
        setIsAddingToCart(false);
      }
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch(`${API_URL}/cart/addtoCart/${product._id}`, {
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
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Default internal Buy Now handler
  const onBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (customBuyNow) {
      setIsBuyingNow(true);
      try {
        await customBuyNow(product._id, e);
      } finally {
        setIsBuyingNow(false);
      }
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to proceed to checkout");
      router.push("/login");
      return;
    }

    setIsBuyingNow(true);
    try {
      const response = await fetch(`${API_URL}/cart/addtoCart/${product._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });

      const result = await response.json();
      if (result.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cartUpdated"));
        }
        router.push("/checkout");
      } else {
        toast.error(result.message || "Could not proceed to checkout");
      }
    } catch {
      toast.error("Could not proceed to checkout");
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Toggle Wishlist
  const onToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (customToggleWishlist) {
      customToggleWishlist(product._id, e);
      return;
    }

    if (typeof window !== "undefined") {
      let saved = [];
      try {
        saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
      } catch {
        saved = [];
      }

      let updated: string[];
      if (saved.includes(product._id)) {
        updated = saved.filter((id: string) => id !== product._id);
        toast.success("Removed from wishlist");
      } else {
        updated = [...saved, product._id];
        toast.success("Added to wishlist");
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setLocalWishlist(updated);
    }
  };

  return (
    <div className="group h-full flex flex-col justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all duration-200 overflow-hidden">
      <Link href={`/product/${product._id}`} className="flex flex-col flex-1">
        {/* Product Image Area */}
        <div className="relative aspect-square w-full bg-gray-50 dark:bg-gray-850 p-2.5 sm:p-3.5 flex items-center justify-center overflow-hidden">
          {rawImage && !imageError ? (
            <img
              src={finalImageUrl}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <ShoppingBag className="w-10 h-10 mb-1 opacity-50" />
              <span className="text-[11px] font-medium">No Image</span>
            </div>
          )}

          {/* Discount Badge */}
          {isDiscounted && discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-sm">
              {discountPercent}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs shadow hover:scale-110 active:scale-95 transition-all text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <Heart
              size={15}
              className={isWishlisted ? "fill-red-500 text-red-500" : ""}
            />
          </button>

          {/* Out of Stock Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-gray-900/90 text-white font-semibold text-xs px-3 py-1 rounded shadow">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low Stock Warning */}
          {isAvailable && stockCount > 0 && stockCount <= 5 && (
            <div className="absolute bottom-1.5 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
              Only {stockCount} left
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
          <div>
            {/* Title: 15–16px, Max 2 lines */}
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[40px] sm:min-h-[42px] leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {product.name}
            </h3>

            {/* Rating & Review Count */}
            <div className="flex items-center gap-1 mt-1.5 mb-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < Math.round(product.rating ?? 4.5) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{(product.rating ?? 4.5).toFixed(1)}</span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">({product.reviewCount ?? 128})</span>
            </div>
          </div>

          {/* Price Container: 18–22px */}
          <div className="mt-1 mb-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[18px] sm:text-[20px] font-bold text-gray-900 dark:text-white leading-none">
                ₹{Math.round(resolvedDiscountPrice).toLocaleString("en-IN")}
              </span>
              {isDiscounted && (
                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                  ₹{Math.round(product.price).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {isDiscounted && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Save ₹{Math.round(product.price - resolvedDiscountPrice).toLocaleString("en-IN")} ({discountPercent}%)
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons: 14–15px, Compact and Accessible */}
      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 pt-0">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!isAvailable || isAddingToCart}
            aria-label="Add to cart"
            className="flex items-center justify-center gap-1 py-2 px-2 text-[13px] sm:text-[14px] font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isAddingToCart ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShoppingCart size={14} className="shrink-0" />
            )}
            <span className="truncate">Add to Cart</span>
          </button>

          {/* Buy Now Button */}
          <button
            type="button"
            onClick={onBuyNow}
            disabled={!isAvailable || isBuyingNow}
            aria-label="Buy now"
            className="flex items-center justify-center gap-1 py-2 px-2 text-[13px] sm:text-[14px] font-medium bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isBuyingNow ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} className="shrink-0 fill-current" />
            )}
            <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
