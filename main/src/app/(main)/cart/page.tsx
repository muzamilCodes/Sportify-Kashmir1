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

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    discount?: number;
    productImgUrls: string[];
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

  useEffect(() => {
    fetchCart();
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  const getItemPrice = (item: CartItem) => {
    let price = item.productId.price;
    if (item.productId.discount && item.productId.discount > 0) {
      price = price - (price * item.productId.discount) / 100;
    }
    return Math.round(price);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/getCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success && result.data) {
        setCartItems(result.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  
// const updateQuantity = async (productId: string, newQuantity: number) => {
//     if (newQuantity < 1) return;
    
//     setUpdatingId(productId);
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/updateQuantity/${productId}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ quantity: newQuantity }),
//       });

//       const result = await response.json();
//       if (result.success) {
//         fetchCart();
//         toast.success("Quantity updated");
//       } else {
//         toast.error(result.message || "Failed to update quantity");
//       }
//     } catch (error) {
//       toast.error("Failed to update quantity");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

const updateQuantity = async (productId: string, newQuantity: number) => {
  if (newQuantity < 1) return;
  
  setUpdatingId(productId);
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/updateQuantity/${productId}`, {
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
      
      // ✅ Trigger cart update for header
      window.dispatchEvent(new Event("cartUpdated"));
      
    } else {
      toast.error(result.message || "Failed to update quantity");
    }
  } catch (error) {
    toast.error("Failed to update quantity");
  } finally {
    setUpdatingId(null);
  }
};

const removeItem = async (productId: string) => {
  setDeletingId(productId);
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/removeFromCart/${productId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await response.json();
    if (result.success) {
      fetchCart();
      toast.success("Item removed from cart");
      
      // ✅ Trigger cart update for header
      window.dispatchEvent(new Event("cartUpdated"));
      
    } else {
      toast.error(result.message || "Failed to remove item");
    }
  } catch (error) {
    toast.error("Failed to remove item");
  } finally {
    setDeletingId(null);
  }
};

  // const removeItem = async (productId: string) => {
  //   setDeletingId(productId);
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/removeFromCart/${productId}`, {
  //       method: "GET",
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const result = await response.json();
  //     if (result.success) {
  //       fetchCart();
  //       toast.success("Item removed from cart");
  //     } else {
  //       toast.error(result.message || "Failed to remove item");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to remove item");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/products"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="text-gray-500">({cartItems.length} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => {
              const itemPrice = getItemPrice(item);
              const originalPrice = item.productId.price;
              const hasDiscount = item.productId.discount && item.productId.discount > 0;
              const itemTotal = itemPrice * item.quantity;

              return (
                <div key={idx} className="bg-white rounded-xl shadow-sm border p-4 flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productId.productImgUrls?.[0] ? (
                      <img
                        src={getImageUrl(item.productId.productImgUrls[0])}
                        alt={item.productId.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link href={`/product/${item.productId._id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition line-clamp-2">
                        {item.productId.name}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.color && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Color: {item.color}</span>
                      )}
                      {item.size && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Size: {item.size}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-orange-600">₹{itemPrice}</span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                        disabled={updatingId === item.productId._id}
                        className="px-3 py-1.5 hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {updatingId === item.productId._id ? (
                          <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                        disabled={updatingId === item.productId._id}
                        className="px-3 py-1.5 hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-bold text-gray-900">
                      ₹{itemTotal.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId._id)}
                      disabled={deletingId === item.productId._id}
                      className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 transition"
                    >
                      {deletingId === item.productId._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>₹{shipping.toFixed(2)}</span>
                  )}
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{(999 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
                  Proceed to Checkout
                </button>
              </Link>

              {/* Delivery Info */}
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
                  <span>7-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}