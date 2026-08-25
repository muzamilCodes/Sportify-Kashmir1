"use client";

import React, { useState } from "react";
import { ShoppingCart, Zap, Star, Heart, Loader2, Eye, GitCompare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resolveProductImage } from "@/lib/imageHelper";
import ProductImage from "@/components/ProductImage";
import { useLanguage } from "@/context/LanguageContext";

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
  priority?: boolean;
  getImageUrl?: (url: string) => string;
  handleAddToCart?: (id: string, e: React.MouseEvent) => Promise<void> | void;
  handleBuyNow?: (id: string, e: React.MouseEvent) => Promise<void> | void;
  toggleWishlist?: (id: string, e: React.MouseEvent) => void;
}

function ProductCardComponent({
  product,
  showCategory = false,
  discountedPrice,
  hasDiscount,
  wishlist = [],
  priority = false,
  getImageUrl: customGetImageUrl,
  handleAddToCart: customAddToCart,
  handleBuyNow: customBuyNow,
  toggleWishlist: customToggleWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [localWishlist, setLocalWishlist] = useState<string[]>(wishlist);
  const [quickView, setQuickView] = useState(false);
  const [compareSelected, setCompareSelected] = useState(false);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const discountPercent = product.discount ?? 0;
  const isDiscounted = hasDiscount !== undefined ? hasDiscount : discountPercent > 0;
  
  const resolvedDiscountPrice = discountedPrice ?? (
    isDiscounted ? product.price - (product.price * discountPercent) / 100 : product.price
  );

  const isWishlisted = (localWishlist.length > 0 ? localWishlist : wishlist).includes(product._id);

  const finalImageUrl = customGetImageUrl
    ? (customGetImageUrl(product.productImgUrls?.[0] || "") || resolveProductImage(product))
    : resolveProductImage(product);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = JSON.parse(localStorage.getItem("compareProducts") || "[]") as string[];
    if (current.includes(product._id)) {
      localStorage.setItem("compareProducts", JSON.stringify(current.filter((id) => id !== product._id)));
      window.dispatchEvent(new Event("compareUpdated"));
      setCompareSelected(false);
      toast.success("Removed from comparison");
      return;
    }
    if (current.length >= 4) {
      toast.error("Compare up to 4 products");
      return;
    }
    localStorage.setItem("compareProducts", JSON.stringify([...current, product._id]));
    window.dispatchEvent(new Event("compareUpdated"));
    setCompareSelected(true);
    toast.success("Added to comparison");
  };

  const isAvailable = product.isAvailable !== false && (product.stock === undefined || product.stock > 0);

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

  // Default internal Buy Now handler (Direct checkout - does NOT update the header cart badge)
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
        // Direct Buy Now checkout - do not increment or update the cart badge icon
        toast.success("Proceeding to checkout...");
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
          <ProductImage
            product={product}
            src={finalImageUrl}
            alt={product.name}
            priority={priority}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          />

          {/* Discount Badge */}
          {isDiscounted && discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-xs">
              {discountPercent}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xs shadow-xs hover:scale-110 active:scale-95 transition-all text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer"
          >
            <Heart
              size={15}
              className={isWishlisted ? "fill-red-500 text-red-500" : ""}
            />
          </button>
          <button
            type="button"
            onClick={toggleCompare}
            aria-label={`Compare ${product.name}`}
            className={`absolute top-11 right-2 rounded-full p-1.5 shadow-xs cursor-pointer ${compareSelected ? "bg-orange-500 text-white" : "bg-white/90 text-gray-600 dark:bg-gray-800/90 dark:text-gray-300"}`}
          >
            <GitCompare size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickView(true);
            }}
            aria-label={`Quick view ${product.name}`}
            className="absolute bottom-2 right-2 rounded-full bg-white/90 dark:bg-gray-800/90 p-1.5 text-gray-600 dark:text-gray-300 shadow-xs hover:text-orange-600 cursor-pointer"
          >
            <Eye size={15} />
          </button>
        </div>

        {/* Product Details */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
          <div>
            <h3 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[40px] sm:min-h-[42px] leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {product.name}
            </h3>

            {/* Rating & Review Count */}
            <div className="flex items-center gap-1 mt-1.5 mb-2" aria-label={`Rating: ${(product.rating ?? 4.5).toFixed(1)} out of 5 stars`}>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < Math.round(product.rating ?? 4.5) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-gray-800 dark:text-gray-200">{(product.rating ?? 4.5).toFixed(1)}</span>
              <span className="text-[11px] text-gray-600 dark:text-gray-400">({product.reviewCount ?? 128})</span>
            </div>
          </div>

          {/* Price Container */}
          <div className="mt-1 mb-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[18px] sm:text-[20px] font-bold text-gray-900 dark:text-white leading-none">
                ₹{Math.round(resolvedDiscountPrice).toLocaleString("en-IN")}
              </span>
              {isDiscounted && (
                <span className="text-xs text-gray-600 dark:text-gray-400 line-through">
                  ₹{Math.round(product.price).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {isDiscounted && (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Save ₹{Math.round(product.price - resolvedDiscountPrice).toLocaleString("en-IN")} ({discountPercent}%)
              </span>
            )}

            {/* Sportify Prime 24h Express Badge */}
            <div className="flex items-center gap-1 mt-1">
              <span className="flex items-center bg-[#002f36] text-white px-1.5 py-0.2 rounded text-[9px] font-black tracking-tight">
                <span>sportify</span>
                <span className="text-[#00a8e1] ml-0.5">prime</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">24h Valley Delivery</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 pt-0">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!isAvailable || isAddingToCart}
            aria-label={`Add ${product.name} to cart`}
            className="flex items-center justify-center gap-1 py-2 px-2 text-[13px] sm:text-[14px] font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 cursor-pointer"
          >
            {isAddingToCart ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ShoppingCart size={14} className="shrink-0" />
            )}
            <span className="truncate">{!isAvailable ? t("product.outOfStock", "Out of Stock") : t("product.addToCart", "Add to Cart")}</span>
          </button>

          {/* Buy Now Button */}
          <button
            type="button"
            onClick={onBuyNow}
            disabled={!isAvailable || isBuyingNow}
            aria-label={`Buy ${product.name} now`}
            className="flex items-center justify-center gap-1 py-2 px-2 text-[13px] sm:text-[14px] font-medium bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 cursor-pointer"
          >
            {isBuyingNow ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} className="shrink-0 fill-current" />
            )}
            <span className="truncate">{t("product.buyNow", "Buy Now")}</span>
          </button>
        </div>
      </div>

      {quickView && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setQuickView(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-4">
              <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700 border">
                <ProductImage
                  product={product}
                  src={finalImageUrl}
                  alt={product.name}
                  fill
                  sizes="144px"
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="mt-2 text-xl font-bold text-orange-600 dark:text-orange-400">₹{Math.round(resolvedDiscountPrice).toLocaleString("en-IN")}</p>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{product.description || "Premium sports gear from Sportify Kashmir."}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Link href={`/product/${product._id}`} onClick={() => setQuickView(false)} className="flex-1 rounded-lg border dark:border-gray-600 px-4 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white">View details</Link>
              <button onClick={onAddToCart} disabled={!isAvailable} className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer">Add to cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ProductCard = React.memo(ProductCardComponent);
export default ProductCard;
