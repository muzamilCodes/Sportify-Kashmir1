"use client";

import { Edit, Search, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { productApi } from "@/lib/api";
import { resolveProductImage } from "@/lib/imageHelper";
import ProductImage from "@/components/ProductImage";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  isAvailable: boolean;
  isArchived: boolean;
  stock: number;
  onSale: boolean;
}

export default function AdminSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll();
      const allProducts = Array.isArray(res.data) ? res.data : res.data?.items || [];
      const activeProducts = allProducts.filter((p: Product) => !p.isArchived);
      setProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/category/all`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterProducts = () => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((p) => {
        const catId = typeof p.category === "object" ? p.category?._id : p.category;
        return catId === selectedCategory;
      });
    }

    setFilteredProducts(result);
  };

  const handleToggleSale = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await productApi.update(productId, { onSale: !currentStatus });
      if (res.success) {
        toast.success(currentStatus ? "Removed from sale" : "Added to sale");
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, onSale: !currentStatus } : p))
        );
      }
    } catch (error) {
      console.error("Error toggling sale:", error);
      toast.error("Failed to update product");
    }
  };

  const getCategoryName = (category: Product["category"]) => {
    if (!category) return "Uncategorized";
    if (typeof category === "string") return category;
    return category.name || "Uncategorized";
  };

  const getBrandName = (brand: Product["brand"]) => {
    if (!brand) return "Generic";
    if (typeof brand === "string") return brand;
    return brand.name || "Generic";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sale Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage discounts and flash sale products</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Brand</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">On Sale</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/80">
                    {/* Product Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border">
                          <ProductImage
                            product={product}
                            alt={product.name}
                            fill
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 text-gray-600">{getCategoryName(product.category)}</td>

                    {/* Brand */}
                    <td className="p-4 text-gray-600">{getBrandName(product.brand)}</td>

                    {/* Price */}
                    <td className="p-4">
                      <span className="font-semibold text-gray-900">₹{product.price}</span>
                      {Boolean(product.discount && product.discount > 0) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                          {product.discount}% OFF
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                    </td>

                    {/* On Sale Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleSale(product._id, product.onSale)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                          product.onSale
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {product.onSale ? "Active Sale" : "Not on Sale"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <Link
                        href={`/admin/products/edit/${product._id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex items-center"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
