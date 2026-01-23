import { Skeleton } from '@/components/ui/skeleton';

type ReviewSkeletonProps = {
  variant?: 'review' | 'recordDetail';
};

const ReviewSkeleton = ({ variant = 'review' }: ReviewSkeletonProps) => {
  const isRecordDetail = variant === 'recordDetail';
  const badgeCount = isRecordDetail ? 2 : 1;
  const buttonCount = isRecordDetail ? 3 : 2;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: badgeCount }).map((_, idx) => (
            <Skeleton key={`badge-${idx}`} className="h-6 w-20" />
          ))}
          {Array.from({ length: buttonCount }).map((_, idx) => (
            <Skeleton key={`btn-${idx}`} className="h-9 w-20" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-border bg-card rounded-lg border p-4 shadow-none">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            {isRecordDetail && <Skeleton className="h-8 w-24" />}
          </div>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`summary-top-${idx}`} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-4 shadow-none">
          <Skeleton className="h-4 w-20" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={`status-${idx}`} className="h-12 w-full" />
            ))}
          </div>
          <Skeleton className="mt-4 h-3 w-48" />
        </div>
      </div>

      {isRecordDetail && (
        <div className="border-border bg-card rounded-lg border p-4 shadow-none">
          <Skeleton className="h-4 w-24" />
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`insight-${idx}`}
                className="border-border/60 bg-muted/20 rounded-lg border p-3"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
                <Skeleton className="my-3 h-px w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-border bg-card rounded-lg border p-4 shadow-none">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {Array.from({ length: 40 }).map((_, idx) => (
            <Skeleton key={`q-${idx}`} className="h-9 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSkeleton;
