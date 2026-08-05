"use client";

import { BarChart3, TrendingUp, Users, DollarSign, Download, Calendar } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1 font-medium">Detailed insights into your store's performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 shadow-sm font-medium">
            <Calendar size={18} /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
              <DollarSign size={24} />
            </div>
            <p className="text-gray-500 font-medium mb-1">Total Sales</p>
            <h3 className="text-3xl font-bold text-gray-900">₹1,24,500</h3>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg font-bold">
                <TrendingUp size={14} className="mr-1" /> +12.5%
              </span>
              <span className="text-gray-400">vs last period</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Users size={24} />
            </div>
            <p className="text-gray-500 font-medium mb-1">New Customers</p>
            <h3 className="text-3xl font-bold text-gray-900">142</h3>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg font-bold">
                <TrendingUp size={14} className="mr-1" /> +5.2%
              </span>
              <span className="text-gray-400">vs last period</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
              <BarChart3 size={24} />
            </div>
            <p className="text-gray-500 font-medium mb-1">Conversion Rate</p>
            <h3 className="text-3xl font-bold text-gray-900">3.8%</h3>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-lg font-bold">
                <TrendingUp size={14} className="mr-1" /> +1.1%
              </span>
              <span className="text-gray-400">vs last period</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Reports Coming Soon</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We are building comprehensive charts and data visualization tools to help you analyze your store's performance in depth.
        </p>
      </div>
    </div>
  );
}
