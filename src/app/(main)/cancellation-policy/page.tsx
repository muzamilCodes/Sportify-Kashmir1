"use client";

import { XCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cancellation Policy</h1>
            <p className="text-gray-600 mt-2">Easy cancellations before shipment</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Order Cancellation</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span className="text-gray-600">Free cancellation within 1 hour of order placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span className="text-gray-600">After 1 hour, cancellation may incur charges</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <span className="text-gray-600">Cancellation not possible after shipment</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">How to Cancel?</h3>
              <p className="text-gray-600">Contact our support team at <strong>sportify68@gmail.com</strong> with your order ID</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}