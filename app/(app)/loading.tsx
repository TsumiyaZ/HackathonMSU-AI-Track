export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero / Header Skeleton */}
      <div className="glass-panel-strong rounded-2xl h-40 w-full flex items-center p-8">
        <div className="flex flex-col gap-3 w-full max-w-md">
          <div className="h-4 skeleton-shimmer rounded-full w-24"></div>
          <div className="h-10 skeleton-shimmer rounded-xl w-3/4"></div>
          <div className="h-4 skeleton-shimmer rounded-full w-1/2"></div>
        </div>
      </div>

      {/* Filters / Toolbar Skeleton */}
      <div className="glass-panel rounded-2xl h-20 w-full flex items-center px-6 gap-4">
         <div className="h-10 skeleton-shimmer rounded-xl flex-1"></div>
         <div className="h-10 skeleton-shimmer rounded-xl w-32 hidden md:block"></div>
         <div className="h-10 skeleton-shimmer rounded-xl w-32 hidden md:block"></div>
         <div className="h-10 skeleton-shimmer rounded-xl w-32 hidden md:block"></div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass-panel p-4 rounded-2xl h-80 flex flex-col gap-4">
            <div className="w-full h-40 skeleton-shimmer rounded-xl"></div>
            <div className="w-3/4 h-6 skeleton-shimmer rounded-md"></div>
            <div className="w-1/2 h-4 skeleton-shimmer rounded-md"></div>
            <div className="mt-auto flex justify-between items-center">
               <div className="w-1/3 h-6 skeleton-shimmer rounded-md"></div>
               <div className="w-20 h-8 skeleton-shimmer rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
