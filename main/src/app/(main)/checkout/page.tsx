"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    productImgUrls: string[];
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
    console.log("Token being sent:", token ? "Yes" : "No");
    
    if (!token) {
      console.log("No token found");
      router.push("/login");
      return;
    }
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/getCart`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      cache: "no-store",  // ✅ Force fresh data
      next: { revalidate: 0 }  // ✅ Next.js 13+ force fresh
    });
    
    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Full response:", data);
    
    let products: CartItem[] = [];
    
    if (data.success && data.data) {
      if (data.data.products && Array.isArray(data.data.products)) {
        products = data.data.products;
      } else if (data.data.cart && data.data.cart.products) {
        products = data.data.cart.products;
      } else if (data.data.items) {
        products = data.data.items;
      }
    }
    
    console.log("Extracted products:", products);
    setCartItems(products);
    calculateTotals(products);
    
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
// const fetchCart = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     console.log("Token being sent:", token ? "Yes" : "No");
    
//     if (!token) {
//       console.log("No token found");
//       router.push("/login");
//       return;
//     }
    
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/getCart`, {
//       headers: { 
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json"
//       },
//     });
    
//     console.log("Response status:", res.status);
//     const data = await res.json();
//     console.log("Full response:", data);
    
//     let products: CartItem[] = [];
    
//     // Try all possible paths to extract products
//     if (data.success && data.data) {
//       if (data.data.products && Array.isArray(data.data.products)) {
//         products = data.data.products;
//       } else if (data.data.cart && data.data.cart.products) {
//         products = data.data.cart.products;
//       } else if (data.data.items) {
//         products = data.data.items;
//       } else if (Array.isArray(data.data)) {
//         products = data.data;
//       }
//     }
    
//     console.log("Extracted products:", products);
//     setCartItems(products);
//     calculateTotals(products);
//   } catch (err) {
//     console.error("Cart fetch error:", err);
//     setCartItems([]);
//     calculateTotals([]);
//   }
// };
 const calculateTotals = (items: CartItem[]) => {
  let sub = 0;
  items.forEach((item) => {
    let price = item.productId.price;
    if (item.productId.discount && item.productId.discount > 0) {
      price = price - (price * item.productId.discount) / 100;
    }
    sub += price * item.quantity;
  });
  setSubtotal(sub);
  setTotalAmount(sub);
};
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingQuantity(productId);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/removeFromCart/${productId}`, {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses/`, {
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
        switch(error.code) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addresses/create`, {
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
    let price = item.productId.price;
    if (item.productId.discount && item.productId.discount > 0) {
      price = price - (price * item.productId.discount) / 100;
    }
    return Math.round(price);
  };

  // ✅ FIXED: Place Order COD with complete customer details
// const placeOrderCOD = async () => {
//   if (!selectedAddress) {
//     toast.error("Please select a delivery address");
//     return;
//   }

//   if (cartItems.length === 0) {
//     toast.error("Your cart is empty");
//     return;
//   }

//   setLoading(true);
//   try {
//     const token = localStorage.getItem("token");
    
//     // Prepare products with correct price
//     const orderProducts = cartItems.map(item => ({
//       productId: item.productId._id,
//       quantity: item.quantity,
//       price: getItemPrice(item),
//     }));
    
//     const orderData: any = {
//       products: orderProducts,
//       totalAmount: totalAmount,
//       paymentMethod: "cod",
//     };
    
//     if (token) {
//       // Logged in user
//       orderData.shippingAddress = selectedAddress._id;
//     } else {
//       // Guest user - send full customer details
//       orderData.customerDetails = {
//         name: `${selectedAddress.firstName} ${selectedAddress.lastName}`.trim(),
//         phone: selectedAddress.mobile,
//         email: selectedAddress.email || "",
//         address: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
//       };
//     }
    
//     console.log("Placing COD order with data:", orderData);
    
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/create-cod`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//       body: JSON.stringify(orderData),
//     });

//     const result = await response.json();
//     console.log("Order response:", result);
    
//     if (result.success) {
//       toast.success("Order placed successfully!");
//       router.push(`/order-success?order_id=${result.data._id}`);
//     } else {
//       toast.error(result.message || "Failed to place order");
//     }
//   } catch (error) {
//     console.error("Order error:", error);
//     toast.error("Failed to place order");
//   } finally {
//     setLoading(false);
//   }
// };
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
    
    const orderData: any = {
      products: orderProducts,
      totalAmount: totalAmount,
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
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/create-cod`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    
    if (result.success) {
      // ✅ Clear cart AFTER successful order
      for (const item of cartItems) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/removeFromCart/${item.productId._id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      window.dispatchEvent(new Event("cartUpdated"));
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
// ✅ Add this function to clear cart after successful order
const clearCartAfterOrder = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Clear all items from cart
    for (const item of cartItems) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/removeFromCart/${item.productId._id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    
    // Trigger cart update for header
    window.dispatchEvent(new Event("cartUpdated"));
    
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};
  // ✅ FIXED: Razorpay payment with complete customer details
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
      
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
        }),
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
        handler: async function(response: any) {
          try {
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                products: cartItems.map(item => ({
                  productId: item.productId._id,
                  quantity: item.quantity,
                  price: getItemPrice(item),
                })),
                totalAmount: totalAmount,
                shippingAddressId: selectedAddress._id,
                // ✅ Send customer details
                customerDetails: {
                  name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
                  phone: selectedAddress.mobile,
                  email: selectedAddress.email || "",
                }
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              toast.success("Payment successful! Order placed.");
              router.push(`/order-success?order_id=${verifyResult.data._id}`);
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            toast.error("Payment successful but order creation failed");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const razorpay = new window.Razorpay(options);
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

  const shippingCost = 0;
  const grandTotal = totalAmount + shippingCost;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
              <p className="text-xs text-gray-500">Complete your purchase</p>
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
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <h2 className="font-semibold text-gray-900 text-lg">Delivery Address</h2>
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
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
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
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-5">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900 text-lg">Order Items</h2>
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
                    const itemPrice = getItemPrice(item);
                    const originalPrice = item.productId.price;
                    const hasDiscount = item.productId.discount && item.productId.discount > 0;

                    return (
                      <div key={idx} className="flex gap-4 py-4 border-b last:border-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {item.productId.productImgUrls?.[0] ? (
                            <img
                              src={item.productId.productImgUrls[0]}
                              alt={item.productId.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-2">{item.productId.name}</h3>
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
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <h2 className="font-semibold text-gray-900 text-lg">Payment Method</h2>
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
            <div className="bg-white rounded-2xl shadow-sm border p-6">
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
                    <p className="text-xs text-gray-500">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
              <h2 className="font-bold text-xl text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span className="text-orange-600">₹{grandTotal.toFixed(2)}</span>
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