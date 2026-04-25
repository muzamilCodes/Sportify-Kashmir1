"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Check,
  Loader2,
  FolderTree,
  Tag,
  Clock,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // ✅ Backend endpoint: /category/all
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/all`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      const result = await response.json();
      
      // ✅ Backend returns: { success: true, message: "...", data: [...] }
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      // ✅ Backend endpoints:
      // POST /category/add
      // PUT /category/edit/:categoryId
      
      let url, method;
      if (editingCategory) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/category/edit/${editingCategory._id}`;
        method = "PUT";
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL}/category/add`;
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingCategory ? "Category updated!" : "Category created!");
        setShowModal(false);
        fetchCategories(); // Refresh list
      } else {
        toast.error(result.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    setDeletingId(categoryId);
    try {
      const token = localStorage.getItem("token");
      
      // ✅ Backend endpoint: DELETE /category/delete/:categoryId
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/delete/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Category deleted successfully!");
        fetchCategories(); // Refresh list
      } else {
        toast.error(result.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Manage your product categories</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Try a different search term" : "Get started by creating your first category"}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddNew}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600"
              >
                + Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((category) => (
              <div
                key={category._id}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Category Icon */}
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Tag className="w-6 h-6 text-orange-500" />
                  </div>

                  {/* Category Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>

                  {/* Description */}
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      disabled={deletingId === category._id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {deletingId === category._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cricket, Football, Fitness"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe this category..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingCategory ? "Update Category" : "Create Category"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}