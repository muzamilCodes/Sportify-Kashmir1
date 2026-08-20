"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, GitCompare } from "lucide-react";
import ProductImage from "@/components/ProductImage";

type Product = {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  stock: number;
  colors?: string[];
  sizes?: string[];
  description?: string;
  productImgUrls?: string[];
  brand?: { name: string } | string;
  category?: { name: string } | string;
};

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const api = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("compareProducts") || "[]") as string[];
    if (!ids.length) return;
    fetch(`${api}/product/getAll`)
      .then((r) => r.json())
      .then((result) => {
        const list = Array.isArray(result.data) ? result.data : result.data?.items || [];
        setProducts(list.filter((item: Product) => ids.includes(item._id)));
      })
      .catch(() => setProducts([]));
  }, [api]);

  const remove = (id: string) => {
    const ids = (JSON.parse(localStorage.getItem("compareProducts") || "[]") as string[]).filter(
      (item: string) => item !== id
    );
    localStorage.setItem("compareProducts", JSON.stringify(ids));
    setProducts((items) => items.filter((item) => item._id !== id));
    window.dispatchEvent(new Event("compareUpdated"));
  };

  const rows: Array<[string, (product: Product) => string]> = [
    [
      "Price",
      (p) =>
        `₹${Math.round(p.discount ? p.price * (1 - p.discount / 100) : p.price).toLocaleString(
          "en-IN"
        )}`,
    ],
    [
      "Brand",
      (p) => (typeof p.brand === "object" ? p.brand?.name || "—" : p.brand || "—"),
    ],
    [
      "Category",
      (p) => (typeof p.category === "object" ? p.category?.name || "—" : p.category || "—"),
    ],
    ["Availability", (p) => (p.stock > 0 ? "In stock" : "Out of stock")],
    ["Sizes", (p) => p.sizes?.join(", ") || "—"],
    ["Colors", (p) => p.colors?.join(", ") || "—"],
  ];

  return (
    <div className="container mx-auto min-h-screen px-4 py-8 max-w-6xl">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-2 text-sm text-orange-600 font-medium"
      >
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>
      <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Compare products</h1>
      <p className="mb-6 text-sm text-gray-500">Compare up to 4 sports products side by side.</p>

      {!products.length ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-gray-500 dark:bg-gray-800">
          <GitCompare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No products selected for comparison.</p>
          <p className="text-xs text-gray-400 mt-1">
            Click the compare button on any product card to add it here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-gray-800 shadow-sm">
          <table className="min-w-[680px] w-full text-left text-sm">
            <tbody>
              <tr>
                <th className="w-40 p-4 text-gray-500 bg-gray-50 dark:bg-gray-750">Product</th>
                {products.map((p) => (
                  <td key={p._id} className="p-4 align-top">
                    <div className="relative mb-3 h-36 w-full rounded-lg bg-gray-50 dark:bg-gray-850 p-2 overflow-hidden border">
                      <ProductImage
                        product={p}
                        alt={p.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Link
                      href={`/product/${p._id}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 line-clamp-2"
                    >
                      {p.name}
                    </Link>
                    <button
                      onClick={() => remove(p._id)}
                      className="mt-2 block text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                ))}
              </tr>
              {rows.map(([label, get]) => (
                <tr key={label} className="border-t">
                  <th className="p-4 text-gray-500 bg-gray-50 dark:bg-gray-750">{label}</th>
                  {products.map((p) => (
                    <td key={p._id} className="p-4 text-gray-800 dark:text-gray-200">
                      {get(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
