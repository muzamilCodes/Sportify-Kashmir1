"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  CreditCard,
  Wallet,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Home,
  Briefcase,
  PlusCircle,
  X,
  Edit,
  Gift,
} from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  email?: string;
  isDefault?: boolean;
  landmark?: string;
  addressType?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("razorpay");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountPercent?: number;
    discountType: string;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  const [addressForm, setAddressForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
    email: "",
    landmark: "",
    addressType: "home",
    isDefault: false,
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setIsRazorpayLoaded(true);
    document.body.appendChild(script);

    const date = new Date();
    date.setDate(date.getDate() + 3);
    setDeliveryDate(date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));

    fetchCart();
    fetchAddresses();
  }, []);
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const guestCartId = localStorage.getItem("cartId");

      let rawProducts: any[] = [];

      if (token) {
        const res = await fetch(`${API_URL}/cart/getCart`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success && data.data) {
          if (data.data.products && Array.isArray(data.data.products)) {
            rawProducts = data.data.products;
          } else if (data.data.cart && data.data.cart.products) {
            rawProducts = data.data.cart.products;
          } else if (data.data.items) {
            rawProducts = data.data.items;
          }
        }
      } else if (guestCartId) {
        const res = await fetch(`${API_URL}/cart/getGuestCart/${guestCartId}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success && data.data) {
          if (data.data.products && Array.isArray(data.data.products)) {
            rawProducts = data.data.products;
          } else if (data.data.cart && data.data.cart.products) {
            rawProducts = data.data.cart.products;
          } else if (data.data.items) {
            rawProducts = data.data.items;
          }
        }
      } else {
        router.push("/login");
        return;
      }

      let validProducts = rawProducts.filter((p: any) => p && (p.productId || p._id));

      // Check if any product is unpopulated or missing images
      const needsPopulation = validProducts.some((p: any) => {
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

          validProducts = validProducts.map((p: any) => {
            const prodId =
              typeof p.productId === "string"
                ? p.productId
                : p.productId?._id
                ? String(p.productId._id)
                : p._id
                ? String(p._id)
                : "";
            if (prodId && prodMap.has(prodId)) {
              return { ...p, productId: prodMap.get(prodId) };
            }
            return p;
          });
        } catch (e) {
          console.error("Failed to populate products in checkout:", e);
        }
      }

      setCartItems(validProducts);
      calculateTotals(validProducts);

    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartItems([]);
      calculateTotals([]);
    }
  };

  // ✅ Add event listener for cart updates
  useEffect(() => {
    fetchCart();
    fetchAddresses();

    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("focus", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("focus", handleCartUpdate);
    };
  }, []);

  // Pre-fill spin wheel coupon if active
  useEffect(() => {
    const savedSpin = localStorage.getItem("sportify_spin_coupon_v3");
    if (savedSpin) {
      try {
        const parsed = JSON.parse(savedSpin);
        if (parsed.expiresAt > Date.now() && parsed.code) {
          setCouponCode(parsed.code);
        }
      } catch {}
    }
  }, []);

  const calculateTotals = (items: CartItem[]) => {
    let sub = 0;
    items.forEach((item) => {
      const product = item.productId && typeof item.productId === "object" ? item.productId : (item as any);
      let price = product.price;
      if (product.discount && product.discount > 0) {
        price = price - (price * product.discount) / 100;
      }
      sub += price * item.quantity;
    });
    setSubtotal(sub);
    setTotalAmount(sub);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (subtotal <= 0) {
      toast.error("Your cart is empty");
      return;
    }

    setValidatingCoupon(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/coupon/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderAmount: subtotal,
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setAppliedCoupon({
          code: result.data.code,
          discountAmount: result.data.discountAmount,
          discountPercent: result.data.discountValue,
          discountType: result.data.discountType,
        });
        toast.success(`🎉 ${result.message || "Coupon applied!"}`);
      } else {
        toast.error(result.message || "Invalid or expired coupon code");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingQuantity(productId);
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
      }
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const removeFromCart = async (productId: string) => {
    setDeletingItem(productId);
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
      }
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setDeletingItem(null);
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/addresses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.success && result.data) {
        setAddresses(result.data);
        const defaultAddr = result.data.find((a: Address) => a.isDefault) || result.data[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      toast.error("Geolocation not supported");
      setIsGettingLocation(false);
      return;
    }

    toast.loading("Getting your location...", { id: "location" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();

          toast.dismiss("location");

          if (data && data.address) {
            const addr = data.address;

            setAddressForm(prev => ({
              ...prev,
              street: addr.road || addr.suburb || addr.neighbourhood || "",
              city: addr.city || addr.town || addr.village || "",
              state: addr.state || "",
              pincode: addr.postcode || "",
              landmark: addr.suburb || addr.neighbourhood || "",
            }));

            toast.success("Location detected! Address auto-filled.");
          } else {
            toast.error("Could not get address details");
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.dismiss("location");
          toast.error("Failed to get address details");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.dismiss("location");
        let errorMsg = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;
        }
        setLocationError(errorMsg);
        toast.error(errorMsg);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const saveAddress = async () => {
    if (!addressForm.firstName || !addressForm.street || !addressForm.city || !addressForm.pincode || !addressForm.mobile) {
      toast.error("Please fill all required fields");
      return;
    }

    setSavingAddress(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/addresses/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: addressForm.firstName,
          lastName: addressForm.lastName,
          street: addressForm.street,
          city: addressForm.city,
          district: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          country: "India",
          mobile: addressForm.mobile,
          email: addressForm.email,
          landmark: addressForm.landmark,
          addressType: addressForm.addressType,
          isDefault: addressForm.isDefault,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Address saved successfully!");
        setShowAddressModal(false);
        setAddressForm({
          firstName: "",
          lastName: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          mobile: "",
          email: "",
          landmark: "",
          addressType: "home",
          isDefault: false,
        });
        fetchAddresses();
      } else {
        toast.error(result.message || "Failed to add address");
      }
    } catch (error) {
      toast.error("Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const getItemPrice = (item: CartItem) => {
    const product = item.productId && typeof item.productId === "object" ? item.productId : (item as any);
    let price = product.price;
    if (product.discount && product.discount > 0) {
      price = price - (price * product.discount) / 100;
    }
    return Math.round(price);
  };

  const placeOrderCOD = async () => {
  if (!selectedAddress) {
    toast.error("Please select a delivery address");
    return;
  }

  if (cartItems.length === 0) {
    toast.error("Your cart is empty");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");

    const orderProducts = cartItems.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: getItemPrice(item),
    }));

    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalOrderTotal = Math.max(0, subtotal - discountAmount);

    const orderData: any = {
      products: orderProducts,
      totalAmount: finalOrderTotal,
      subtotal: subtotal,
      discountAmount: discountAmount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      paymentMethod: "cod",
    };

    if (token) {
      orderData.shippingAddress = selectedAddress._id;
    } else {
      orderData.customerDetails = {
        name: `${selectedAddress.firstName} ${selectedAddress.lastName}`.trim(),
        phone: selectedAddress.mobile,
        email: selectedAddress.email || "",
        address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
      };
    }

    const response = await fetch(`${API_URL}/orders/create-cod`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (result.success) {
      await clearCartAfterOrder();
      toast.success("Order placed successfully!");
      router.push(`/order-success?order_id=${result.data._id}`);
    } else {
      toast.error(result.message || "Failed to place order");
    }
  } catch (error) {
    console.error("Order error:", error);
    toast.error("Failed to place order");
  } finally {
    setLoading(false);
  }
};

const clearCartAfterOrder = async () => {
  try {
    localStorage.removeItem("sportify_spin_coupon_v3");
    const token = localStorage.getItem("token");
    if (!token) return;

    for (const item of cartItems) {
      await fetch(`${API_URL}/cart/removeFromCart/${item.productId._id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    window.dispatchEvent(new Event("cartUpdated"));
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};

const processRazorpayPayment = async () => {
  if (!selectedAddress) {
    toast.error("Please select a delivery address");
    return;
  }

  if (cartItems.length === 0) {
    toast.error("Your cart is empty");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");

    const orderResponse = await fetch(`${API_URL}/api/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currency: "INR" }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      throw new Error(orderData.message || "Failed to create payment order");
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.data.amount,
      currency: orderData.data.currency,
      name: "Sportify Kashmir",
      description: `Order Total: ₹${totalAmount}`,
      order_id: orderData.data.orderId,
      prefill: {
        name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
        contact: selectedAddress.mobile,
        email: selectedAddress.email || "customer@sportify.com",
      },
      theme: { color: "#3B82F6" },
      handler: async function (response: any) {
        try {
          const verifyResponse = await fetch(`${API_URL}/api/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddressId: selectedAddress._id,
            }),
          });

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            await clearCartAfterOrder();
            toast.success("Payment successful! Order placed.");
            router.push(`/order-success?order_id=${verifyResult.data._id}`);
          } else {
            toast.error(verifyResult.message || "Payment verification failed");
          }
        } catch (error) {
          toast.error("Payment successful but order creation failed");
        }
      },
      modal: { ondismiss: () => setLoading(false) },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  } catch (error: any) {
    console.error("Payment error:", error);
    toast.error(error.message || "Payment failed");
  } finally {
    setLoading(false);
  }
};

const handlePayment = () => {
  if (paymentMethod === "cod") {
    placeOrderCOD();
  } else {
    processRazorpayPayment();
  }
};

const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
const shippingCost = 0;
const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

return (
  <div className="sk-page-shell">
    {/* Header */}
    <div className="bg-white/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 shadow-sm backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center">
            <h1 className="font-display text-xl font-bold text-zinc-900 dark:text-white">Checkout</h1>
            <p className="text-xs text-zinc-500">Complete your purchase</p>
          </div>
          <div className="w-20"></div>
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h2 className="font-display font-semibold text-gray-900 dark:text-white text-lg">Delivery Address</h2>
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Add New
              </button>
            </div>

            {selectedAddress ? (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 rounded-xl p-4 border border-orange-200 dark:border-orange-500/25">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {selectedAddress.addressType === "home" ? (
                        <Home className="w-4 h-4 text-orange-500" />
                      ) : selectedAddress.addressType === "work" ? (
                        <Briefcase className="w-4 h-4 text-orange-500" />
                      ) : (
                        <MapPin className="w-4 h-4 text-orange-500" />
                      )}
                      <p className="font-medium text-gray-900">
                        {selectedAddress.firstName} {selectedAddress.lastName}
                      </p>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedAddress.mobile}
                      </p>
                      {selectedAddress.email && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {selectedAddress.email}
                        </p>
                      )}
                    </div>
                    {selectedAddress.isDefault && (
                      <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Default Address
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedAddress(null)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr)}
                    className="border rounded-xl p-4 cursor-pointer hover:border-orange-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={(selectedAddress as Address | null)?._id === addr._id}
                        readOnly
                        className="mt-1 text-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {addr.firstName} {addr.lastName}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">📞 {addr.mobile}</p>
                        {addr.email && <p className="text-xs text-gray-500">✉️ {addr.email}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No saved addresses</p>
                    <button onClick={() => setShowAddressModal(true)} className="mt-2 text-orange-500 text-sm">
                      Add your first address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              <h2 className="font-display font-semibold text-gray-900 dark:text-white text-lg">Order Items</h2>
              <span className="text-sm text-gray-500">({cartItems.length} items)</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Looks like you haven't added any items yet</p>
                <Link href="/products" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 inline-block">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, idx) => {
                  const product = item?.productId && typeof item.productId === "object" ? item.productId : (item as any);
                  const itemPrice = getItemPrice(item);
                  const originalPrice = product?.price || item?.price || 0;
                  const hasDiscount = Boolean(product?.discount && product.discount > 0);
                  const prodName = product?.name || "Product";
                  const prodId = product?._id || (item as any)?._id || idx;

                  return (
                    <div key={prodId} className="flex gap-4 py-4 border-b last:border-0">
                      <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                        <ProductImage
                          product={product || item}
                          alt={prodName}
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{prodName}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.color && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Color: {item.color}</span>}
                          {item.size && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Size: {item.size}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold text-orange-600">₹{itemPrice}</span>
                          {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                            disabled={updatingQuantity === item.productId._id}
                            className="px-3 py-1.5 hover:bg-gray-100 transition disabled:opacity-50"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {updatingQuantity === item.productId._id ? (
                              <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={updatingQuantity === item.productId._id}
                            className="px-3 py-1.5 hover:bg-gray-100 transition disabled:opacity-50"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="font-bold text-gray-900">
                          ₹{(itemPrice * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId._id)}
                          disabled={deletingItem === item.productId._id}
                          className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 transition"
                        >
                          {deletingItem === item.productId._id ? (
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
            )}
          </div>

          {/* Payment Method Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <h2 className="font-display font-semibold text-gray-900 dark:text-white text-lg">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "razorpay" ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={(e) => setPaymentMethod(e.target.value as "razorpay")}
                  className="w-4 h-4 text-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Online Payment</span>
                  </div>
                  <p className="text-xs text-gray-500">Credit/Debit Card, UPI, NetBanking, Wallet</p>
                </div>
              </label>

              <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value as "cod")}
                  className="w-4 h-4 text-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                  <p className="text-xs text-gray-500">Pay when you receive the order</p>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Promise */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex flex-wrap gap-6 justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                  <p className="text-xs text-gray-500">On orders above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                  <p className="text-xs text-gray-500">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                  <p className="text-xs text-gray-500">7-Day Return / Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 sticky top-24">
            <h2 className="font-bold text-xl text-gray-900 mb-4">Order Summary</h2>

            {/* Cart Items Preview */}
            {cartItems.length > 0 && (
              <div className="mb-4 max-h-56 overflow-y-auto space-y-3 pr-1 border-b pb-4">
                {cartItems.map((item, idx) => {
                  const product = item?.productId && typeof item.productId === "object" ? item.productId : (item as any);
                  if (!product) return null;
                  const price = getItemPrice(item);
                  const prodName = product?.name || "Product";
                  const prodId = product?._id || (item as any)?._id || idx;
                  return (
                    <div key={prodId} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 border border-gray-100 dark:border-gray-700">
                        <ProductImage
                          product={product || item}
                          alt={prodName}
                          sizes="48px"
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">{prodName}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        ₹{(price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Coupon Code Section */}
            <div className="my-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-orange-500" />
                  <span>Promo / Spin Coupon Code</span>
                </span>
                {appliedCoupon && (
                  <span className="text-[10px] bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded-full">
                    {appliedCoupon.code} Applied
                  </span>
                )}
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                    <div>
                      <span className="font-mono font-bold text-green-800 dark:text-green-300">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-gray-500 text-[11px] block">
                        Saved ₹{appliedCoupon.discountAmount.toFixed(2)} on this order
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon / Spin Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 dark:border-gray-700 rounded-xl uppercase font-mono tracking-wider bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-bold text-sm">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount</span>
                  <span className="text-orange-600 font-extrabold">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Estimated Delivery</p>
              <p className="text-sm font-medium text-gray-900">{deliveryDate}</p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || cartItems.length === 0 || !selectedAddress}
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "cod" ? (
                <>
                  <IndianRupee className="w-5 h-5" />
                  Place Order (COD)
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Pay ₹{grandTotal.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Address Modal */}
    {showAddressModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">Add New Address</h2>
              <button onClick={() => setShowAddressModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full mb-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Use My Current Location
                </>
              )}
            </button>

            {locationError && (
              <p className="text-red-500 text-xs text-center mb-3">{locationError}</p>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={addressForm.lastName}
                    onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={addressForm.mobile}
                  onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">We'll send order confirmation to this email</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  placeholder="House number, building, street"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="Near any landmark"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address Type</label>
                  <select
                    value={addressForm.addressType}
                    onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                    className="p-3 border rounded-lg"
                  >
                    <option value="home">🏠 Home</option>
                    <option value="work">💼 Work</option>
                    <option value="other">📍 Other</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-orange-500"
                />
                <span className="text-sm">Set as default address</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAddress}
                disabled={savingAddress}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {savingAddress ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
