"use client";

import Link from "next/link";
import { 
  Goal, 
  Activity, 
  Bike, 
  Waves, 
  Tent, 
  Dumbbell, 
  Trophy, 
  ChevronRight,
  Shirt,
  Pocket,
  Gamepad2
} from "lucide-react";

// Using the same generic icon mapping we use in Header for simplicity
const sports = [
  { name: "Football", href: "/categories/football", icon: <Goal size={32} />, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50" },
  { name: "Cricket", href: "/categories/cricket", icon: <Activity size={32} />, color: "from-green-500 to-emerald-600", bg: "bg-green-50" },
  { name: "Badminton", href: "/categories/badminton", icon: <Activity size={32} />, color: "from-red-400 to-orange-500", bg: "bg-red-50" },
  { name: "Basketball", href: "/categories/basketball", icon: <Activity size={32} />, color: "from-orange-500 to-red-600", bg: "bg-orange-50" },
  { name: "Volleyball", href: "/categories/volleyball", icon: <Activity size={32} />, color: "from-yellow-400 to-orange-500", bg: "bg-yellow-50" },
  { name: "Tennis", href: "/categories/tennis", icon: <Activity size={32} />, color: "from-green-400 to-lime-500", bg: "bg-lime-50" },
  { name: "Gym & Fitness", href: "/categories/gym-fitness", icon: <Dumbbell size={32} />, color: "from-slate-600 to-gray-800", bg: "bg-slate-100" },
  { name: "Running", href: "/categories/running", icon: <Activity size={32} />, color: "from-cyan-400 to-blue-500", bg: "bg-cyan-50" },
  { name: "Cycling", href: "/categories/cycling", icon: <Bike size={32} />, color: "from-emerald-400 to-teal-600", bg: "bg-teal-50" },
  { name: "Swimming", href: "/categories/swimming", icon: <Waves size={32} />, color: "from-blue-400 to-cyan-500", bg: "bg-sky-50" },
  { name: "Indoor Games", href: "/categories/indoor-games", icon: <Gamepad2 size={32} />, color: "from-purple-500 to-pink-600", bg: "bg-purple-50" },
  { name: "Sports Wear", href: "/categories/sports-wear", icon: <Shirt size={32} />, color: "from-pink-500 to-rose-600", bg: "bg-pink-50" },
  { name: "Sports Shoes", href: "/categories/sports-shoes", icon: <Tent size={32} />, color: "from-orange-400 to-red-500", bg: "bg-orange-50" },
  { name: "Accessories", href: "/categories/accessories", icon: <Pocket size={32} />, color: "from-gray-500 to-slate-700", bg: "bg-gray-100" },
  { name: "Cups & Trophies", href: "/categories/cups-trophies", icon: <Trophy size={32} />, color: "from-yellow-500 to-amber-600", bg: "bg-yellow-50" },
];

export default function SportsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-brand mb-4 tracking-tight">
            Explore All Sports
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find specialized gear, apparel, and equipment for your favorite sport. We carry top brands to help you elevate your game.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sports.map((sport, index) => (
            <Link 
              key={index} 
              href={sport.href}
              className="group relative glass rounded-3xl p-8 hover-lift overflow-hidden border border-white/60 hover:border-orange-200 transition-all duration-300"
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${sport.color} opacity-5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 group-hover:opacity-10 transition-transform duration-700`}></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 ${sport.bg} rounded-2xl flex items-center justify-center mb-6 text-gray-700 group-hover:text-white group-hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${sport.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    {sport.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-brand transition-colors">
                  {sport.name}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center text-sm font-bold text-orange-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Shop Now <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
