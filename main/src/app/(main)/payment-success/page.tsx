"use client";

import { CheckCircle, Home, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const [orderId, setOrderId] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // URL se order ID nikal lo
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("order_id");
    if (id) {
      setOrderId(id);
    }

    // Auto redirect to orders page after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/orders";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Main Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Green Header Bar */}
          <div className="bg-green-600 px-6 py-4">
            <div className="flex items-center justify-center gap-2 text-white">
              <CheckCircle className="w-6 h-6" />
              <span className="font-semibold">Payment Successful</span>
            </div>
          </div>

          <div className="p-8 text-center">
            {/* Big Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4 animate-bounce">
                <CheckCircle className="w-24 h-24 text-green-600" />
              </div>
            </div>

            {/* Big Success Message */}
            <h1 className="text-4xl font-bold text-green-600 mb-2">
              ORDER CONFIRMED! 🎉
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your purchase! Your order has been successfully placed.
            </p>

            {/* Order ID Card */}
            {orderId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-bold text-gray-800 text-lg">
                  {orderId}
                </p>
              </div>
            )}

            {/* What's Next Section */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                What's Next?
              </h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>You will receive an email confirmation shortly</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Order will be processed within 24 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Delivery typically takes 3-5 business days</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/orders">
                <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" />
                  View My Orders
                </button>
              </Link>
              
              <Link href="/">
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Continue Shopping
                </button>
              </Link>
            </div>

            {/* Auto Redirect Message */}
            <p className="text-sm text-gray-400 mt-6">
              Redirecting to orders page in {countdown} seconds...
            </p>
          </div>
        </div>

        {/* Delivery Promise */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at support@yourstore.com
          </p>
        </div>
      </div>
    </div>
  );
}