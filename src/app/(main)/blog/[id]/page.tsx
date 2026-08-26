"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  Eye,
  Heart,
  Share2,
  Clock,
  ChevronRight,
  BookOpen,
  Check,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  BlogPost,
  getBlogImageUrl,
  formatBlogDate,
  calculateReadTime,
} from "@/lib/blogData";

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchAllPosts();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts/${postId}`);
      const result = await response.json();

      if (result.success && result.post) {
        setPost(result.post);
      } else {
        setPost(null);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts/getAll`);
      const result = await response.json();
      if (result.success) {
        const raw = Array.isArray(result.posts)
          ? result.posts
          : Array.isArray(result.data)
          ? result.data
          : [];
        setAllPosts(raw);
      }
    } catch {}
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? "Removed like" : "Thank you for liking this story!");
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: post?.postTitle,
          text: post?.shortDesc,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Read this sports guide on Sportify Kashmir: ${post?.postTitle}\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Related posts from real DB (excluding current post)
  const relatedPosts = useMemo(() => {
    return allPosts.filter((p) => p._id !== postId).slice(0, 3);
  }, [allPosts, postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
            Loading sports guide...
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 rounded-full flex items-center justify-center mx-auto text-red-500">
            <BookOpen size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Article Not Found</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            The article you requested could not be found or has been removed.
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getBlogImageUrl(post.postImgUrl);
  const authorName = post.postAuthorId?.username || "Sportify Specialist";
  const readTime = calculateReadTime(post.postDesc);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-gray-900 dark:text-white pb-24 md:pb-16 transition-colors duration-200">
      {/* ─── Breadcrumb Navigation Bar ─── */}
      <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-orange-500 transition">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-orange-500 transition">
            Journal &amp; Guides
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 dark:text-white font-bold truncate max-w-[280px]">
            {post.postTitle}
          </span>
        </div>
      </div>

      {/* ─── Article Container ─── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Articles</span>
        </Link>

        {/* ─── Article Header ─── */}
        <header className="space-y-4">
          {/* Category & Read Time Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 text-xs font-black uppercase rounded-full tracking-wider border border-orange-200 dark:border-orange-800/80">
              {Array.isArray(post.category) && post.category.length > 0
                ? post.category.join(" • ")
                : typeof post.category === "string"
                ? post.category
                : "Sports Craftsmanship"}
            </span>
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full flex items-center gap-1.5">
              <Clock size={12} className="text-orange-500" />
              <span>{readTime}</span>
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            {post.postTitle}
          </h1>

          {/* Short Sub-Heading / Summary */}
          {post.shortDesc && (
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
              {post.shortDesc}
            </p>
          )}

          {/* Author & Publish Info Bar */}
          <div className="pt-2 pb-4 border-y border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{authorName}</p>
                <p className="text-[11px] text-gray-500">Equipment &amp; Sports Specialist</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-orange-500" />
                <span>{formatBlogDate(post.createdAt)}</span>
              </span>
              {post.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye size={14} className="text-orange-500" />
                  <span>{post.views} views</span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* ─── Hero Cover Photo (ONLY if real uploaded image exists) ─── */}
        {imageUrl ? (
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl border border-gray-200/80 dark:border-gray-800 bg-gray-100 dark:bg-gray-850">
            <img
              src={imageUrl}
              alt={post.postTitle}
              className="w-full h-full object-cover"
            />
          </div>
        ) : null}

        {/* ─── Main Article Content Body ─── */}
        <div className="bg-white dark:bg-gray-850 rounded-3xl p-6 sm:p-10 border border-gray-200/90 dark:border-gray-700/80 shadow-xs space-y-6">
          {/* Formatted Content */}
          <div
            className="prose prose-base sm:prose-lg max-w-none text-gray-800 dark:text-gray-200 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{
              __html: (post.postDesc || "")
                .replace(/^### (.*$)/gim, '<h3 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-6 mb-2 border-b border-gray-100 dark:border-gray-750 pb-1">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-8 mb-3 text-orange-600 dark:text-orange-400">$1</h2>')
                .replace(/^\* \*\*(.*?)\*\*: (.*$)/gim, '<li class="my-1 text-xs sm:text-sm"><strong class="text-gray-900 dark:text-white font-bold">$1:</strong> $2</li>')
                .replace(/^- (.*$)/gim, '<li class="my-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300 list-disc ml-5">$1</li>')
                .replace(/\n\n/g, '<p class="my-3 text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300"></p>')
                .replace(/\n/g, "<br/>"),
            }}
          />

          {/* Hashtags / Tags chip row */}
          {post.hashTags && (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-750 flex flex-wrap gap-2">
              {(Array.isArray(post.hashTags) ? post.hashTags : post.hashTags.split(" ")).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg"
                >
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}

          {/* ─── Social Engagement & Sharing Actions Bar ─── */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-750 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <button
                type="button"
                onClick={handleLike}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs border ${
                  liked
                    ? "bg-rose-500 text-white border-rose-500 shadow-rose-500/20"
                    : "bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                }`}
              >
                <Heart size={16} className={liked ? "fill-white" : ""} />
                <span>{(post.likes ?? 24) + (liked ? 1 : 0)} Likes</span>
              </button>

              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              >
                <MessageCircle size={16} />
                <span>Share on WhatsApp</span>
              </button>
            </div>

            {/* Native Share / Copy Link Button */}
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-750 hover:bg-gray-200 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 border border-gray-200 dark:border-gray-600"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* ─── Author Bio Box ─── */}
        <div className="bg-white dark:bg-gray-850 rounded-3xl p-6 sm:p-8 border border-gray-200/90 dark:border-gray-750/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                Written by {authorName}
              </h4>
              <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Staff Specialist
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Contributing equipment reviewer and sports consultant at Sportify Kashmir. Passionate about elevating grassroots athletics, cricket bat longevity, and local Kashmir tournament coverage.
            </p>
          </div>
        </div>

        {/* ─── RELATED STORIES SECTION ─── */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">
                Recommended Kashmir Sports Guides
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((rel) => {
                const relImg = getBlogImageUrl(rel.postImgUrl);
                return (
                  <Link
                    key={rel._id}
                    href={`/blog/${rel._id}`}
                    className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/90 dark:border-gray-750/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-500/50 transition group flex flex-col justify-between"
                  >
                    <div>
                      {relImg && (
                        <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={relImg}
                            alt={rel.postTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-4 space-y-1.5">
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-extrabold uppercase">
                          {Array.isArray(rel.category) && rel.category.length > 0 ? rel.category[0] : "Sports Guide"}
                        </p>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                          {rel.postTitle}
                        </h4>
                      </div>
                    </div>
                    <div className="p-4 pt-0 text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-100 dark:border-gray-750">
                      <span>{formatBlogDate(rel.createdAt)}</span>
                      <span className="text-orange-600 font-bold group-hover:underline">Read ›</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}