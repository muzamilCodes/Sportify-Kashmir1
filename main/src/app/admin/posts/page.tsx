"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, Search, Loader2, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";

interface Post {
  _id: string;
  postTitle: string;
  shortDesc: string;
  postImgUrl?: string;
  postAuthorId: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      
      if (result.success && result.posts) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setDeletingId(postId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/delete/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success("Post deleted successfully");
        fetchPosts();
      } else {
        toast.error(result.message || "Failed to delete post");
      }
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  const filteredPosts = posts.filter(post =>
    post.postTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600 mt-1">Manage your blog content</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 flex items-center gap-2 transition"
        >
          <Plus size={20} />
          New Post
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search posts by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">Create your first blog post</p>
            <Link href="/admin/posts/new" className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
              Create New Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="p-4">Image</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post._id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4">
                      <img
                        src={getImageUrl(post.postImgUrl || "")}
                        alt={post.postTitle}
                        className="w-12 h-12 rounded object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.jpg";
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900 line-clamp-1">{post.postTitle}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{post.shortDesc?.substring(0, 60)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm">{post.postAuthorId?.username || "Admin"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/blog/${post._id}`}
                          target="_blank"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/posts/edit/${post._id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post._id)}
                          disabled={deletingId === post._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === post._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
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