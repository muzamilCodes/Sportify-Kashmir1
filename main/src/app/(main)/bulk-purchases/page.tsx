"use client";

import { Package, Truck, Percent, CheckCircle, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function BulkPurchasesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Purchases</h1>
            <p className="text-gray-600 mt-2">Wholesale pricing for bulk orders</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Percent className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="font-bold text-lg">10-25 Items</div>
                <div className="text-sm text-gray-600">5% Discount</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Package className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="font-bold text-lg">26-50 Items</div>
                <div className="text-sm text-gray-600">10% Discount</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Truck className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="font-bold text-lg">50+ Items</div>
                <div className="text-sm text-gray-600">15% Discount + Free Shipping</div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <h2 className="font-bold text-gray-900 mb-2">How to Place a Bulk Order?</h2>
              <ol className="space-y-2 list-decimal list-inside text-gray-600">
                <li>Contact our wholesale team</li>
                <li>Share your requirements list</li>
                <li>Get custom quote within 24 hours</li>
                <li>Place order and receive within 5-7 days</li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="font-bold text-gray-900 mb-3">Contact Wholesale Team</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span>+91 9682645127</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span>bulk@sportifykashmir.com</span>
                </div>
              </div>
            </div>

            <Link href="/contact" className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
              Request Bulk Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}