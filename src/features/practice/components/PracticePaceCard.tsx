import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatDuration } from '@/utils/time';
import type { PracticeItem } from '@/features/practice/types';

type PracticePaceCardProps = {
  currentItem?: PracticeItem;
  activeIndex: number;
  totalTypes: number;
  plannedMs: number;
  actualMs: number;
  progressValue: number;
  isOvertime: boolean;
};

export const PracticePaceCard = ({
  currentItem,
  activeIndex,
  totalTypes,
  plannedMs,
  actualMs,
  progressValue,
  isOvertime,
}: PracticePaceCardProps) => (
  <Card className="shadow-none">
    <CardHeader>
      <CardTitle>当前题型与节奏</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <div className="text-lg font-semibold">
          {currentItem?.label ?? '未开始'}
        </div>
        <div className="text-muted-foreground text-sm">
          进度 {totalTypes ? activeIndex + 1 : 0} / {totalTypes}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">计划用时</span>
          <span>{formatDuration(plannedMs)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">实际用时</span>
          <span className={isOvertime ? 'text-destructive' : ''}>
            {formatDuration(actualMs)}
          </span>
        </div>
        <Progress value={progressValue} />
        {isOvertime && (
          <p className="text-destructive text-xs">已超出计划时间</p>
        )}
      </div>
    </CardContent>
  </Card>
);
