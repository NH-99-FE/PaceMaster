import { Skeleton } from '@/components/ui/skeleton';

type SectionCardSkeletonProps = {
  itemCount?: number;
  showAction?: boolean;
};

const SectionCardSkeleton = ({
  itemCount = 3,
  showAction = true,
}: SectionCardSkeletonProps) => {
  return (
    <div className="border-border bg-card rounded-lg border p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
        {showAction && <Skeleton className="h-8 w-24" />}
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: itemCount }).map((_, idx) => (
          <div
            key={`item-${idx}`}
            className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4 md:hidden">
        <div className="grid w-full grid-cols-2 gap-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <SectionCardSkeleton itemCount={3} showAction />
      </div>

      <div className="hidden gap-4 md:grid lg:grid-cols-[1fr_1fr]">
        <SectionCardSkeleton itemCount={3} showAction />
        <SectionCardSkeleton itemCount={3} showAction />
      </div>

      <div className="border-border bg-card rounded-lg border p-4 shadow-none">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
};

export default SettingsSkeleton;
