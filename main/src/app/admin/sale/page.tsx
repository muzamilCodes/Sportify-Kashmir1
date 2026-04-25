"use client";

import { Edit, Search, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { productApi } from "@/lib/api";

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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Helper function to get image URL
  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  // Handle image error
  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set([...prev, productId]));
  };

  // Helper to get category name
  const getCategoryName = (category: Product['category']) => {
    if (!category) return 'N/A';
    if (typeof category === 'string') return category;
    return category.name || 'N/A';
  };

  // Helper to get brand name
  const getBrandName = (brand: Product['brand']) => {
    if (!brand) return 'N/A';
    if (typeof brand === 'string') return brand;
    return brand.name || 'N/A';
  };

  // Fetch all products (not just sale products)
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch all products, not just sale products
      const response = await productApi.getAllProducts();
      if (response.success && response.data) {
        // Filter for products that are on sale
        const saleProducts = response.data.filter((p: Product) => p.onSale);
        setProducts(saleProducts);
        setFilteredProducts(saleProducts);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load sale products");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Toggle sale status
  const handleToggleSale = async (productId: string, currentOnSale: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/edit/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ onSale: !currentOnSale }),
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success(
          `Product ${!currentOnSale ? "added to" : "removed from"} sale successfully`,
        );
        fetchProducts(); // Refresh list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sale Management</h1>
          <p className="text-gray-600">Manage products on sale</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search sale products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No products on sale</p>
            <Link
              href="/admin/products"
              className="text-blue-600 hover:text-blue-800"
            >
              Go to Products to add items on sale
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">On Sale</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-t hover:bg-gray-50">
                    {/* Product Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.productImgUrls && product.productImgUrls.length > 0 && !imageErrors.has(product._id) ? (
                            <img
                              src={getImageUrl(product.productImgUrls[0])}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(product._id)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        {getCategoryName(product.category)}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        {getBrandName(product.brand)}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div>
                        <p className="font-medium">₹{product.price}</p>
                        {product.discount && (
                          <p className="text-sm text-green-600">
                            Discount: {product.discount}%
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            product.stock > 10
                              ? "bg-green-500"
                              : product.stock > 0
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        ></div>
                        <span>{product.stock}</span>
                      </div>
                    </td>

                    {/* On Sale */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            product.onSale ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        <span className={product.onSale ? "text-green-600" : "text-gray-600"}>
                          {product.onSale ? "On Sale" : "Not on Sale"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>

                        {/* Toggle Sale */}
                        <button
                          onClick={() => handleToggleSale(product._id, product.onSale)}
                          className={`p-2 rounded-lg ${
                            product.onSale
                              ? "text-red-600 hover:bg-red-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={product.onSale ? "Remove from Sale" : "Add to Sale"}
                        >
                          <Tag size={18} />
                        </button>
                      </div>
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
