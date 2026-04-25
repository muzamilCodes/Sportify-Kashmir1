"use client";

import { Shield, Lock, Eye, Database } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-gray-600 mt-2">Last updated: April 2026</p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <p className="text-gray-600">We collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include:</p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                <li>Name, email address, phone number</li>
                <li>Shipping and billing address</li>
                <li>Payment information</li>
                <li>Order history</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your order</li>
                <li>Send you promotional offers (with your consent)</li>
                <li>Improve our services</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Data Security</h2>
              </div>
              <p className="text-gray-600">We implement security measures to protect your personal information. Your payment information is encrypted using SSL technology.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600">If you have questions about this Privacy Policy, please contact us at: <strong>sportify68@gmail.com</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}