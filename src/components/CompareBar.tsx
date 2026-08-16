"use client";
import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function CompareBar() {
  const [count, setCount] = useState(0);
  useEffect(() => { const sync = () => setCount(JSON.parse(localStorage.getItem("compareProducts") || "[]").length); sync(); window.addEventListener("storage", sync); window.addEventListener("compareUpdated", sync); return () => { window.removeEventListener("storage", sync); window.removeEventListener("compareUpdated", sync); }; }, []);
  if (!count) return null;
  return <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900 px-4 py-2 text-white shadow-xl md:bottom-6"><GitCompare className="h-4 w-4 text-orange-400" /><span className="text-sm">{count} selected</span><Link href="/compare" className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold">Compare</Link><button onClick={() => { localStorage.removeItem("compareProducts"); window.dispatchEvent(new Event("compareUpdated")); }} aria-label="Clear comparison"><X className="h-4 w-4" /></button></div>;
}
