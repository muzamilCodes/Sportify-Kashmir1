"use client";

import { FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
            <p className="text-gray-600 mt-2">Last updated: April 2026</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600">By accessing and using Sportify Kashmir, you agree to be bound by these Terms & Conditions.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Products and Pricing</h2>
              <p className="text-gray-600">All product descriptions, prices, and availability are subject to change without notice. We reserve the right to modify or discontinue any product.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Orders and Payments</h2>
              <p className="text-gray-600">All orders are subject to acceptance and availability. Payment must be received before order processing.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Shipping and Delivery</h2>
              <p className="text-gray-600">We ship across Kashmir. Delivery times are estimates and not guaranteed. Free shipping on orders above ₹999.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Returns and Refunds</h2>
              <p className="text-gray-600">Our 7-day return policy applies to eligible products. Items must be unused and in original packaging.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}