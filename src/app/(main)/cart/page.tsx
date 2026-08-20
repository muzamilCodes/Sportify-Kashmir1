"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  ArrowLeft,
  Loader2,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";
import ProductImage from "@/components/ProductImage";

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    discount?: number;
    productImgUrls?: string[];
    images?: string[];
    image?: string;
  };
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    fetchCart();
  }, []);

  const getItemPrice = (item: CartItem) => {
    if (!item || !item.productId) return 0;
    let price = item.productId.price || item.price || 0;
    if (item.productId.discount && item.productId.discount > 0) {
      price = price - (price * item.productId.discount) / 100;
    }
    return Math.round(price);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const guestCartId = localStorage.getItem("cartId");

      let rawProducts: any[] = [];

      if (token) {
        const response = await fetch(`${API_URL}/cart/getCart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (result.success && result.data) {
          rawProducts = result.data.products || [];
        }
      } else if (guestCartId) {
        const response = await fetch(`${API_URL}/cart/getGuestCart/${guestCartId}`);
        const result = await response.json();
        if (result.success && result.data) {
          rawProducts = result.data.products || [];
        }
      }

      if (rawProducts.length === 0) {
        setCartItems([]);
        return;
      }

      // Check if any product is unpopulated or missing productImgUrls
      const needsPopulation = rawProducts.some((p: any) => {
        const prod = p.productId && typeof p.productId === "object" ? p.productId : p;
        return (
          typeof p.productId === "string" ||
          !prod ||
          !prod.name ||
          (!prod.productImgUrls && !prod.images) ||
          (Array.isArray(prod.productImgUrls) && prod.productImgUrls.length === 0 && (!prod.images || prod.images.length === 0))
        );
      });

      if (needsPopulation) {
        try {
          const prodRes = await fetch(`${API_URL}/product/getAll`);
          const prodData = await prodRes.json();
          const allProds = Array.isArray(prodData?.data)
            ? prodData.data
            : prodData?.data?.items || [];
          const prodMap = new Map(allProds.map((pr: any) => [String(pr._id), pr]));

          rawProducts = rawProducts.map((p: any) => {
            const prodId =
              typeof p.productId === "string"
                ? p.productId
                : p.productId?._id
                ? String(p.productId._id)
                : "";
            if (prodId && prodMap.has(prodId)) {
              return { ...p, productId: prodMap.get(prodId) };
            }
            return p;
          });
        } catch (e) {
          console.error("Failed to populate products:", e);
        }
      }

      setCartItems(
        rawProducts.filter(
          (p: any) => p && p.productId && typeof p.productId === "object"
        )
      );
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingId(productId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/cart/updateQuantity/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const result = await response.json();
      if (result.success) {
        fetchCart();
        toast.success("Quantity updated");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to update quantity");
      }
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    setDeletingId(productId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/cart/removeFromCart/${productId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success) {
        fetchCart();
        toast.success("Item removed from cart");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to remove item");
      }
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = getItemPrice(item);
      return total + price * item.quantity;
    }, 0);
  };

  const subtotal = getSubtotal();
  const shipping = subtotal > 999 ? 0 : 100;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition shadow-lg shadow-orange-500/25"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Continue Shopping</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Shopping Cart ({cartItems.length})</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => {
              const product = item?.productId && typeof item.productId === "object" ? item.productId : (item as any);
              const discountedPrice = getItemPrice(item);
              const originalPrice = product?.price || item?.price || 0;
              const hasDiscount = Boolean(product?.discount && product.discount > 0);
              const prodId = product?._id || (item as any)?._id || idx;
              const prodName = product?.name || "Product";

              return (
                <div
                  key={prodId}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 dark:bg-gray-800/80 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <ProductImage
                        product={product || item}
                        alt={prodName}
                        sizes="(max-width: 640px) 96px, 128px"
                        className="object-contain p-2 transition-transform duration-200 hover:scale-105"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link href={`/product/${product?._id || ""}`}>
                            <h3 className="font-semibold text-gray-800 hover:text-orange-500 transition line-clamp-2 text-base sm:text-lg">
                              {prodName}
                            </h3>
                          </Link>
                          <button
                            onClick={() => removeItem(product._id)}
                            disabled={deletingId === product._id}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            {deletingId === product._id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{discountedPrice.toLocaleString("en-IN")}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-sm text-gray-400 line-through">
                                ₹{originalPrice.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                {product.discount}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingId === product._id}
                            className="p-2 hover:text-orange-500 disabled:opacity-30 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium text-gray-800">
                            {updatingId === product._id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto text-orange-500" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            disabled={updatingId === product._id}
                            className="p-2 hover:text-orange-500 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-500">Subtotal</span>
                          <p className="font-bold text-gray-900">
                            ₹{(discountedPrice * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </div>
              </div>

              <div className="py-4 border-b border-gray-100">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-orange-600">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              <Link href="/checkout">
                <button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                </button>
              </Link>

              {/* Benefits */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Free delivery on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>7-Day Return / Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
