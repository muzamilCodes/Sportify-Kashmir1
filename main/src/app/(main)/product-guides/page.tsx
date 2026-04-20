"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, TrendingUp, Shield, Award } from "lucide-react";

export default function ProductGuidesPage() {
  const guides = [
    {
      title: "How to Choose the Right Cricket Bat",
      description: "Complete guide to selecting the perfect cricket bat based on your playing style and level.",
      icon: <TrendingUp className="w-8 h-8" />,
      readTime: "5 min read",
      category: "Cricket",
    },
    {
      title: "Football Boots Buying Guide",
      description: "Find the perfect football boots for your position and playing surface.",
      icon: <Award className="w-8 h-8" />,
      readTime: "4 min read",
      category: "Football",
    },
    {
      title: "Gym Equipment Selection Guide",
      description: "Essential guide for building your home gym with the right equipment.",
      icon: <Shield className="w-8 h-8" />,
      readTime: "6 min read",
      category: "Fitness",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Product Guides</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Expert guides to help you choose the right sports equipment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-lg transition">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                {guide.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{guide.category}</span>
                <span className="text-xs text-gray-500">{guide.readTime}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h3>
              <p className="text-gray-600 mb-4">{guide.description}</p>
              <Link href="#" className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                Read Guide <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}