"use client";

import { useState } from "react";
import { Ticket, Plus, Tag, Calendar, MoreVertical, Trash2 } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "WELCOME10", discount: "10%", type: "Percentage", expiry: "2026-12-31", status: "Active" },
    { id: 2, code: "SUMMER50", discount: "₹500", type: "Fixed Amount", expiry: "2026-08-31", status: "Active" },
    { id: 3, code: "WINTER20", discount: "20%", type: "Percentage", expiry: "2026-02-28", status: "Expired" },
  ]);

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coupons & Offers</h1>
          <p className="text-gray-500 mt-1 font-medium">Create and manage discount codes for your customers.</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all">
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Coupon Code</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Discount</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Type</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Expiry Date</th>
                <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                <th className="text-right px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Ticket size={18} />
                      </div>
                      <span className="font-bold text-gray-900">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{coupon.discount}</td>
                  <td className="px-6 py-4 text-gray-600">{coupon.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} /> {coupon.expiry}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      coupon.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
