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
    <div className="surface-card rounded-2xl overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <SkeletonBlock className="aspect-square w-full !rounded-none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />

        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <SkeletonBlock key={i} className="w-3 h-3 !rounded-full" />
          ))}
        </div>

        {/* Price */}
        <SkeletonBlock className="h-6 w-1/3" />

        {/* Button */}
        <SkeletonBlock className="h-9 w-full !rounded-lg" />
      </div>
    </div>
  );
}

/** Grid of product card skeletons */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
