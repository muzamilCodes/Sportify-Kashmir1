"use client";

import { Minus, Plus, Upload, X, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getImageUrl } from "@/lib/utils";
import { clearCachedJson } from "@/lib/clientCache";

interface GalleryItem {
  id: string;
  type: "existing" | "new";
  url: string;
  file?: File;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
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

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchCategories();
      fetchBrands();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/get/${productId}?_t=${Date.now()}`, {
        cache: "no-store",
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const product = result.data;
        
        let categoryId = "";
        if (product.category && typeof product.category === "object") {
          categoryId = product.category._id;
        } else if (typeof product.category === "string") {
          categoryId = product.category;
        }
        
        let brandId = "";
        if (product.brand && typeof product.brand === "object") {
          brandId = product.brand._id;
        } else if (typeof product.brand === "string") {
          brandId = product.brand;
        }
        
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          discount: product.discount?.toString() || "",
          category: categoryId,
          subcategory: product.subcategory || "",
          brand: brandId,
          stock: product.stock?.toString() || "0",
          isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
          isArchived: product.isArchived || false,
          onSale: product.onSale || false,
        });

        setColors(product.colors || []);
        setSizes(product.sizes || []);
        setTags(product.tags || []);
        
        const rawImages: string[] = product.productImgUrls || product.images || [];
        const items: GalleryItem[] = rawImages.map((url, idx) => ({
          id: `existing-${idx}-${Date.now()}`,
          type: "existing",
          url,
        }));
        setGalleryItems(items);
      } else {
        toast.error("Product not found");
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/all`);
      const result = await response.json();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand/all`);
      const result = await response.json();
      if (result.success && result.data) {
        setBrands(result.data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find((c) => c._id === formData.category);
      const subs = selectedCategory?.subcategories || [];
      setAvailableSubcategories(subs);
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

    const newItems: GalleryItem[] = newImages.map((file, idx) => ({
      id: `new-${idx}-${Date.now()}-${Math.random()}`,
      type: "new",
      url: URL.createObjectURL(file),
      file,
    }));

    setGalleryItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const replaceImage = (index: number, file?: File) => {
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Please select a valid image smaller than 5MB");
      return;
    }
    const item: GalleryItem = {
      id: `new-replaced-${Date.now()}-${Math.random()}`,
      type: "new",
      url: URL.createObjectURL(file),
      file,
    };
    setGalleryItems((prev) => prev.map((curr, i) => (i === index ? item : curr)));
  };

  const removeImage = (index: number) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const setAsMainCover = (index: number) => {
    if (index === 0) return;
    setGalleryItems((prev) => {
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

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (galleryItems.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    try {
      setSaving(true);
      
      const newFiles: File[] = [];
      const manifest: Array<{ type: "existing"; url: string } | { type: "new" }> = [];

      galleryItems.forEach((item) => {
        if (item.type === "existing") {
          manifest.push({ type: "existing", url: item.url });
        } else if (item.file) {
          manifest.push({ type: "new" });
          newFiles.push(item.file);
        }
      });

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("description", formData.description || "");
      data.append("price", formData.price);
      data.append("discount", formData.discount || "0");
      data.append("category", formData.category);
      data.append("subcategory", formData.subcategory || "");
      data.append("brand", formData.brand || "");
      data.append("stock", formData.stock || "0");
      data.append("isAvailable", formData.isAvailable.toString());
      data.append("isArchived", formData.isArchived.toString());
      data.append("onSale", formData.onSale.toString());
      data.append("colors", colors.join(","));
      data.append("sizes", sizes.join(","));
      data.append("tags", tags.join(","));
      
      // Gallery Manifest with exact slot ordering
      data.append("galleryManifest", JSON.stringify(manifest));

      // Retained existing images (fallback)
      galleryItems
        .filter((item) => item.type === "existing")
        .forEach((item) => data.append("existingImages", item.url));

      // Newly uploaded image files
      newFiles.forEach((file) => data.append("images", file));

      const token = localStorage.getItem("token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/edit/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();
      
      if (result.success) {
        clearCachedJson();
        toast.success("Product updated successfully!");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update product");
        console.error("Server error:", result);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product information and image gallery</p>
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
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
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
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Available for sale</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isArchived"
                    checked={formData.isArchived}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Archive product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="onSale"
                    checked={formData.onSale}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
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

        {/* Product Images Section (Multi-Image 3+ Support) */}
        <div id="image-upload-section" className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Product Images <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">Min 3 Recommended</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage product images. Slot 1 is displayed as the primary Cover Image across the store.
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                galleryItems.length < 3
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {galleryItems.length < 3 ? `⚠️ ${galleryItems.length} Images (Min 3 Recommended)` : `✓ ${galleryItems.length} Images`}
            </span>
          </div>

          {/* Drag and Drop / Browse Zone */}
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
            <p className="text-sm font-bold text-gray-800">
              Add more images by dropping files here, or <span className="text-orange-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, WEBP. Maximum 5MB per file.</p>
          </div>

          {/* Gallery Slot Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Gallery Slots ({galleryItems.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems.map((item, index) => {
                const displaySrc = item.type === "existing" ? getImageUrl(item.url) : item.url;

                return (
                  <div
                    key={item.id}
                    className={`relative group rounded-xl border-2 overflow-hidden bg-gray-900 shadow-sm transition-all ${
                      index === 0 ? "border-orange-500 ring-2 ring-orange-500/20" : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <img
                      src={displaySrc}
                      alt={`Product Slot ${index + 1}`}
                      className="w-full h-44 object-cover group-hover:opacity-90 transition-opacity"
                    />

                    {/* Slot badge */}
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
                );
              })}

              {/* Extra Slot Placeholder button */}
              <label className="border-2 border-dashed border-orange-300 bg-orange-50/30 rounded-xl h-44 flex flex-col items-center justify-center text-center p-4 hover:border-orange-500 hover:bg-orange-50/60 transition-colors cursor-pointer group">
                <Upload className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-700">Add Another Image</span>
                <span className="text-[11px] text-gray-400 mt-0.5">Slot {galleryItems.length + 1}</span>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
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
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
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
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm">{color}</span>
                <button type="button" onClick={() => removeColor(color)} className="text-red-500 hover:text-red-700">
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
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
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
            {sizes.map((size, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-sm">{size}</span>
                <button type="button" onClick={() => removeSize(size)} className="text-red-500 hover:text-red-700">
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
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
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
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
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
        <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border z-20">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating Product...
              </div>
            ) : (
              "Update Product"
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