import ChartSkeleton from '@/components/shared/ChartSkeleton';
import StatCardSkeleton from '@/components/shared/StatCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="border-border bg-card rounded-lg border p-4 shadow-none">
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <StatCardSkeleton key={`stat-${idx}`} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <ChartSkeleton variant="trend" />
        <ChartSkeleton variant="distribution" />
      </div>

      <div className="border-border bg-card rounded-lg border p-4 shadow-none">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="mt-3 h-px w-full" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`record-${idx}`}
              className="border-border flex flex-col gap-2 rounded-md border px-3 py-2 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
