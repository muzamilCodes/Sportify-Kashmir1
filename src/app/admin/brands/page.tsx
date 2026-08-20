"use client";

import { Edit, Plus, Search, Trash2, Award, Clock, X, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductImage from "@/components/ProductImage";

interface Brand {
  _id: string;
  name: string;
  description: string;
  image?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", description: "", image: "" });

  const getApiUrl = () => (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Fetch all brands
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/brand/all`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setBrands(result.data);
        setFilteredBrands(result.data);
      } else {
        setBrands([]);
        setFilteredBrands([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    let filtered = [...brands];
    if (searchTerm) {
      filtered = filtered.filter(
        (brand) =>
          brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (brand.description && brand.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredBrands(filtered);
  }, [searchTerm, brands]);

  // Handle add brand
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${getApiUrl()}/brand/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim(),
          logo: formData.image.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Brand added successfully!");
        setShowAddModal(false);
        setFormData({ name: "", description: "", image: "" });
        fetchBrands();
      } else {
        toast.error(result.message || "Failed to add brand");
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      toast.error("Failed to add brand");
    } finally {
      setSaving(false);
    }
  };

  // Handle edit brand
  const handleEditBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !editingBrand) {
      toast.error("Brand name is required");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${getApiUrl()}/brand/edit/${editingBrand._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim(),
          logo: formData.image.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Brand updated successfully!");
        setEditingBrand(null);
        setFormData({ name: "", description: "", image: "" });
        fetchBrands();
      } else {
        toast.error(result.message || "Failed to update brand");
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      toast.error("Failed to update brand");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete brand
  const handleDeleteBrand = async (brandId: string) => {
    setDeletingId(brandId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${getApiUrl()}/brand/delete/${brandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Brand deleted successfully!");
        setShowDeleteConfirm(null);
        fetchBrands();
      } else {
        toast.error(result.message || "Failed to delete brand");
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Failed to delete brand");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || "",
      image: brand.image || brand.logo || "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-sm text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage brand partnerships and logos</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", description: "", image: "" });
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Brand
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search brands by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>
      </div>

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No brands found</p>
          <p className="text-gray-400 text-xs mt-1">Add your first sports brand to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              {/* Brand Banner / Logo Display */}
              <div className="relative h-28 w-full bg-gray-50 flex items-center justify-center p-3 border-b">
                {brand.image || brand.logo ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border p-1 bg-white shadow-sm">
                    <ProductImage
                      product={brand.image || brand.logo}
                      alt={brand.name}
                      fill
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-orange-500" />
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">
                    {brand.name}
                  </h3>
                  {brand.description && (
                    <p className="text-gray-500 text-xs text-center line-clamp-2 mb-3">
                      {brand.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => openEditModal(brand)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(brand._id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add New Brand</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Nike, Adidas, SS, SG"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Brand Logo / Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
                {formData.image && (
                  <div className="mt-2 relative h-16 w-16 mx-auto rounded-full overflow-hidden border">
                    <ProductImage
                      product={formData.image}
                      alt="Brand preview"
                      fill
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of the brand..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 border rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {editingBrand && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Brand</h2>
              <button
                onClick={() => setEditingBrand(null)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Brand Logo / Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
                {formData.image && (
                  <div className="mt-2 relative h-16 w-16 mx-auto rounded-full overflow-hidden border">
                    <ProductImage
                      product={formData.image}
                      alt="Brand preview"
                      fill
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="flex-1 py-2 border rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Brand?</h3>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to delete this brand? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 border rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBrand(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center justify-center"
              >
                {deletingId === showDeleteConfirm ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}