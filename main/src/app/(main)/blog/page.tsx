"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, User, Eye, Loader2 } from "lucide-react";

interface Post {
  _id: string;
  postTitle: string;
  postDesc: string;
  shortDesc: string;
  postImgUrl?: string;
  postAuthorId: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log("Fetching posts from API...");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/getAll`);
      const result = await response.json();
      
      console.log("API Response:", result);
      
      if (result.success && result.posts) {
        setPosts(result.posts);
      } else {
        setError(result.message || "No posts found");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="ml-3 text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Posts</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchPosts}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto">
            Latest sports news, tips, and stories from Sportify Kashmir
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Check back later for new articles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Image */}
               {/* Image - Fixed size for grid */}
<Link href={`/blog/${post._id}`}>
  <div className="relative h-56 overflow-hidden bg-gray-100">
    {post.postImgUrl ? (
      <img
        src={getImageUrl(post.postImgUrl)}
        alt={post.postTitle}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder.jpg";
        }}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )}
  </div>
</Link>
                <div className="p-5">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{post.postAuthorId?.username || "Admin"}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${post._id}`}>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-600 transition line-clamp-2">
                      {post.postTitle}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.shortDesc || post.postDesc?.substring(0, 120)}...
                  </p>

                  {/* Read More */}
                  <Link
                    href={`/blog/${post._id}`}
                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}