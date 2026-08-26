"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  Loader2,
  Search,
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight,
  Flame,
} from "lucide-react";
import {
  BlogPost,
  getBlogImageUrl,
  formatBlogDate,
  calculateReadTime,
} from "@/lib/blogData";

const CATEGORIES = [
  "All Articles",
  "Cricket Willow",
  "Football",
  "Badminton",
  "Fitness & Training",
  "Kashmir Sports",
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Articles");

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts/getAll`);
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
    } finally {
      setLoading(false);
    }
  };

  // Filter real database posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        post.postTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.postDesc?.toLowerCase().includes(searchQuery.toLowerCase());

      const postCats = Array.isArray(post.category)
        ? post.category.join(" ")
        : typeof post.category === "string"
        ? post.category
        : "";

      const matchCategory =
        selectedCategory === "All Articles" ||
        postCats.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        post.postTitle?.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchSearch && matchCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-gray-900 dark:text-white pb-24 md:pb-16 transition-colors duration-200">
      {/* ═══════════════════════════════════════════════════════════════════════
          HERO BANNER & SEARCH BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white py-14 sm:py-20 px-4 border-b border-gray-800 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-red-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-black uppercase tracking-wider shadow-xs">
            <Flame size={14} className="text-orange-500 fill-orange-500" />
            <span>Sportify Kashmir Journal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Kashmir Sports Insights, Bat Craft &amp; Athletic Guides
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover master craftsman techniques, equipment maintenance guides, tournament tactics, and nutrition stories tailored for athletes across the Valley.
          </p>

          {/* Search Input in Hero */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 transition">
              <Search className="absolute left-4 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles on bat knocking, turf studs, badminton string..."
                className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="pr-4 text-xs font-bold text-gray-400 hover:text-orange-500 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                    active
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                      : "bg-gray-850 hover:bg-gray-800 text-gray-300 border-gray-700/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-12">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
              Loading Kashmir sports stories...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-850 rounded-3xl p-10 text-center max-w-md mx-auto border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-black">No matching stories found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {searchQuery ? `No articles matching "${searchQuery}".` : "No articles published in this category yet."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Articles");
              }}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* ─── FEATURED SPOTLIGHT ARTICLE ─── */}
            {selectedCategory === "All Articles" && !searchQuery && featuredPost && (() => {
              const featImg = getBlogImageUrl(featuredPost.postImgUrl);
              return (
                <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-200/90 dark:border-gray-700/80 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                  <div className={`grid grid-cols-1 ${featImg ? "lg:grid-cols-12" : ""} gap-0`}>
                    {/* Left Hero Image (Only if real uploaded image exists) */}
                    {featImg && (
                      <Link
                        href={`/blog/${featuredPost._id}`}
                        className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden bg-gray-100 dark:bg-gray-850 block"
                      >
                        <img
                          src={featImg}
                          alt={featuredPost.postTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-black uppercase rounded-full shadow-md tracking-wider flex items-center gap-1">
                            <Sparkles size={12} />
                            <span>Featured Story</span>
                          </span>
                        </div>
                      </Link>
                    )}

                    {/* Right Article Details */}
                    <div className={`${featImg ? "lg:col-span-5" : "w-full"} p-6 sm:p-8 flex flex-col justify-between space-y-4`}>
                      <div className="space-y-3">
                        {/* Meta chips */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          {!featImg && (
                            <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-extrabold text-[10px] rounded-full uppercase">
                              Featured Story
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-orange-500" />
                            <span>{formatBlogDate(featuredPost.createdAt)}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-orange-500" />
                            <span>{calculateReadTime(featuredPost.postDesc)}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <Link href={`/blog/${featuredPost._id}`}>
                          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight">
                            {featuredPost.postTitle}
                          </h2>
                        </Link>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                          {featuredPost.shortDesc || (featuredPost.postDesc ? featuredPost.postDesc.substring(0, 160) + "..." : "")}
                        </p>
                      </div>

                      {/* Author & CTA Button */}
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {featuredPost.postAuthorId?.username?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">
                              {featuredPost.postAuthorId?.username || "Sportify Specialist"}
                            </p>
                            <span className="text-[10px] text-gray-400">Verified Contributor</span>
                          </div>
                        </div>

                        <Link
                          href={`/blog/${featuredPost._id}`}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition flex items-center gap-1.5 shrink-0 active:scale-95"
                        >
                          <span>Read Story</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ─── ARTICLES 3-COLUMN RESPONSIVE GRID ─── */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                    {selectedCategory === "All Articles" ? "All Recent Stories" : `${selectedCategory} Articles`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {filteredPosts.length} published stories &amp; equipment tutorials
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                {filteredPosts.map((post) => {
                  const readTime = calculateReadTime(post.postDesc);
                  const postImg = getBlogImageUrl(post.postImgUrl);

                  return (
                    <article
                      key={post._id}
                      className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-200/90 dark:border-gray-750/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Cover Image Container (Only if real uploaded image exists) */}
                        {postImg ? (
                          <Link
                            href={`/blog/${post._id}`}
                            className="block relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800"
                          >
                            <img
                              src={postImg}
                              alt={post.postTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-0.8 bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-white/20">
                                {Array.isArray(post.category) && post.category.length > 0
                                  ? post.category[0]
                                  : typeof post.category === "string"
                                  ? post.category
                                  : "Sports Guide"}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                              <Clock size={10} />
                              <span>{readTime}</span>
                            </div>
                          </Link>
                        ) : null}

                        {/* Article Header & Body */}
                        <div className="p-5 sm:p-6 space-y-2.5">
                          {/* Top category chip if no image */}
                          {!postImg && (
                            <div className="flex items-center justify-between pb-1">
                              <span className="px-2.5 py-0.8 bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                                {Array.isArray(post.category) && post.category.length > 0
                                  ? post.category[0]
                                  : typeof post.category === "string"
                                  ? post.category
                                  : "Sports Guide"}
                              </span>
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-semibold">
                                <Clock size={10} />
                                <span>{readTime}</span>
                              </span>
                            </div>
                          )}

                          {/* Date and Author */}
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-orange-500" />
                              <span>{formatBlogDate(post.createdAt)}</span>
                            </span>
                            <span>•</span>
                            <span className="truncate">
                              {post.postAuthorId?.username || "Sportify Desk"}
                            </span>
                          </div>

                          {/* Post Title */}
                          <Link href={`/blog/${post._id}`}>
                            <h4 className="text-base sm:text-lg font-black text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                              {post.postTitle}
                            </h4>
                          </Link>

                          {/* Excerpt */}
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                            {post.shortDesc || (post.postDesc ? post.postDesc.substring(0, 120) + "..." : "")}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Link */}
                      <div className="p-5 sm:p-6 pt-0 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between text-xs">
                        <Link
                          href={`/blog/${post._id}`}
                          className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 group/btn"
                        >
                          <span>Read Full Story</span>
                          <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>

                        {post.likes !== undefined && post.likes > 0 && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span>❤️</span>
                            <span>{post.likes}</span>
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ─── COMMUNITY NEWSLETTER BANNER ─── */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-1 max-w-2xl space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
                  Kashmir Athletes Circle
                </span>
                <h3 className="text-2xl sm:text-3xl font-black">
                  Stay Updated with Kashmir Tournament News &amp; VIP Bat Drops
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Join thousands of cricketers, footballers, and sports academies across Jammu &amp; Kashmir who receive weekly technique breakdowns and exclusive gear deals.
                </p>
                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  <Link
                    href="/products"
                    className="px-5 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer active:scale-95"
                  >
                    Explore Sports Gear Catalog
                  </Link>
                  <Link
                    href="/contact"
                    className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition cursor-pointer backdrop-blur-xs"
                  >
                    Submit an Article / Match Story
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
