"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { resolveProductImage } from "@/lib/imageHelper";

type RecentlyViewedProduct = { _id: string; name: string; price: number; discount?: number; productImgUrls?: string[] };

export default function RecentlyViewed({ products }: { products: RecentlyViewedProduct[] }) {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);
  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("recentlyViewed") || "[]") as string[];
    setItems(ids.map((id) => products.find((product) => product._id === id)).filter(Boolean) as RecentlyViewedProduct[]);
  }, [products]);
  if (!items.length) return null;
  return <section className="mb-12"><div className="mb-5 flex items-end justify-between"><div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Viewed</h2><p className="mt-1 text-sm text-gray-500">Pick up where you left off</p></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{items.slice(0, 5).map((product) => { const price = product.discount ? product.price * (1 - product.discount / 100) : product.price; const imageUrl = resolveProductImage(product); return <Link key={product._id} href={`/product/${product._id}`} className="rounded-xl border bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800"><div className="relative aspect-square w-full"><Image src={imageUrl} alt={product.name} fill unoptimized referrerPolicy="no-referrer" sizes="(max-width: 640px) 50vw, 20vw" className="rounded-lg bg-gray-50 object-contain" /></div><p className="mt-2 line-clamp-2 text-sm font-medium text-gray-800 dark:text-white">{product.name}</p><p className="mt-1 font-bold text-orange-600">₹{Math.round(price).toLocaleString("en-IN")}</p></Link>; })}</div></section>;
}
