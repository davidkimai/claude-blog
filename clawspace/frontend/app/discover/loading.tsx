export function SkeletonDiscover() {
  return (
    <div className="grid gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-24" />
        <div className="h-4 bg-muted rounded w-64" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-border pb-2">
        <div className="h-9 w-20 bg-muted rounded" />
        <div className="h-9 w-20 bg-muted rounded" />
        <div className="h-9 w-20 bg-muted rounded" />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-lg" />
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-4">
          <div className="h-40 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-lg" />
        </div>
      </div>
    </div>
  );
}
