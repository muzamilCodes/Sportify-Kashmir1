"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  Flame,
} from "lucide-react";
import {
  BlogPost,
  getBlogImageUrl,
  formatBlogDate,
  calculateReadTime,
} from "@/lib/blogData";

export default function HomeBlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/posts/getAll`);
      const result = await response.json();

      if (result.success && Array.isArray(result.posts)) {
        setPosts(result.posts.slice(0, 3));
      } else if (result.success && Array.isArray(result.data)) {
        setPosts(result.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching homepage blog posts:", error);
    }
  };

  if (posts.length === 0) return null;

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-950/60 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] font-black uppercase tracking-wider mb-2">
            <Flame size={12} className="text-orange-500 fill-orange-500" />
            <span>Kashmir Sports Journal</span>
          </div>
          <h2 className="sk-section-title text-[22px] sm:text-[26px] md:text-[30px] text-zinc-900 dark:text-white">
            Sports Guides &amp; Equipment Craft
          </h2>
          <p className="text-[13px] sm:text-[14px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Expert maintenance tutorials, bat knocking guides, and athlete tips from across the Valley
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline group shrink-0"
        >
          <span>Explore All Articles</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3-Card Responsive Grid from Real DB Posts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {posts.map((post) => {
          const readTime = calculateReadTime(post.postDesc);
          const postImg = getBlogImageUrl(post.postImgUrl);

          return (
            <article
              key={post._id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-400/60 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image (Only if real uploaded image exists) */}
                {postImg && (
                  <Link
                    href={`/blog/${post._id}`}
                    className="block relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={postImg}
                      alt={post.postTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 bg-gray-950/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider border border-white/20">
                        {Array.isArray(post.category) && post.category.length > 0
                          ? post.category[0]
                          : typeof post.category === "string"
                          ? post.category
                          : "Sports Guide"}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                      <Clock size={10} />
                      <span>{readTime}</span>
                    </div>
                  </Link>
                )}

                {/* Article Header & Excerpt */}
                <div className="p-4 sm:p-5 space-y-2">
                  {!postImg && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                        {Array.isArray(post.category) && post.category.length > 0
                          ? post.category[0]
                          : typeof post.category === "string"
                          ? post.category
                          : "Sports Guide"}
                      </span>
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold">
                        <Clock size={10} />
                        <span>{readTime}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-orange-500" />
                      <span>{formatBlogDate(post.createdAt)}</span>
                    </span>
                    <span>•</span>
                    <span className="truncate">
                      {post.postAuthorId?.username || "Sportify Specialist"}
                    </span>
                  </div>

                  <Link href={`/blog/${post._id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                      {post.postTitle}
                    </h3>
                  </Link>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {post.shortDesc || (post.postDesc ? post.postDesc.substring(0, 100) + "..." : "")}
                  </p>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs mt-2">
                <Link
                  href={`/blog/${post._id}`}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 group/btn"
                >
                  <span>Read Guide</span>
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[11px] text-zinc-400">Free Article</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
