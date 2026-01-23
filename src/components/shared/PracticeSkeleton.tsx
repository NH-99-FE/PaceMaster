import { Skeleton } from '@/components/ui/skeleton';

const PracticeSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-border bg-card rounded-lg border p-4 shadow-none">
          <Skeleton className="h-4 w-24" />
          <div className="mt-4 space-y-5">
            <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="grid grid-cols-2 gap-3 md:col-span-2">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div
                    key={`timer-${idx}`}
                    className="border-border/60 bg-muted/20 rounded-md border px-3 py-2"
                  >
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="mt-2 h-6 w-20" />
                  </div>
                ))}
              </div>
            </div>

            <Skeleton className="h-px w-full" />

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>

        <div className="border-border bg-card rounded-lg border p-4 shadow-none">
          <Skeleton className="h-4 w-32" />
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>

            <Skeleton className="h-px w-full" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSkeleton;
