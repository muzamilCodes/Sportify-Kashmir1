"use client";

import { Minus, Plus, Upload, X, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const subcategoriesMap: { [key: string]: string[] } = {
  cricket: ["Bats", "Balls", "Pads", "Gloves", "Helmets", "Shoes", "Clothing"],
  football: ["Boots", "Balls", "Jerseys", "Shin Guards", "Goal Gloves", "Socks"],
  basketball: ["Shoes", "Balls", "Jerseys", "Hoops", "Accessories"],
  tennis: ["Rackets", "Balls", "Strings", "Grips", "Shoes", "Bags"],
  fitness: ["Dumbbells", "Yoga Mats", "Gym Wear", "Supplements", "Bench", "Accessories"],
  apparel: ["Jerseys", "Shorts", "Tracksuits", "Compression Wear", "Socks", "Caps"],
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/get/${productId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const product = result.data;
        
        // Get category ID correctly
        let categoryId = "";
        if (product.category && typeof product.category === 'object') {
          categoryId = product.category._id;
        } else if (typeof product.category === 'string') {
          categoryId = product.category;
        }
        
        // Get brand ID correctly
        let brandId = "";
        if (product.brand && typeof product.brand === 'object') {
          brandId = product.brand._id;
        } else if (typeof product.brand === 'string') {
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
          onSale: product.onSale || false,
        });

        setColors(product.colors || []);
        setSizes(product.sizes || []);
        setTags(product.tags || []);
        
        const imgUrl = product.productImgUrls?.[0] || product.images?.[0] || "";
        setExistingImage(imgUrl);
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
      const selectedCategory = categories.find(c => c._id === formData.category);
      const categoryName = selectedCategory?.name.toLowerCase() || "";
      const subs = subcategoriesMap[categoryName] || [];
      setAvailableSubcategories(subs);
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category, categories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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

    try {
      setSaving(true);
      
      // ✅ Find category NAME (backend accepts name)
      const selectedCategory = categories.find(c => c._id === formData.category);
      const categoryName = selectedCategory?.name || "";
      
      if (!categoryName) {
        toast.error("Invalid category selected");
        return;
      }
      
      // ✅ Find brand NAME if selected (backend accepts name)
      let brandName = "";
      if (formData.brand) {
        const selectedBrand = brands.find(b => b._id === formData.brand);
        brandName = selectedBrand?.name || "";
      }
      
      console.log("Sending category NAME:", categoryName);
      console.log("Sending brand NAME:", brandName);
      
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("discount", formData.discount || "0");
      data.append("category", categoryName); // ✅ Send category NAME
      if (brandName) {
        data.append("brand", brandName); // ✅ Send brand NAME
      }
      data.append("stock", formData.stock || "0");
      data.append("onSale", formData.onSale.toString());
      data.append("colors", colors.join(","));
      data.append("sizes", sizes.join(","));
      data.append("tags", tags.join(","));
      
      if (imageFile) {
        data.append("image", imageFile);
      }

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
        toast.success("Product updated successfully!");
        router.push("/admin/products");
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

  // Get selected names for display
  const selectedCategoryName = categories.find(c => c._id === formData.category)?.name || "";
  const selectedBrandName = brands.find(b => b._id === formData.brand)?.name || "";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product information</p>
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
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Selected: {selectedCategoryName}</p>
            </div>

            {availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Subcategory</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub.toLowerCase()}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>{brand.name}</option>
                ))}
              </select>
              {formData.brand && (
                <p className="text-xs text-gray-500 mt-1">Selected: {selectedBrandName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                min="0"
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
                className="w-full p-3 border rounded-lg"
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
                className="w-full p-3 border rounded-lg"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
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

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* Product Image */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Product Image</h2>

          {existingImage && !imagePreview && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Current Image</p>
              <img src={existingImage} alt="Current product" className="w-32 h-32 object-cover rounded-lg border" />
            </div>
          )}

          {imagePreview && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">New Image</p>
              <div className="relative inline-block">
                <img src={imagePreview} alt="New preview" className="w-32 h-32 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to change product image</p>
            <label className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-orange-600 text-sm">
              Choose New Image
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">Leave empty to keep current image</p>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Colors</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="flex-1 p-3 border rounded-lg"
              placeholder="Add a color"
            />
            <button type="button" onClick={addColor} className="bg-orange-500 text-white px-4 py-2 rounded-lg">
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span>{color}</span>
                <button type="button" onClick={() => removeColor(color)} className="text-red-500">×</button>
              </div>
            ))}
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
              className="flex-1 p-3 border rounded-lg"
              placeholder="Add a size"
            />
            <button type="button" onClick={addSize} className="bg-orange-500 text-white px-4 py-2 rounded-lg">
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                <span>{size}</span>
                <button type="button" onClick={() => removeSize(size)} className="text-red-500">×</button>
              </div>
            ))}
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
              className="flex-1 p-3 border rounded-lg"
              placeholder="Add a tag"
            />
            <button type="button" onClick={addTag} className="bg-orange-500 text-white px-4 py-2 rounded-lg">
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)} className="text-red-500">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Product"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}