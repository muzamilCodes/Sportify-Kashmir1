"use client";

/**
 * Skeleton Loaders
 * Shimmer-effect placeholder components that match the shape of real content.
 * Provides perceived performance during data loading.
 */

/** Base skeleton block with shimmer effect */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

/** Skeleton matching the ProductCard layout */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse flex flex-col justify-between h-full">
      {/* Image placeholder */}
      <SkeletonBlock className="aspect-square w-full !rounded-none" />

      {/* Content */}
      <div className="p-3 sm:p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Title */}
          <SkeletonBlock className="h-4 w-5/6 !rounded" />
          <SkeletonBlock className="h-3.5 w-3/5 !rounded" />

          {/* Stars & Reviews */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <SkeletonBlock key={i} className="w-3 h-3 !rounded-full" />
              ))}
            </div>
            <SkeletonBlock className="h-3 w-8 !rounded" />
          </div>
        </div>

        {/* Price */}
        <div className="pt-1">
          <SkeletonBlock className="h-5 w-24 !rounded" />
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 pt-0">
        <div className="grid grid-cols-2 gap-1.5">
          <SkeletonBlock className="h-8 w-full !rounded-lg" />
          <SkeletonBlock className="h-8 w-full !rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Grid of product card skeletons: 2 cols on mobile, 3 on sm, 4 on md/lg, 5 on xl */
export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for page hero/header sections */
export function PageHeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <SkeletonBlock className="h-10 w-2/3 mx-auto" />
      <SkeletonBlock className="h-5 w-1/2 mx-auto" />
      <div className="flex justify-center gap-4 mt-6">
        <SkeletonBlock className="h-12 w-40 !rounded-full" />
        <SkeletonBlock className="h-12 w-40 !rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton for table rows in admin panels */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Skeleton for Category cards */
export function CategoryCardSkeleton() {
  return (
    <div className="surface-card rounded-2xl p-6 text-center animate-pulse">
      <SkeletonBlock className="w-16 h-16 !rounded-full mx-auto mb-4" />
      <SkeletonBlock className="h-5 w-3/4 mx-auto mb-2" />
      <SkeletonBlock className="h-4 w-1/2 mx-auto" />
    </div>
  );
}

/** Complete Product Detail Page Skeleton (0 Layout Shift, matches full product page) */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3">
        <div className="container mx-auto px-4 flex items-center gap-2">
          <SkeletonBlock className="h-4 w-12 !rounded" />
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <SkeletonBlock className="h-4 w-16 !rounded" />
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <SkeletonBlock className="h-4 w-40 !rounded" />
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24 md:pb-8">
        {/* Main Product Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Product Images Gallery */}
            <div>
              <div className="relative bg-gray-100 dark:bg-gray-700/60 rounded-2xl overflow-hidden aspect-square mb-3 sm:mb-4">
                <SkeletonBlock className="w-full h-full !rounded-2xl" />
              </div>
              <div className="flex gap-3 overflow-hidden pb-2">
                {[...Array(4)].map((_, i) => (
                  <SkeletonBlock key={i} className="w-20 h-20 !rounded-lg shrink-0" />
                ))}
              </div>
            </div>

            {/* Right: Product Details Info */}
            <div className="space-y-4">
              {/* Category Badges */}
              <div className="flex gap-2">
                <SkeletonBlock className="h-6 w-20 !rounded-full" />
                <SkeletonBlock className="h-6 w-24 !rounded-full" />
              </div>

              {/* Product Title */}
              <div className="space-y-2">
                <SkeletonBlock className="h-8 w-5/6 !rounded-lg" />
                <SkeletonBlock className="h-7 w-3/5 !rounded-lg" />
              </div>

              {/* Star Rating & Reviews */}
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-5 w-28 !rounded" />
                <SkeletonBlock className="h-4 w-32 !rounded" />
              </div>

              {/* Price & Savings */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-baseline gap-3">
                  <SkeletonBlock className="h-10 w-36 !rounded-lg" />
                  <SkeletonBlock className="h-6 w-24 !rounded" />
                  <SkeletonBlock className="h-5 w-20 !rounded" />
                </div>
              </div>

              {/* VIP Prime Strip */}
              <SkeletonBlock className="h-14 w-full !rounded-2xl" />

              {/* Colors */}
              <div className="space-y-2 pt-2">
                <SkeletonBlock className="h-4 w-20 !rounded" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-9 w-20 !rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2 pt-1">
                <SkeletonBlock className="h-4 w-28 !rounded" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-10 w-14 !rounded-xl" />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2 pt-1">
                <SkeletonBlock className="h-4 w-20 !rounded" />
                <SkeletonBlock className="h-10 w-32 !rounded-lg" />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-3">
                <div className="flex gap-3">
                  <SkeletonBlock className="h-13 flex-1 !rounded-xl" />
                  <SkeletonBlock className="h-13 flex-1 !rounded-xl" />
                  <SkeletonBlock className="h-13 w-13 !rounded-xl shrink-0" />
                  <SkeletonBlock className="h-13 w-13 !rounded-xl shrink-0" />
                </div>
                <SkeletonBlock className="h-12 w-full !rounded-xl" />
              </div>

              {/* Delivery Pincode Box */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <SkeletonBlock className="h-9 w-72 !rounded-lg" />
                <SkeletonBlock className="h-5 w-full !rounded" />
                <SkeletonBlock className="h-5 w-4/5 !rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
          <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 pb-3">
            <SkeletonBlock className="h-6 w-24 !rounded" />
            <SkeletonBlock className="h-6 w-28 !rounded" />
            <SkeletonBlock className="h-6 w-24 !rounded" />
          </div>
          <div className="space-y-2 pt-2">
            <SkeletonBlock className="h-4 w-full !rounded" />
            <SkeletonBlock className="h-4 w-11/12 !rounded" />
            <SkeletonBlock className="h-4 w-4/5 !rounded" />
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar Skeleton */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-3 py-2 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <SkeletonBlock className="h-6 w-24 !rounded" />
          <SkeletonBlock className="h-3 w-32 !rounded" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-18 !rounded-xl" />
          <SkeletonBlock className="h-9 w-24 !rounded-xl" />
          <SkeletonBlock className="h-9 w-9 !rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonBlock;


