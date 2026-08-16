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

/** Skeleton for category cards */
export function CategoryCardSkeleton() {
  return (
    <div className="surface-card rounded-2xl p-6 text-center animate-pulse">
      <SkeletonBlock className="w-16 h-16 !rounded-full mx-auto mb-4" />
      <SkeletonBlock className="h-5 w-3/4 mx-auto mb-2" />
      <SkeletonBlock className="h-4 w-1/2 mx-auto" />
    </div>
  );
}

export default SkeletonBlock;

