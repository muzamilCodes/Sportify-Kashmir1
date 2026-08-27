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
  Award,
} from "lucide-react";
import {
  BlogPost,
  getBlogImageUrl,
  formatBlogDate,
  calculateReadTime,
} from "@/lib/blogData";

// Curated high-value Kashmir Sports Guides used as backup/complement if DB has few posts
const CURATED_KASHMIR_GUIDES: Partial<BlogPost>[] = [
  {
    _id: "guide-kashmir-willow",
    postTitle: "Kashmir Willow vs English Willow: The Complete Player's Guide",
    shortDesc: "Discover grain density, sweet-spot durability, and why international power hitters choose Kashmir grade 1 clefts.",
    postDesc: "Kashmir willow is renowned globally for its natural toughness and unmatched value. Learn how to pick the right weight and balance for your batting style.",
    postImgUrl: "https://res.cloudinary.com/dhjxicuo9/image/upload/v1787500292/fer4euivhuzwjqxtb2w1.jpg",
    category: ["Cricket Willow", "Equipment Craft"],
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    postAuthorId: { username: "Ustaad Farooq (Master Batmaker)" },
  },
  {
    _id: "guide-bat-knocking",
    postTitle: "Step-by-Step Bat Knocking, Oiling & Edge Protection Guide",
    shortDesc: "Protect your new bat against high-velocity seam cracks with our 4-step artisan preparation guide.",
    postDesc: "Linseed oiling, wooden mallet edge hammering, and anti-scuff sheet application explained step-by-step.",
    postImgUrl: "https://res.cloudinary.com/dhjxicuo9/image/upload/v1787837853/yowoes2vybgrcfuoxu9y.jpg",
    category: ["Bat Care & Maintenance"],
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    postAuthorId: { username: "Sportify Gear Lab" },
  },
  {
    _id: "guide-valley-football",
    postTitle: "Valley High-Altitude Training & Boot Traction Selection",
    shortDesc: "How Kashmir athletes optimize stamina in winter turf conditions and pick the right FG/AG studs.",
    postDesc: "A deep dive into turf grip, ankle protection, and thermoregulation during high-intensity mountain matches.",
    postImgUrl: null,
    category: ["Football & Training"],
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    postAuthorId: { username: "Coach Aadil" },
  },
];

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
      const response = await fetch(`${API_URL}/posts/getAll`);
      const result = await response.json();

      let dbPosts: BlogPost[] = [];
      if (result.success && Array.isArray(result.posts)) {
        dbPosts = result.posts;
      } else if (result.success && Array.isArray(result.data)) {
        dbPosts = result.data;
      }

      // If DB has posts, merge with curated guides to ensure a rich infinite stream
      if (dbPosts.length > 0) {
        const remainingNeeded = Math.max(0, 4 - dbPosts.length);
        const merged = [
          ...dbPosts,
          ...CURATED_KASHMIR_GUIDES.slice(0, remainingNeeded),
        ] as BlogPost[];
        setPosts(merged);
      } else {
        setPosts(CURATED_KASHMIR_GUIDES as BlogPost[]);
      }
    } catch (error) {
      console.error("Error fetching homepage blog posts:", error);
      setPosts(CURATED_KASHMIR_GUIDES as BlogPost[]);
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

  if (posts.length === 0) return null;

  // Duplicate items to ensure seamless infinite loop animation from right to left
  const marqueeItems = [...posts, ...posts];

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
          {/* Manual Scroll Controls */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-850 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <button
              type="button"
              onClick={scrollLeft}
              className="p-1.5 rounded-lg hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition cursor-pointer"
              title="Previous guide"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="p-1.5 rounded-lg hover:bg-orange-500/10 text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition cursor-pointer"
              title="Next guide"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Explore All Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition active:scale-95 group"
          >
            <span>Explore All Articles</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ─── Continuous Right-to-Left Moving Marquee Stream ─── */}
      <div
        className="relative w-full group/stream overflow-hidden py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right Edge Gradient Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[var(--color-bg-primary)] to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[var(--color-bg-primary)] to-transparent z-20" />

        {/* Marquee Track Moving Right to Left */}
        <div
          ref={scrollContainerRef}
          className={`flex gap-5 py-2 animate-marquee-rtl`}
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

            // Clean title display if a URL was mistakenly entered as the title
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
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-white/20 shadow-sm flex items-center gap-1">
                        <Sparkles size={10} className="text-amber-400" />
                        <span>{postCategory}</span>
                      </span>
                    </div>

                    {/* Read Time Badge */}
                    <div className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 border border-white/10 shadow-sm">
                      <Clock size={11} className="text-orange-400" />
                      <span>{readTime}</span>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    {/* Meta Row */}
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                        <Calendar size={12} className="text-orange-500" />
                        <span>{formatBlogDate(post.createdAt)}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate font-medium text-zinc-600 dark:text-zinc-300">
                        {authorName}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/blog/${post._id}`} className="block">
                      <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white group-hover/card:text-orange-600 dark:group-hover/card:text-orange-400 transition-colors line-clamp-2 leading-snug">
                        {cleanTitle}
                      </h3>
                    </Link>

                    {/* Summary */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                      {post.shortDesc ||
                        (post.postDesc
                          ? post.postDesc.substring(0, 95) + "..."
                          : "Explore professional craft notes, wood selection, and athlete equipment tips.")}
                    </p>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 sm:p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs bg-zinc-50/50 dark:bg-zinc-900/50">
                  <Link
                    href={`/blog/${post._id}`}
                    className="font-black text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1.5 group/btn"
                  >
                    <span>Read Full Guide</span>
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    Free Article
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
