"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Sparkles,
  ShoppingBag,
  Flame,
  Bookmark,
  Award,
  Hash,
  Maximize2,
  X,
  ShieldCheck,
  Tag,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  BlogPost,
  getBlogImageUrl,
  formatBlogDate,
  calculateReadTime,
} from "@/lib/blogData";
import { cachedJson, setCachedJson } from "@/lib/clientCache";

interface PageProps {
  params?: Promise<{ id: string }> | { id: string };
}

export default function SinglePostPage({ params }: PageProps) {
  const routerParams = useParams();
  const router = useRouter();

  // Extract ID robustly across Next.js 15+ Promises, useParams(), or window.location
  const [postId, setPostId] = useState<string>(() => {
    if (routerParams?.id) {
      return Array.isArray(routerParams.id) ? routerParams.id[0] : routerParams.id;
    }
    if (typeof window !== "undefined") {
      const segments = window.location.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && last !== "blog") return last;
    }
    return "";
  });

  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // High Performance: Direct DOM requestAnimationFrame Scroll Progress without triggering React Re-renders
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (progressBarRef.current) {
            const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            if (windowHeight > 0) {
              const scrollPct = (totalScroll / windowHeight) * 100;
              progressBarRef.current.style.width = `${Math.min(100, Math.max(0, scrollPct))}%`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Resolve ID if passed as async params Promise
  useEffect(() => {
    if (params) {
      if (typeof (params as any).then === "function") {
        (params as Promise<{ id: string }>).then((resolved) => {
          if (resolved?.id) setPostId(resolved.id);
        });
      } else if ((params as any).id) {
        setPostId((params as any).id);
      }
    } else if (routerParams?.id) {
      const id = Array.isArray(routerParams.id) ? routerParams.id[0] : routerParams.id;
      setPostId(id);
    } else if (typeof window !== "undefined") {
      const segments = window.location.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && last !== "blog") setPostId(last);
    }
  }, [params, routerParams]);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
      fetchAllPosts();
    }
  }, [postId]);

  const fetchPost = async (id: string) => {
    try {
      setLoading(true);
      // 1. Direct cached fetch
      const result = await cachedJson<any>(`${API_URL}/posts/${id}`);
      if (result) {
        const found = result.post || result.data;
        if (found) {
          setPost(found);
          setLikeCount(found.likes || 42);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback: Search in getAllPosts
      const allResult = await cachedJson<any>(`${API_URL}/posts/getAll`);
      if (allResult) {
        const list: BlogPost[] = Array.isArray(allResult.posts)
          ? allResult.posts
          : Array.isArray(allResult.data)
          ? allResult.data
          : [];
        const match = list.find(
          (p) =>
            p._id === id ||
            (p as any).id === id ||
            (p as any).slug === id ||
            p.postTitle?.toLowerCase().replace(/\s+/g, "-") === id
        );
        if (match) {
          setPost(match);
          setLikeCount(match.likes || 42);
          setLoading(false);
          return;
        }
      }

      setPost(null);
    } catch (error) {
      console.error("Error fetching post:", error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPosts = async () => {
    try {
      const result = await cachedJson<any>(`${API_URL}/posts/getAll`);
      if (result?.success) {
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
    if (!liked) {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      toast.success("Thank you for liking this guide! ❤️");
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#f97316", "#ef4444", "#fbbf24"],
        });
      } catch {}
    } else {
      setLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
      toast("Removed like");
    }
  };

  const handleBookmark = () => {
    setSaved(!saved);
    toast.success(saved ? "Article removed from saved" : "Article saved for offline reading! 📑");
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
    const title = post?.postTitle || "Sports Guide";
    const text = `Read this Kashmir Sports Guide on Sportify Kashmir:\n*${title}*\n\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Categories formatted with rich fallback
  const displayCategories = useMemo(() => {
    if (Array.isArray(post?.category) && post.category.length > 0) {
      return post.category.map(String).filter((c) => c.trim().length > 0);
    }
    if (typeof post?.category === "string" && post.category.trim().length > 0) {
      return post.category.split(/[,•]+/).map((c) => c.trim()).filter(Boolean);
    }
    return ["Kashmir Sports Journal", "Artisan Bat Craft"];
  }, [post?.category]);

  // Hashtags formatted with rich fallback
  const displayHashTags = useMemo(() => {
    if (Array.isArray(post?.hashTags) && post.hashTags.length > 0) {
      return post.hashTags.map(String).filter((t) => t.trim().length > 0);
    }
    if (typeof post?.hashTags === "string" && post.hashTags.trim().length > 0) {
      return post.hashTags.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean);
    }
    return ["#KashmirWillow", "#SportifyKashmir", "#CricketGear", "#ValleyAthletes", "#MadeInKashmir"];
  }, [post?.hashTags]);

  // Related posts excluding current
  const relatedPosts = useMemo(() => {
    return allPosts.filter((p) => p._id !== postId).slice(0, 3);
  }, [allPosts, postId]);

  // Memoize formatted content HTML so regex isn't re-evaluated on every minor render
  const formattedContentHtml = useMemo(() => {
    if (!post?.postDesc) return "";
    return post.postDesc
      .replace(/^### (.*$)/gim, '<h3 class="text-lg sm:text-xl font-black text-zinc-900 dark:text-white mt-6 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-1.5 flex items-center gap-2"><span>🏏</span> $1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-8 mb-3 text-orange-600 dark:text-orange-400 border-l-4 border-orange-500 pl-3">$1</h2>')
      .replace(/^\* \*\*(.*?)\*\*: (.*$)/gim, '<li class="my-1.5 text-xs sm:text-sm"><strong class="text-zinc-900 dark:text-white font-black">$1:</strong> $2</li>')
      .replace(/^- (.*$)/gim, '<li class="my-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 list-disc ml-5">$1</li>')
      .replace(/\n\n/g, '<p class="my-4 text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"></p>')
      .replace(/\n/g, "<br/>");
  }, [post?.postDesc]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-ping" />
            <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin flex items-center justify-center">
              <Sparkles size={16} className="text-orange-500" />
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-extrabold text-base">
            Loading Kashmir Sports Guide...
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fetching verified equipment craft notes and athlete coverage
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white dark:bg-zinc-900 p-8 sm:p-10 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 rounded-2xl flex items-center justify-center mx-auto text-orange-600 border border-orange-200 dark:border-orange-800">
            <BookOpen size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Article Not Found
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
              The article you requested could not be found or has been updated. Explore all our published equipment guides below.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95"
          >
            <span>Explore All Kashmir Articles</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = getBlogImageUrl(post.postImgUrl);
  const authorName =
    typeof post.postAuthorId === "object" && post.postAuthorId?.username
      ? post.postAuthorId.username
      : typeof post.postAuthorId === "string"
      ? post.postAuthorId
      : "Sportify Specialist";

  const readTime = calculateReadTime(post.postDesc);

  // Clean title display if a URL was entered as title
  let cleanTitle = post.postTitle;
  if (cleanTitle.startsWith("http://") || cleanTitle.startsWith("https://")) {
    cleanTitle = "Kashmir Sports Journal: Premium Equipment Craft & Athlete Guide";
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-gray-900 dark:text-white pb-24 md:pb-20 transition-colors duration-200">
      {/* ─── Reading Progress Bar Fixed at Top (Hardware accelerated) ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-xs">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-75 ease-out shadow-xs"
          style={{ width: "0%" }}
        />
      </div>

      {/* ─── Breadcrumb Navigation Bar ─── */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 py-3.5 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-orange-500 transition font-medium">
              Home
            </Link>
            <ChevronRight size={12} className="shrink-0" />
            <Link href="/blog" className="hover:text-orange-500 transition font-medium">
              Journal &amp; Guides
            </Link>
            <ChevronRight size={12} className="shrink-0" />
            <span className="text-zinc-900 dark:text-white font-bold truncate max-w-[220px] sm:max-w-xs">
              {cleanTitle}
            </span>
          </div>

          {/* Quick Header Share Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition cursor-pointer"
              title="Share guide"
            >
              <Share2 size={15} />
            </button>
            <button
              type="button"
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                saved
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-300 hover:text-orange-500"
              }`}
              title={saved ? "Saved" : "Save article"}
            >
              <Bookmark size={15} className={saved ? "fill-white" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Article Container ─── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-8">
        {/* Back to Guides Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400 hover:underline group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Guides</span>
          </Link>

          {/* Font Size Adjuster Tool */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs text-zinc-600 dark:text-zinc-300">
            <span className="px-2 text-[10px] font-bold uppercase text-zinc-400">Text Size:</span>
            <button
              onClick={() => setFontSizeOffset((p) => Math.max(-2, p - 1))}
              className="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700 font-bold cursor-pointer"
            >
              A-
            </button>
            <button
              onClick={() => setFontSizeOffset(0)}
              className="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700 font-bold cursor-pointer"
            >
              Default
            </button>
            <button
              onClick={() => setFontSizeOffset((p) => Math.min(4, p + 1))}
              className="px-2 py-0.5 rounded hover:bg-white dark:hover:bg-zinc-700 font-bold cursor-pointer"
            >
              A+
            </button>
          </div>
        </div>

        {/* ─── Article Header ─── */}
        <header className="space-y-4">
          {/* Category & Read Time Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {displayCategories.map((cat, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-red-500/15 text-orange-600 dark:text-orange-400 text-xs font-black uppercase rounded-full tracking-wider border border-orange-500/30 flex items-center gap-1.5 shadow-xs"
              >
                <Flame size={13} className="text-orange-500 fill-orange-500" />
                <span>{cat}</span>
              </span>
            ))}

            <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-full flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700">
              <Clock size={13} className="text-orange-500" />
              <span>{readTime}</span>
            </span>

            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck size={13} />
              <span>Verified Sports Guide</span>
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.18] break-words">
            {cleanTitle}
          </h1>

          {/* Short Sub-Heading / Summary */}
          {post.shortDesc && (
            <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium break-words">
              {post.shortDesc}
            </p>
          )}

          {/* Author & Publish Info Bar */}
          <div className="pt-4 pb-4 border-y border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center font-black text-base shadow-md ring-2 ring-orange-500/20">
                {(authorName || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-extrabold text-zinc-900 dark:text-white text-sm flex items-center gap-1.5">
                  <span>{authorName}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold uppercase">
                    Staff Specialist
                  </span>
                </p>
                <p className="text-[11px] text-zinc-500">Equipment Reviewer &amp; Valley Sports Consultant</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-orange-500" />
                <span>{formatBlogDate(post.createdAt)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-orange-500" />
                <span>{post.views ?? 184} Views</span>
              </span>
            </div>
          </div>
        </header>

        {/* ─── FULL SIZE ORIGINAL IMAGE FRAME (POORI IMAGE BINA CROP KE) ─── */}
        {imageUrl ? (
          <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 shadow-xl group">
            {/* Full uncropped image with natural dimensions */}
            <div className="w-full flex items-center justify-center p-2 sm:p-4 bg-zinc-950">
              <img
                src={imageUrl}
                alt={cleanTitle}
                className="w-full h-auto max-h-[750px] object-contain rounded-xl sm:rounded-2xl transition-transform duration-500 group-hover:scale-[1.01] cursor-pointer"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onClick={() => setIsLightboxOpen(true)}
              />
            </div>

            {/* Click to expand Full-Resolution Lightbox Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-orange-600 backdrop-blur-md text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg border border-white/20 active:scale-95"
            >
              <Maximize2 size={14} />
              <span>View Full HD Image</span>
            </button>
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-900 via-orange-950/40 to-zinc-900 border border-orange-500/30 text-white flex flex-col items-center justify-center text-center space-y-3 shadow-xl">
            <BookOpen size={48} className="text-orange-500" />
            <h3 className="text-xl sm:text-2xl font-black">{cleanTitle}</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
              Authentic Kashmiri athlete coverage, artisan bat knocking tutorials, and sports equipment longevity tips.
            </p>
          </div>
        )}

        {/* ─── Main Article Content Body ─── */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-10 border border-zinc-200/90 dark:border-zinc-800 shadow-sm space-y-6 overflow-hidden">
          {/* Formatted Content */}
          <div
            className="prose prose-base sm:prose-lg max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-4 break-words"
            style={{ fontSize: `${16 + fontSizeOffset}px`, overflowWrap: "anywhere" }}
            dangerouslySetInnerHTML={{
              __html: formattedContentHtml,
            }}
          />

          {/* Kashmir Artisan Callout Box */}
          <div className="my-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10 border border-orange-500/30 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              🏏
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                Authentic Kashmir Artisan Craftsmanship
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                All bats and sports gear featured in our guides are hand-crafted by certified Kashmiri artisans in Sangam, Bijbehara, and Srinagar. Every blade is tested for grain alignment and sweet-spot rebound before shipping.
              </p>
            </div>
          </div>

          {/* ─── Tags & Topics Chip Row ─── */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              <Tag size={15} className="text-orange-500" />
              <span>Article Tags &amp; Topics</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {displayHashTags.map((tag, idx) => {
                const cleanTag = tag.startsWith("#") ? tag : `#${tag}`;
                return (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-850 text-zinc-800 dark:text-zinc-200 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <span className="text-orange-500 font-extrabold text-sm">#</span>
                    <span>{cleanTag.replace(/^#/, "")}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* ─── Social Engagement & Sharing Actions Bar ─── */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/60 dark:bg-zinc-850/60 p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <button
                type="button"
                onClick={handleLike}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm border ${
                  liked
                    ? "bg-rose-500 text-white border-rose-500 shadow-rose-500/20"
                    : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <Heart size={16} className={liked ? "fill-white" : ""} />
                <span>{likeCount} Likes</span>
              </button>

              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs"
              >
                <MessageCircle size={16} />
                <span>Share on WhatsApp</span>
              </button>
            </div>

            {/* Native Share / Copy Link Button */}
            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer active:scale-95 border border-zinc-200 dark:border-zinc-700 shadow-xs"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* ─── Shop Relevant Kashmir Gear Callout Banner ─── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[11px] font-black uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full inline-block">
              Sportify Kashmir Store
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Ready to Upgrade Your Sports Equipment?
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-md">
              Browse authentic Kashmir willow cricket bats, genuine leather balls, and tournament jerseys with fast delivery across Jammu &amp; Kashmir.
            </p>
          </div>
          <Link
            href="/products"
            className="px-6 py-3 bg-white text-orange-600 hover:bg-orange-50 rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95 shrink-0 flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            <span>Shop Sports Gear</span>
          </Link>
        </div>

        {/* ─── Author Bio Box ─── */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
            {(authorName || "S").charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-black text-base text-zinc-900 dark:text-white">
                Written by {authorName}
              </h4>
              <span className="text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                Artisan Specialist
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Contributing equipment reviewer and sports consultant at Sportify Kashmir. Passionate about elevating grassroots athletics, cricket bat longevity, and local Kashmir tournament coverage.
            </p>
          </div>
        </div>

        {/* ─── RELATED STORIES SECTION ─── */}
        {relatedPosts.length > 0 && (
          <div className="pt-8 space-y-6 cv-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white">
                  Recommended Kashmir Sports Guides
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  More expert equipment reviews and athlete guides
                </p>
              </div>
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
                let relTitle = rel.postTitle;
                if (relTitle.startsWith("http://") || relTitle.startsWith("https://")) {
                  relTitle = "Handcrafted Kashmir Sports Article & Review";
                }

                return (
                  <Link
                    key={rel._id}
                    href={`/blog/${rel._id}`}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-500/50 transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
                  >
                    <div>
                      {relImg ? (
                        <div className="aspect-video relative overflow-hidden bg-zinc-800">
                          <img
                            src={relImg}
                            alt={relTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-orange-500">
                          <BookOpen size={24} />
                        </div>
                      )}
                      <div className="p-4 space-y-1.5">
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase">
                          {Array.isArray(rel.category) && rel.category.length > 0
                            ? String(rel.category[0])
                            : "Sports Guide"}
                        </p>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                          {relTitle}
                        </h4>
                      </div>
                    </div>
                    <div className="p-4 pt-0 text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                      <span>{formatBlogDate(rel.createdAt)}</span>
                      <span className="text-orange-600 font-bold group-hover:underline">Read Guide ›</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </article>

      {/* ─── High-Definition Lightbox Image Modal ─── */}
      {isLightboxOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer z-10"
            title="Close viewer"
          >
            <X size={24} />
          </button>
          <div
            className="relative max-w-6xl max-h-[92vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={cleanTitle}
              className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}