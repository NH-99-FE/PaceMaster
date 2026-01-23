import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/time';

type OverviewStats = {
  totalTimeMs: number;
  totalQuestions: number;
  accuracyRate: number;
  completionRate: number;
};

type OverviewDelta = {
  totalTimeMs: number;
  totalQuestions: number;
  accuracyRate: number;
  completionRate: number;
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatSigned = (value: number, formatter: (value: number) => string) => {
  if (value === 0) return '持平';
  const sign = value > 0 ? '+' : '-';
  return `${sign}${formatter(Math.abs(value))}`;
};

const getDeltaMeta = (value: number) => {
  if (value > 0) {
    return { icon: ArrowUpRight, color: 'text-emerald-600' };
  }
  if (value < 0) {
    return { icon: ArrowDownRight, color: 'text-rose-600' };
  }
  return { icon: Minus, color: 'text-muted-foreground' };
};

const DeltaIndicator = ({
  value,
  formatter,
}: {
  value: number;
  formatter: (value: number) => string;
}) => {
  // 昨日对比箭头
  const meta = getDeltaMeta(value);
  const Icon = meta.icon;
  return (
    <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
      <span className={cn('flex items-center gap-1 font-medium', meta.color)}>
        <Icon className="h-3.5 w-3.5" />
        {formatSigned(value, formatter)}
      </span>
      <span>较昨日</span>
    </div>
  );
};

export const DashboardOverviewCards = ({
  stats,
  delta,
}: {
  stats: OverviewStats;
  delta: OverviewDelta;
}) => (
  <Card className="shadow-none">
    <CardContent className="grid grid-cols-2 gap-3 p-4 text-sm md:grid-cols-4">
      <div>
        <p className="text-muted-foreground text-xs">今日用时</p>
        <div className="mt-1 text-base font-semibold">
          {formatDuration(stats.totalTimeMs)}
        </div>
        <DeltaIndicator
          value={delta.totalTimeMs}
          formatter={value => formatDuration(value)}
        />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">今日题数</p>
        <div className="mt-1 text-base font-semibold">
          {stats.totalQuestions}
        </div>
        <DeltaIndicator
          value={delta.totalQuestions}
          formatter={value => value.toString()}
        />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">今日正确率</p>
        <div className="mt-1 text-base font-semibold">
          {formatPercent(stats.accuracyRate)}
        </div>
        <DeltaIndicator
          value={delta.accuracyRate}
          formatter={value => formatPercent(value)}
        />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">今日完成率</p>
        <div className="mt-1 text-base font-semibold">
          {formatPercent(stats.completionRate)}
        </div>
        <DeltaIndicator
          value={delta.completionRate}
          formatter={value => formatPercent(value)}
        />
      </div>
    </CardContent>
  </Card>
);
