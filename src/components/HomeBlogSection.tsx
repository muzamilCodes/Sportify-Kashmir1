"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  Flame,
  ChevronLeft,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  BlogPost,
  getBlogImageUrl,
  formatBlogDate,
  calculateReadTime,
} from "@/lib/blogData";
import { cachedJson } from "@/lib/clientCache";

export default function HomeBlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const result = await cachedJson<any>(`${API_URL}/posts/getAll`);

      let dbPosts: BlogPost[] = [];
      if (result?.success && Array.isArray(result.posts)) {
        dbPosts = result.posts;
      } else if (result?.success && Array.isArray(result.data)) {
        dbPosts = result.data;
      }

      // Only display 100% real database posts - no dummy/hardcoded fallbacks
      setPosts(dbPosts);
    } catch (error) {
      console.error("Error fetching homepage blog posts:", error);
      setPosts([]);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  // If no blog posts have been added to the database yet, do not render section
  if (posts.length === 0) return null;

  // Duplicate items for infinite stream if there are multiple posts
  const marqueeItems = posts.length > 2 ? [...posts, ...posts] : posts;

  return (
    <section className="mb-16 relative overflow-hidden">
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-950/60 dark:to-amber-950/60 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] font-black uppercase tracking-wider mb-2">
            <Flame size={13} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span>Kashmir Sports Journal &amp; Guides</span>
          </div>
          <h2 className="sk-section-title text-[22px] sm:text-[28px] md:text-[32px] text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Sports Guides &amp; Equipment Craft</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-bold border border-orange-500/20">
              Live Stream
            </span>
          </h2>
          <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            Master bat maintenance, leather ball knocking, gear reviews, and local Valley tournament stories
          </p>
        </div>

        {/* Right Side Navigation Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-850 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <button
              type="button"
              onClick={scrollLeft}
              className="p-1.5 rounded-lg hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="p-1.5 rounded-lg hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition active:scale-95"
          >
            <span>View All Guides</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* ─── Moving Stream from Right to Left (Pause on Hover/Touch) ─── */}
      <div
        className="relative -mx-3 px-3 sm:-mx-6 sm:px-6 overflow-x-auto scrollbar-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left & Right Gradient Fade Masks */}
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-50 dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollContainerRef}
          className={`flex gap-5 py-2 ${posts.length > 2 ? "animate-marquee-rtl" : ""}`}
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {marqueeItems.map((post, idx) => {
            const readTime = calculateReadTime(post.postDesc);
            const postImg = getBlogImageUrl(post.postImgUrl);
            const authorName =
              typeof post.postAuthorId === "object" && post.postAuthorId?.username
                ? post.postAuthorId.username
                : "Sportify Specialist";

            const postCategory =
              Array.isArray(post.category) && post.category.length > 0
                ? post.category[0]
                : typeof post.category === "string" && post.category.trim()
                ? post.category
                : "Kashmir Craft";

            let cleanTitle = post.postTitle;
            if (cleanTitle.startsWith("http://") || cleanTitle.startsWith("https://")) {
              cleanTitle = "Handcrafted Kashmir Sports Article & Equipment Review";
            }

            return (
              <article
                key={`${post._id}-${idx}`}
                className="w-[280px] sm:w-[340px] shrink-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden shadow-sm hover:shadow-2xl hover:border-orange-500/60 transition-all duration-300 flex flex-col justify-between group/card hover:-translate-y-1.5"
              >
                <div>
                  {/* Article Cover Image */}
                  <Link
                    href={`/blog/${post._id}`}
                    className="block relative aspect-video overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900"
                  >
                    {postImg ? (
                      <img
                        src={postImg}
                        alt={cleanTitle}
                        className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-zinc-900 via-orange-950/40 to-zinc-900 text-center">
                        <BookOpen size={32} className="text-orange-500 mb-2 opacity-80" />
                        <span className="text-xs font-black text-white/90 tracking-wide">
                          Sportify Kashmir Guide
                        </span>
                      </div>
                    )}

                    {/* Category Pill Tag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-orange-400 font-extrabold text-[10px] uppercase tracking-wider border border-white/10 shadow-md">
                        {postCategory}
                      </span>
                    </div>

                    {/* Read Time Tag */}
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <Clock size={10} className="text-orange-400" />
                        <span>{readTime}</span>
                      </span>
                    </div>
                  </Link>

                  {/* Article Text Content */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      <span>{authorName}</span>
                      <span>•</span>
                      <span>{formatBlogDate(post.createdAt)}</span>
                    </div>

                    <Link href={`/blog/${post._id}`} className="block group-hover/card:text-orange-500 transition-colors">
                      <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white leading-snug line-clamp-2">
                        {cleanTitle}
                      </h3>
                    </Link>

                    {post.shortDesc && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                        {post.shortDesc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                  <Link
                    href={`/blog/${post._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-orange-600 dark:text-orange-400 group-hover/card:translate-x-1 transition-transform"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
