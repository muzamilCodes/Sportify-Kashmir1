"use client";

import { Minus, Plus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Subcategories mapping
const subcategoriesMap: { [key: string]: string[] } = {
  cricket: ["Bats", "Balls", "Pads", "Gloves", "Helmets", "Shoes", "Clothing"],
  football: ["Boots", "Balls", "Jerseys", "Shin Guards", "Goal Gloves", "Socks"],
  basketball: ["Shoes", "Balls", "Jerseys", "Hoops", "Accessories"],
  tennis: ["Rackets", "Balls", "Strings", "Grips", "Shoes", "Bags"],
  fitness: ["Dumbbells", "Yoga Mats", "Gym Wear", "Supplements", "Bench", "Accessories"],
  apparel: ["Jerseys", "Shorts", "Tracksuits", "Compression Wear", "Socks", "Caps"],
};

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ _id: string; name: string }[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    category: "",
    subcategory: "",
    brand: "",
    stock: "",
    isAvailable: true,
    isArchived: false,
    onSale: false,
  });

  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch(`${apiUrl}/category/all`),
          fetch(`${apiUrl}/brand/all`)
        ]);

        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
        if (brandsData.success) {
          setBrands(brandsData.data);
        }
      } catch (error) {
        console.error("Error fetching categories/brands:", error);
      }
    };
    fetchData();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(c => c._id === formData.category);
      const categoryName = selectedCategory?.name.toLowerCase() || "";
      const subs = subcategoriesMap[categoryName] || [];
      setAvailableSubcategories(subs);
      setFormData(prev => ({ ...prev, subcategory: "" }));
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category, categories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files);
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors((prev) => [...prev, newColor.trim()]);
      setNewColor("");
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors((prev) => prev.filter((color) => color !== colorToRemove));
  };

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes((prev) => [...prev, newSize.trim()]);
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setSizes((prev) => prev.filter((size) => size !== sizeToRemove));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("discount", formData.discount || "0");
      data.append("category", formData.category);
      data.append("subcategory", formData.subcategory);
      if (formData.brand) data.append("brand", formData.brand);
      data.append("stock", formData.stock || "0");
      data.append("onSale", formData.onSale.toString());
      data.append("colors", colors.join(","));
      data.append("sizes", sizes.join(","));
      data.append("tags", tags.join(","));
      if (images.length > 0) {
        data.append("image", images[0]);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Product added successfully!");
        router.push("/admin/products");
      } else {
        toast.error(result.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600">Add a new product to your store</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>

            {availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Subcategory (Optional)</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub.toLowerCase()}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand (Optional)</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Brand (Optional)</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>{brand.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-4 h-4 rounded focus:ring-orange-500" />
                  <span className="text-sm text-gray-700">Available for sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isArchived" checked={formData.isArchived} onChange={handleChange} className="w-4 h-4 rounded focus:ring-orange-500" />
                  <span className="text-sm text-gray-700">Archive product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="w-4 h-4 rounded focus:ring-orange-500" />
                  <span className="text-sm text-orange-600 font-medium">Mark as on sale</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Describe your product..."
            />
          </div>
        </div>

        {/* ✅ Product Images Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Product Images *</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Click to browse or drag & drop images</p>
            <p className="text-sm text-gray-500 mb-4">Supports JPG, PNG, WEBP. Max 5MB per image.</p>
            <label className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-orange-600 transition">
              Browse Files
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Uploaded Images ({imagePreviews.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Colors Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Colors</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Add a color (e.g., Red, Blue, Black)"
            />
            <button type="button" onClick={addColor} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm">{color}</span>
                <button type="button" onClick={() => removeColor(color)} className="text-red-500 hover:text-red-700">
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {colors.length === 0 && <p className="text-sm text-gray-400">No colors added yet</p>}
          </div>
        </div>

        {/* ✅ Sizes Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sizes</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Add a size (e.g., S, M, L, XL)"
            />
            <button type="button" onClick={addSize} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm">{size}</span>
                <button type="button" onClick={() => removeSize(size)} className="text-red-500 hover:text-red-700">
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {sizes.length === 0 && <p className="text-sm text-gray-400">No sizes added yet</p>}
          </div>
        </div>

        {/* ✅ Tags Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Add a tag (e.g., New, Popular, Sale)"
            />
            <button type="button" onClick={addTag} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                <span className="text-sm">{tag}</span>
                <button type="button" onClick={() => removeTag(tag)} className="text-blue-500 hover:text-red-500">
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-sm text-gray-400">No tags added yet</p>}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg">
          <button type="submit" disabled={loading} className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50">
            {loading ? <div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Adding Product...</div> : "Add Product"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}