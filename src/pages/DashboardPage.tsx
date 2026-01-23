import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardDistributionCard } from '@/features/dashboard/components/DashboardDistributionCard';
import { DashboardOverviewCards } from '@/features/dashboard/components/DashboardOverviewCards';
import { DashboardRecentRecords } from '@/features/dashboard/components/DashboardRecentRecords';
import { DashboardTrendCard } from '@/features/dashboard/components/DashboardTrendCard';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { records, trend, distributionData, today, delta, isLoading, refresh } =
    useDashboardStats();
  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('数据已刷新');
    } catch {
      toast.error('刷新失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">概览</h1>
          <p className="text-muted-foreground text-sm">
            最近 7 天趋势与今日表现
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="relative"
        >
          <span className={isLoading ? 'opacity-0' : ''}>刷新</span>
          {isLoading && (
            <Loader2 className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          )}
        </Button>
      </div>

      <DashboardOverviewCards stats={today} delta={delta} />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <DashboardTrendCard data={trend} />
        <DashboardDistributionCard data={distributionData} />
      </div>

      <DashboardRecentRecords
        records={records}
        onViewAll={() => navigate('/records')}
        onSelect={id => navigate(`/records/${id}`)}
      />
    </div>
  );
};

export default DashboardPage;
