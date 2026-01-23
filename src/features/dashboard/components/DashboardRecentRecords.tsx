import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DashboardRecord } from '@/features/dashboard/hooks/useDashboardStats';
import { formatDateTime, formatDuration } from '@/utils/time';

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

type DashboardRecentRecordsProps = {
  records: DashboardRecord[];
  onViewAll: () => void;
  onSelect: (id: string) => void;
};

export const DashboardRecentRecords = ({
  records,
  onViewAll,
  onSelect,
}: DashboardRecentRecordsProps) => (
  <Card className="shadow-none">
    <CardContent className="space-y-3 p-4">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>最近记录</span>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          查看全部
        </Button>
      </div>
      <Separator />
      {records.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center text-sm">
          暂无复盘记录，完成一次练习并保存复盘即可在这里查看。
        </div>
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <button
              key={record.id}
              type="button"
              onClick={() => onSelect(record.id)}
              className="border-border hover:border-primary/40 hover:bg-primary/5 flex w-full flex-col gap-2 rounded-md border px-3 py-2 text-left transition-colors md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {record.templateName}
                  </span>
                  <Badge
                    variant={
                      record.mode === 'practice' ? 'secondary' : 'outline'
                    }
                    className="text-[10px]"
                  >
                    {record.mode === 'practice' ? '练习' : '模拟'}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {record.endedAt
                      ? formatDateTime(record.endedAt)
                      : '未记录时间'}
                  </span>
                </div>
              </div>

              <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                <span>正确率 {formatPercent(record.accuracyRate)}</span>
                <span>完成率 {formatPercent(record.completionRate)}</span>
                <span>题数 {record.totalQuestions}</span>
                <span>用时 {formatDuration(record.totalTimeMs)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
