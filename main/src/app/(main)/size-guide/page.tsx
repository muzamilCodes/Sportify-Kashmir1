"use client";

import { Ruler, Shirt, Footprints, Dumbbell } from "lucide-react";

export default function SizeGuidePage() {
  const sizeChart = [
    { size: "XS", chest: "32-34", waist: "26-28", height: "5'2\" - 5'4\"" },
    { size: "S", chest: "34-36", waist: "28-30", height: "5'4\" - 5'6\"" },
    { size: "M", chest: "36-38", waist: "30-32", height: "5'6\" - 5'8\"" },
    { size: "L", chest: "38-40", waist: "32-34", height: "5'8\" - 5'10\"" },
    { size: "XL", chest: "40-42", waist: "34-36", height: "5'10\" - 6'0\"" },
    { size: "XXL", chest: "42-44", waist: "36-38", height: "6'0\" - 6'2\"" },
  ];

  const shoeSizeChart = [
    { india: "5", uk: "5", us: "6", eu: "38", footLength: "23.5" },
    { india: "6", uk: "6", us: "7", eu: "39", footLength: "24.5" },
    { india: "7", uk: "7", us: "8", eu: "41", footLength: "25.5" },
    { india: "8", uk: "8", us: "9", eu: "42", footLength: "26.5" },
    { india: "9", uk: "9", us: "10", eu: "43", footLength: "27.5" },
    { india: "10", uk: "10", us: "11", eu: "44", footLength: "28.5" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ruler className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Size Guide</h1>
          <p className="text-gray-600 mt-2">Find your perfect fit with our size charts</p>
        </div>

        <div className="space-y-8">
          {/* Apparel Size Chart */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shirt className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Apparel Size Chart (Men's)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left">Size</th>
                    <th className="p-3 text-left">Chest (inches)</th>
                    <th className="p-3 text-left">Waist (inches)</th>
                    <th className="p-3 text-left">Height</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((size) => (
                    <tr key={size.size} className="border-t">
                      <td className="p-3 font-semibold">{size.size}</td>
                      <td className="p-3">{size.chest}</td>
                      <td className="p-3">{size.waist}</td>
                      <td className="p-3">{size.height}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shoe Size Chart */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Footprints className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Shoe Size Chart</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left">India (UK)</th>
                    <th className="p-3 text-left">US</th>
                    <th className="p-3 text-left">EU</th>
                    <th className="p-3 text-left">Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {shoeSizeChart.map((size, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 font-semibold">{size.india}</td>
                      <td className="p-3">{size.us}</td>
                      <td className="p-3">{size.eu}</td>
                      <td className="p-3">{size.footLength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-800">
              📏 Need help with sizing? Contact our support team for personalized assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}