"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Loader2,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { getBlogImageUrl } from "@/lib/blogData";

interface Post {
  _id: string;
  postTitle: string;
  shortDesc: string;
  postDesc?: string;
  postImgUrl?: string;
  postAuthorId?: {
    _id: string;
    username: string;
    email?: string;
  };
  createdAt: string;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/posts/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success) {
        const raw = Array.isArray(result.posts)
          ? result.posts
          : Array.isArray(result.data)
          ? result.data
          : [];
        setPosts(raw);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    setDeletingId(postId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/posts/delete/${postId}`, {
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

  const filteredPosts = posts.filter(
    (post) =>
      post.postTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.shortDesc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            Loading blog posts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Blog Posts &amp; Guides
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Publish sports guides, equipment reviews, and tournament articles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <span>Live Blog</span>
            <ExternalLink size={13} />
          </Link>
          <Link
            href="/admin/posts/new"
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition flex items-center gap-1.5 active:scale-95"
          >
            <Plus size={16} />
            <span>Create New Post</span>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 p-3.5 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search blog posts by title or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-14 p-6 space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <BookOpen size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No blog posts found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchTerm ? `No posts matched "${searchTerm}"` : "Create your first Kashmir sports guide or article"}
              </p>
            </div>
            <Link
              href="/admin/posts/new"
              className="inline-block px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              Create New Post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-750 text-gray-600 dark:text-gray-300 font-bold uppercase text-[11px] border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4">Cover</th>
                  <th className="p-4">Article Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Published Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredPosts.map((post) => (
                  <tr
                    key={post._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition"
                  >
                    <td className="p-4">
                      {(() => {
                        const postImg = getBlogImageUrl(post.postImgUrl);
                        return postImg ? (
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-600">
                            <img
                              src={postImg}
                              alt={post.postTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-500 border border-orange-200 dark:border-orange-800/40">
                            <BookOpen size={16} />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 max-w-sm">
                      <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-1">
                        {post.postTitle}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {post.shortDesc || post.postDesc?.substring(0, 70)}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <User size={13} className="text-orange-500" />
                        <span className="font-medium">
                          {post.postAuthorId?.username || "Admin"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-[11px]">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/blog/${post._id}`}
                          target="_blank"
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                          title="View live article"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/admin/posts/edit/${post._id}`}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                          title="Edit article"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post._id)}
                          disabled={deletingId === post._id}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition disabled:opacity-50 cursor-pointer"
                          title="Delete article"
                        >
                          {deletingId === post._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
