"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, User, ArrowLeft, Loader2, Eye, Heart, Share2 } from "lucide-react";
import toast from "react-hot-toast";

interface Post {
  _id: string;
  postTitle: string;
  postDesc: string;
  shortDesc: string;
  postImgUrl?: string;
  postAuthorId: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  views?: number;
  likes?: number;
}

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setImageLoading(true);
      setImageError(false);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`);
      const result = await response.json();
      
      if (result.success && result.post) {
        setPost(result.post);
        console.log("Post image URL:", result.post.postImgUrl);
      } else {
        setError(result.message || "Post not found");
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url?: string): string | null => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads/")) return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? "Removed like" : "Thanks for liking!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.postTitle,
        text: post?.shortDesc,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The post you're looking for doesn't exist."}</p>
          <Link href="/blog" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(post.postImgUrl);
  console.log("Final image URL:", imageUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with FULL SIZE Image */}
      <div className="relative w-full bg-gray-900">
        {imageUrl && !imageError ? (
          // ✅ FULL SIZE IMAGE - Takes full width
          <div className="w-full relative overflow-hidden bg-gray-900">
            {/* Loading Spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={post.postTitle}
              className="w-full h-auto max-h-[70vh] object-cover bg-gray-900"
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                console.error("Image failed to load:", imageUrl);
                setImageError(true);
                setImageLoading(false);
              }}
              loading="lazy"
            />
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400">Image not available</p>
            </div>
          </div>
        )}
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
              {post.postTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(post.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={16} />
                <span>{post.postAuthorId?.username || "Admin"}</span>
              </div>
              {post.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye size={16} />
                  <span>{post.views} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
          Back to Blog
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Content Body */}
          <div className="p-6 md:p-10">
            {/* Short Description */}
            {post.shortDesc && (
              <div className="mb-6 pb-6 border-b">
                <p className="text-lg text-gray-700 italic leading-relaxed">
                  {post.shortDesc}
                </p>
              </div>
            )}

            {/* Full Description */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-a:text-orange-500 prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ 
                __html: post.postDesc
                  .replace(/\n/g, '<br/>')
                  .replace(/<p>/g, '<p class="mb-4">')
              }}
            />
          </div>

          {/* Engagement Section */}
          <div className="border-t p-6 md:p-10 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    liked 
                      ? "bg-red-500 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Heart size={18} className={liked ? "fill-white" : ""} />
                  <span>{(post.likes ?? 0) + (liked ? 1 : 0)} Likes</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
              
              {/* Author Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  {post.postAuthorId?.username?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{post.postAuthorId?.username || "Admin"}</p>
                  <p className="text-xs text-gray-500">Author</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .prose {
          font-size: 1.125rem;
          line-height: 1.75;
        }
        .prose p {
          margin-bottom: 1.25rem;
        }
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose img {
          width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}