"use client";

import { Wrench, Droplet, Sun, Shield, CheckCircle } from "lucide-react";

export default function MaintenanceTipsPage() {
  const tips = [
    {
      title: "Cricket Bat Care",
      icon: <Wrench className="w-6 h-6" />,
      tips: [
        "Knock in your new bat before use",
        "Apply linseed oil regularly",
        "Store in a cool, dry place",
        "Avoid using on wet pitches",
      ],
    },
    {
      title: "Football Boots Maintenance",
      icon: <Droplet className="w-6 h-6" />,
      tips: [
        "Clean after every use",
        "Remove mud and dirt immediately",
        "Air dry naturally, away from direct heat",
        "Use shoe trees to maintain shape",
      ],
    },
    {
      title: "Gym Equipment Care",
      icon: <Sun className="w-6 h-6" />,
      tips: [
        "Wipe down after each use",
        "Check for loose bolts regularly",
        "Lubricate moving parts",
        "Keep away from moisture",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Maintenance Tips</h1>
          <p className="text-gray-600 mt-2">Keep your sports equipment in top condition</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
                  {tip.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{tip.title}</h2>
              </div>
              <ul className="space-y-2">
                {tip.tips.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-800">
            💡 For professional cleaning and servicing, visit our Handwara store or contact us at +91 9682645127
          </p>
        </div>
      </div>
    </div>
  );
}