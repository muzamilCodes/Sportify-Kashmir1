"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, X, Check, Save, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    postTitle: "",
    shortDesc: "",
    postDesc: "",
  });
  const [existingImgUrl, setExistingImgUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success && result.post) {
        setFormData({
          postTitle: result.post.postTitle || "",
          shortDesc: result.post.shortDesc || "",
          postDesc: result.post.postDesc || "",
        });
        setExistingImgUrl(result.post.postImgUrl || null);
      } else {
        toast.error(result.message || "Post not found");
        router.push("/admin/posts");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to load post data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setNewImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.postTitle.trim() || !formData.postDesc.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const dataToSend = new FormData();
      dataToSend.append("postTitle", formData.postTitle.trim());
      dataToSend.append("shortDesc", formData.shortDesc.trim());
      dataToSend.append("postDesc", formData.postDesc.trim());
      if (newImage) {
        dataToSend.append("image", newImage);
      }

      const response = await fetch(`${API_URL}/posts/update/${postId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Post updated successfully!");
        router.push("/admin/posts");
      } else {
        toast.error(result.message || "Failed to update post");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while updating post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
          <p className="text-xs text-gray-500">Loading post data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <Link
          href="/admin/posts"
          className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Edit Blog Post</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Update article content, summary, and cover imagery
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        {/* Title */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-2">
          <label className="block font-bold text-gray-800 dark:text-gray-200">
            Post Title *
          </label>
          <input
            type="text"
            name="postTitle"
            value={formData.postTitle}
            onChange={handleChange}
            className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white font-medium"
            placeholder="e.g. Master Guide to Kashmir Willow Bat Knocking"
            required
          />
        </div>

        {/* Short Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-2">
          <label className="block font-bold text-gray-800 dark:text-gray-200">
            Short Summary / Excerpt
          </label>
          <textarea
            name="shortDesc"
            value={formData.shortDesc}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
            placeholder="Brief summary of your article for social preview and search cards..."
          />
        </div>

        {/* Full Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-2">
          <label className="block font-bold text-gray-800 dark:text-gray-200">
            Full Article Body (Markdown &amp; Paragraphs Supported) *
          </label>
          <textarea
            name="postDesc"
            value={formData.postDesc}
            onChange={handleChange}
            rows={12}
            className="w-full p-3.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white font-mono text-xs leading-relaxed"
            placeholder="Write your article content here..."
            required
          />
        </div>

        {/* Cover Image */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-3">
          <label className="block font-bold text-gray-800 dark:text-gray-200">
            Featured Cover Image
          </label>

          <div className="flex flex-wrap items-center gap-4">
            {previewUrl ? (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="New preview"
                  className="w-44 h-28 object-cover rounded-xl border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ) : existingImgUrl ? (
              <div className="relative inline-block">
                <img
                  src={existingImgUrl.startsWith("http") ? existingImgUrl : `${API_URL}${existingImgUrl}`}
                  alt="Current cover"
                  className="w-44 h-28 object-cover rounded-xl border border-gray-300 dark:border-gray-600"
                />
                <span className="text-[10px] text-gray-400 block mt-1">Current Image</span>
              </div>
            ) : null}

            <label className="flex-1 min-w-[200px] flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Click to upload {existingImgUrl ? "replacement" : "new"} image
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG or WEBP up to 5MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Updating Article..." : "Save Post Changes"}</span>
          </button>
          <Link
            href="/admin/posts"
            className="px-6 py-3.5 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
