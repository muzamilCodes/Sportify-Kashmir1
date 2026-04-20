"use client";

import { Edit, Eye, Filter, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  colors: string[];
  sizes: string[];
  isAvailable: boolean;
  isArchived: boolean;
  stock: number;
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  tags: string[];
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
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

  // Fetch all products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/getAll`,
      );

      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load products");
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

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => getCategoryName(product.category) === categoryFilter,
      );
    }

    // Status filter
    if (statusFilter === "available") {
      filtered = filtered.filter((product) => product.isAvailable);
    } else if (statusFilter === "unavailable") {
      filtered = filtered.filter((product) => !product.isAvailable);
    } else if (statusFilter === "archived") {
      filtered = filtered.filter((product) => product.isArchived);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, statusFilter, products]);

  

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/delete/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Product deleted successfully");
        fetchProducts(); // Refresh list
        setShowDeleteConfirm(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  // Archive product
  const handleArchiveProduct = async (productId: string, archive: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/archive/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archive }),
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success(
          `Product ${archive ? "archived" : "unarchived"} successfully`,
        );
        fetchProducts(); // Refresh list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

// Toggle availability
  const handleToggleAvailability = async (
    productId: string,
    available: boolean,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/isAvialable/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success(
          `Product ${available ? "activated" : "deactivated"} successfully`,
        );
        fetchProducts(); // Refresh list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const categories = ["all", ...new Set(products.map((p) => getCategoryName(p.category)).filter(Boolean))];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((cat) => cat !== "all")
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="archived">Archived</option>
            </select>
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
            <p className="text-gray-600 mb-4">No products found</p>
            <Link
              href="/admin/products/new"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
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

                    {/* Status */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              product.isAvailable
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm">
                            {product.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        {product.isArchived && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* View */}
                        <Link
                          href={`/product/${product._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>

                        {/* Toggle Availability */}
                        <button
                          onClick={() =>
                            handleToggleAvailability(
                              product._id,
                              !product.isAvailable,
                            )
                          }
                          className={`p-2 rounded-lg ${
                            product.isAvailable
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={
                            product.isAvailable ? "Deactivate" : "Activate"
                          }
                        >
                          {product.isAvailable ? "Deactivate" : "Activate"}
                        </button>

                        {/* Archive/Unarchive */}
                        <button
                          onClick={() =>
                            handleArchiveProduct(
                              product._id,
                              !product.isArchived,
                            )
                          }
                          className={`p-2 rounded-lg ${
                            product.isArchived
                              ? "text-blue-600 hover:bg-blue-50"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                          title={product.isArchived ? "Unarchive" : "Archive"}
                        >
                          {product.isArchived ? "Unarchive" : "Archive"}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setShowDeleteConfirm(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Delete Confirmation Modal */}
                      {showDeleteConfirm === product._id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
                            <h3 className="text-lg font-bold mb-2">
                              Confirm Delete
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Are you sure you want to delete "{product.name}"?
                              This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
