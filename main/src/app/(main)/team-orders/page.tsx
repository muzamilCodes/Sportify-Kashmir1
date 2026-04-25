"use client";

import { Users, Phone, Mail, CheckCircle, Truck, Shield } from "lucide-react";
import Link from "next/link";

export default function TeamOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Team Orders</h1>
            <p className="text-gray-600 mt-2">Special pricing for sports teams and clubs</p>
          </div>

          <div className="space-y-6">
            <div className="bg-orange-50 rounded-xl p-4">
              <h2 className="font-bold text-gray-900 mb-2">Why Choose Team Orders?</h2>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Bulk discounts on 10+ items</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Customized team jerseys available</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free shipping on team orders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="font-bold text-gray-900 mb-3">Contact Our Team</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <span>+91 9682645127 (Call between 10 AM - 6 PM)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <span>teamorders@sportifykashmir.com</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-800">
                🏆 Schools, colleges, and sports clubs get additional 5% discount!
              </p>
            </div>

            <Link href="/contact" className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
              Request Team Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}