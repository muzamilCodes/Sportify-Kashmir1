"use client";

import { useEffect, useState } from "react";
import { Box, AlertTriangle, CheckCircle, Search, Edit3, Loader2, Save, X } from "lucide-react";
import toast from "react-hot-toast";

interface ProductInventory {
  _id: string;
  name: string;
  price: number;
  stock: number;
  availableQuantity: number;
  soldQuantity: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
}

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "instock" | "out">("all");
  
  const [stats, setStats] = useState({
    totalItemsInStock: 0,
    lowStockAlerts: 0,
    inStockCategories: 0,
    outOfStock: 0,
  });

  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductInventory | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");

      const res = await fetch(`${baseUrl}/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!result.success || !result.data) throw new Error(result.message || "Inventory endpoint failed");
      setStats({
        totalItemsInStock: result.data.totalItemsInStock || 0,
        lowStockAlerts: result.data.lowStockAlerts || 0,
        inStockCategories: result.data.inStockCategories || 0,
        outOfStock: result.data.products?.filter((p: ProductInventory) => p.isOutOfStock).length || 0,
      });
      setProducts(result.data.products || []);
    } catch (error) {
      console.error("Inventory error:", error);
      toast.error("Error loading inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setUpdating(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${baseUrl}/admin/inventory/stock/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ stock: newStockVal }),
        }
      );
      const result = await res.json();

      if (result.success) {
        toast.success("Stock updated successfully");
        setEditingProduct(null);
        fetchInventory();
      } else {
        toast.error(result.message || "Failed to update stock");
      }
    } catch (error) {
      console.error("Stock update error:", error);
      toast.error("Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  const getCategoryName = (category: ProductInventory["category"]) => {
    if (!category) return "General";
    if (typeof category === "string") return category;
    return category.name || "General";
  };

  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (stockFilter === "low") return item.isLowStock;
    if (stockFilter === "out") return item.isOutOfStock;
    if (stockFilter === "instock") return (item.stock || 0) > 10;
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Monitor and adjust real-time stock levels across all products.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search inventory..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-700 focus:outline-none focus:border-orange-500 shadow-sm font-medium"
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock (≤10)</option>
            <option value="out">Out of Stock (0)</option>
            <option value="instock">In Stock (&gt;10)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Box size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total In Stock</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalItemsInStock.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-amber-600">{stats.lowStockAlerts}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Active Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.inStockCategories}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Product Inventory List</h2>
          <span className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded-full text-gray-600">
            {filteredProducts.length} Items Found
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Loading inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              Try adjusting your search term or stock status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold uppercase text-gray-600">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Available</th>
                  <th className="px-6 py-4">Sold</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isLow = product.isLowStock;
                  const isOut = product.isOutOfStock;

                  return (
                    <tr key={product._id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getCategoryName(product.category)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-gray-900">
                        {product.availableQuantity} units
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-gray-700">
                        {product.soldQuantity} units
                      </td>
                      <td className="px-6 py-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setNewStockVal(product.stock || 0);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-bold border border-orange-200 transition-colors"
                        >
                          <Edit3 size={14} /> Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Stock Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Update Stock Quantity</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Product: <span className="font-bold text-gray-900">{editingProduct.name}</span>
            </p>

            <form onSubmit={handleUpdateStock}>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
                  Stock Quantity (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Quantity
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
