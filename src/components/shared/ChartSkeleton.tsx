import { Skeleton } from '@/components/ui/skeleton';

type ChartSkeletonProps = {
  variant?: 'trend' | 'distribution';
};

const ChartSkeleton = ({ variant = 'trend' }: ChartSkeletonProps) => {
  if (variant === 'distribution') {
    return (
      <div className="border-border bg-card rounded-lg border p-4 shadow-none">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="mt-4 flex h-64 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={`legend-${idx}`} className="h-3 w-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-lg border p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="mt-4 h-64 w-full" />
    </div>
  );
};

export default ChartSkeleton;
