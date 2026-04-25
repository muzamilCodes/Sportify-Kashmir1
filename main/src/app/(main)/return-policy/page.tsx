

"use client";

import Link from "next/link";
import { RefreshCw, Shield, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">7-Day Return Policy</h1>
            <p className="text-gray-600 mt-2">Easy returns, guaranteed satisfaction</p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">7-Day Return Window</h3>
                  <p className="text-green-700 text-sm">
                    You have 7 days from the date of delivery to initiate a return.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Return Conditions</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Product must be unused and in original condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Original packaging and tags must be intact</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Products must be returned within 7 days of delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Return shipping charges may apply</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Non-Returnable Items</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span className="text-gray-600">Customized or personalized products</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span className="text-gray-600">Intimate apparel and undergarments</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span className="text-gray-600">Products damaged due to misuse</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How to Return an Item?</h3>
              <ol className="space-y-2 list-decimal list-inside text-gray-600">
                <li>Contact our support team at sportify68@gmail.com</li>
                <li>Provide your order ID and reason for return</li>
                <li>Pack the item securely in original packaging</li>
                <li>Ship the item back to our address</li>
                <li>Once received and inspected, refund will be processed</li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/contact" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
                Contact Support
              </Link>
              <Link href="/orders" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}