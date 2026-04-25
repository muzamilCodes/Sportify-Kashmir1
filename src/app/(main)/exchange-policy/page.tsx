"use client";

import { Repeat, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function ExchangePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Repeat className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Exchange Policy</h1>
            <p className="text-gray-600 mt-2">Hassle-free exchanges within 7 days</p>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">7-Day Exchange Window</h3>
                  <p className="text-green-700 text-sm">You have 7 days from delivery to request an exchange</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Exchange Conditions</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Product must be unused and in original condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Original tags and packaging must be intact</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Exchange available for size/color change only</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How to Exchange?</h3>
              <ol className="space-y-2 list-decimal list-inside text-gray-600">
                <li>Contact us at sportify68@gmail.com within 7 days</li>
                <li>Provide your order ID and exchange request</li>
                <li>Ship the product back to our Handwara store</li>
                <li>Once received, we'll ship the exchanged product</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}