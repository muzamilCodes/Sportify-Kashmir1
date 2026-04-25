"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Trash2, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
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

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // Get wishlist IDs from localStorage
      const savedWishlist = localStorage.getItem("wishlist");
      const wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : [];
      
      if (wishlistIds.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      // Fetch all products and filter wishlist items
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getAll`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const filteredItems = result.data.filter(
          (product: any) => wishlistIds.includes(product._id) && product.isAvailable && !product.isArchived
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">Products you've saved for later</p>
            </div>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={clearAllWishlist}
              className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save your favorite items here to buy them later</p>
            <Link
              href="/products"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
                const hasDiscount = item.discount && item.discount > 0;
                const isOutOfStock = item.stock === 0 || !item.isAvailable;

                return (
                  <div key={item._id} className="group bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Product Image */}
                    <Link href={`/product/${item._id}`}>
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {item.productImgUrls?.[0] ? (
                          <img
                            src={getImageUrl(item.productImgUrls[0])}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        {hasDiscount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {item.discount}% OFF
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        {/* Remove Button */}
                        <button
                          onClick={(e) => removeFromWishlist(item._id, e)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition"
                        >
                          {removingId === item._id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-500" />
                          )}
                        </button>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={`/product/${item._id}`}>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 min-h-[40px] hover:text-orange-600 transition">
                          {item.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-orange-600">₹{discountedPrice.toFixed(2)}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through">₹{item.price.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Stock Status */}
                      {item.stock < 5 && item.stock > 0 && (
                        <p className="text-xs text-yellow-600 mb-2">Only {item.stock} left</p>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(item._id, e)}
                        disabled={isOutOfStock}
                        className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {addingToCart === item._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wishlist Stats */}
            <div className="mt-8 p-4 bg-white rounded-xl shadow-sm border text-center">
              <p className="text-gray-600">
                You have <span className="font-bold text-orange-600">{wishlistItems.length}</span> items in your wishlist
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}