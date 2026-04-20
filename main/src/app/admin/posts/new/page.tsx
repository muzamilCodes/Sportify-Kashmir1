"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    postTitle: "",
    shortDesc: "",
    postDesc: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.postTitle || !formData.postDesc) {
      toast.error("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("postTitle", formData.postTitle);
      formDataToSend.append("shortDesc", formData.shortDesc || formData.postDesc.substring(0, 150));
      formDataToSend.append("postDesc", formData.postDesc);
      if (image) {
        formDataToSend.append("image", image);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Post created successfully!");
        router.push("/admin/posts");
      } else {
        toast.error(result.message || "Failed to create post");
      }
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/posts" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600 mt-1">Write and publish blog content</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Post Title *</label>
          <input
            type="text"
            name="postTitle"
            value={formData.postTitle}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Enter post title"
            required
          />
        </div>

        {/* Short Description */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
          <textarea
            name="shortDesc"
            value={formData.shortDesc}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Brief summary of your post..."
          />
        </div>

        {/* Full Description */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Description *</label>
          <textarea
            name="postDesc"
            value={formData.postDesc}
            onChange={handleChange}
            rows={12}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="Write your post content here..."
            required
          />
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
          {previewUrl ? (
            <div className="relative inline-block">
              <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload featured image</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Post"}
          </button>
          <Link href="/admin/posts" className="px-6 py-3 border rounded-lg hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}