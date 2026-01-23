import { Skeleton } from '@/components/ui/skeleton';

const StatCardSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
};

export default StatCardSkeleton;
