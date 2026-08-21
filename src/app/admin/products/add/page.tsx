"use client";

import { Minus, Plus, Upload, X, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { clearCachedJson } from "@/lib/clientCache";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string; subcategories?: string[] }[]>([]);
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

  // Fetch categories and brands
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
        console.error("Error fetching data:", error);
        toast.error("Failed to load categories and brands");
      }
    };
    fetchData();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(c => c._id === formData.category);
      const subs = selectedCategory?.subcategories || [];
      setAvailableSubcategories(subs);
      setFormData(prev => ({ ...prev, subcategory: "" }));
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category, categories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const replaceImage = (index: number, file?: File) => {
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Please select a valid image smaller than 5MB");
      return;
    }
    const nextPreview = URL.createObjectURL(file);
    setImages((prev) => prev.map((item, i) => (i === index ? file : item)));
    setImagePreviews((prev) => prev.map((item, i) => (i === index ? nextPreview : item)));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsMainCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.unshift(moved);
      return updated;
    });
    setImagePreviews((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.unshift(moved);
      return updated;
    });
    toast.success("Set as Main Cover Image!");
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

    if (!formData.name || !formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    if (images.length < 3) {
      toast.error(`Please upload at least 3 product images (${images.length}/3 selected)`);
      const el = document.getElementById("image-upload-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("description", formData.description || "");
      data.append("price", formData.price);
      data.append("discount", formData.discount || "0");
      data.append("category", formData.category);
      data.append("subcategory", formData.subcategory || "");
      data.append("stock", formData.stock || "0");
      data.append("onSale", formData.onSale.toString());
      
      if (formData.brand) {
        data.append("brand", formData.brand);
      }

      if (colors.length > 0) data.append("colors", colors.join(","));
      if (sizes.length > 0) data.append("sizes", sizes.join(","));
      if (tags.length > 0) data.append("tags", tags.join(","));

      images.forEach((image) => data.append("images", image));

      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        clearCachedJson();
        toast.success("Product added successfully!");
        router.push("/admin/products");
        router.refresh();
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Add a new product to your store catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Category */}
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
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory (Optional)
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Subcategory</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub.toLowerCase()}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand (Optional)</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
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

            {/* Discount */}
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

            {/* Stock */}
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

            {/* Checkboxes */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-4 h-4 text-green-600 rounded" />
                  <span className="text-sm text-gray-700">Available for sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isArchived" checked={formData.isArchived} onChange={handleChange} className="w-4 h-4 text-gray-600 rounded" />
                  <span className="text-sm text-gray-700">Archive product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="onSale" checked={formData.onSale} onChange={handleChange} className="w-4 h-4 text-orange-600 rounded" />
                  <span className="text-sm text-orange-600 font-medium">Mark as on sale</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
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

        {/* ✅ Amazon-Style Product Images Section */}
        <div id="image-upload-section" className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Product Images <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">Min 3 Required</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Amazon-style product media gallery. Upload 3 or more high-resolution images for optimal buyer experience.
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${images.length < 3 ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"}`}>
              {images.length < 3 ? `⚠️ ${images.length} / 3 Images Selected` : `✓ ${images.length} Images Uploaded`}
            </span>
          </div>

          {/* Validation Alert Banner */}
          {images.length < 3 ? (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900">At least 3 images are required</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Please upload {3 - images.length} more image{3 - images.length === 1 ? "" : "s"} to fulfill product listing guidelines. First image will be used as the Main Cover Image on store listings.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-green-900">Image requirement satisfied</h4>
                <p className="text-xs text-green-700 mt-0.5">
                  {images.length} product images selected. Slot 1 is set as your Primary Cover Image.
                </p>
              </div>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div className="border-2 border-dashed border-gray-300 hover:border-orange-500 transition-colors rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-orange-50/20 mb-6 group cursor-pointer relative">
            <input
              type="file"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-gray-800">Drop your product images here, or <span className="text-orange-600 underline">browse</span></p>
            <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, WEBP. Maximum 5MB per file.</p>
          </div>

          {/* Amazon-style Image Slot Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">Image Gallery ({imagePreviews.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`relative group rounded-xl border-2 overflow-hidden bg-gray-900 shadow-sm transition-all ${
                    index === 0 ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <img src={preview} alt={`Product Slot ${index + 1}`} className="w-full h-44 object-cover group-hover:opacity-90 transition-opacity" />

                  {/* Main Image Badge */}
                  {index === 0 ? (
                    <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow tracking-wider">
                      ★ Main Cover Image
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Slot {index + 1}
                    </span>
                  )}

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg shadow transition-transform hover:scale-105"
                        title="Remove Image"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsMainCover(index)}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 rounded-lg shadow text-center transition-colors"
                        >
                          Set as Main Cover
                        </button>
                      )}
                      <label className="w-full bg-white/95 hover:bg-white text-gray-900 text-xs font-bold py-1.5 rounded-lg shadow text-center cursor-pointer transition-colors">
                        Replace Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => replaceImage(index, e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {/* Placeholder slots for required minimum 3 */}
              {Array.from({ length: Math.max(0, 3 - imagePreviews.length) }).map((_, i) => {
                const slotNum = imagePreviews.length + i + 1;
                const slotLabels: Record<number, string> = {
                  1: "Main Cover Image",
                  2: "Angle / Detail View",
                  3: "Packaging / Extra View",
                };

                return (
                  <label
                    key={`slot-${slotNum}`}
                    className="border-2 border-dashed border-red-200 bg-red-50/30 rounded-xl h-44 flex flex-col items-center justify-center text-center p-4 hover:border-orange-400 hover:bg-orange-50/30 transition-colors cursor-pointer group"
                  >
                    <Upload className="w-8 h-8 text-red-400 group-hover:text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-gray-700">Add Image {slotNum} *</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">{slotLabels[slotNum] || "Product View"}</span>
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
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
            <button
              type="button"
              onClick={addColor}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {colors.length === 0 && <p className="text-sm text-gray-400">No colors added yet</p>}
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
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
            <button
              type="button"
              onClick={addSize}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm">{size}</span>
                <button
                  type="button"
                  onClick={() => removeSize(size)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {sizes.length === 0 && <p className="text-sm text-gray-400">No sizes added yet</p>}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
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
            <button
              type="button"
              onClick={addTag}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                <span className="text-sm">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-500 hover:text-red-500"
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-sm text-gray-400">No tags added yet</p>}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border z-20">
          <button
            type="submit"
            disabled={loading || images.length < 3}
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Product...
              </div>
            ) : images.length < 3 ? (
              `Add Product (${images.length}/3 images uploaded)`
            ) : (
              "Add Product"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
