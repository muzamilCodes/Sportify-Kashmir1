"use client";

import Link from "next/link";
import { Truck, Clock, MapPin, Package, CheckCircle } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shipping Policy</h1>
            <p className="text-gray-600 mt-2">Fast and reliable delivery across Kashmir</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800">Free Shipping</h3>
                  <p className="text-blue-700 text-sm">
                    Free shipping on all orders above ₹999 across Kashmir
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Delivery Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Srinagar & Major Cities</p>
                    <p className="text-sm text-gray-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Remote Areas</p>
                    <p className="text-sm text-gray-600">4-5 business days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Shipping Charges</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Orders above ₹999 - Free Shipping</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Orders below ₹999 - ₹50 shipping charge</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Order Tracking</h3>
              <p className="text-gray-600 text-sm">
                Once your order is shipped, you will receive a tracking number via email and SMS.
                You can track your order from the <Link href="/orders" className="text-orange-500">My Orders</Link> page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}