import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDuration } from '@/utils/time';

type ReviewSummaryProps = {
  totalQuestions: number;
  plannedTotalMs: number;
  totalMs: number;
  counts: {
    correct: number;
    wrong: number;
    skip: number;
    unanswered: number;
  };
  accuracyRate: number;
  completionRate: number;
  action?: ReactNode;
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export const ReviewSummary = ({
  totalQuestions,
  plannedTotalMs,
  totalMs,
  counts,
  accuracyRate,
  completionRate,
  action,
}: ReviewSummaryProps) => (
  <Card className="shadow-none">
    <CardHeader className="flex flex-row items-center justify-between gap-2">
      <CardTitle>本次复盘总览</CardTitle>
      {action}
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-xs">总题数</p>
          <div className="mt-1 text-xl font-semibold">{totalQuestions} 题</div>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">总用时</p>
          <div className="mt-1 text-xl font-semibold">
            {formatDuration(totalMs)}
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">计划总用时</p>
          <div className="mt-1 text-xl font-semibold">
            {formatDuration(plannedTotalMs)}
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">完成率</p>
          <div className="mt-1 text-xl font-semibold">
            {formatPercent(completionRate)}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground text-xs">正确率</p>
          <div className="mt-1 text-xl font-semibold">
            {formatPercent(accuracyRate)}
          </div>
        </div>
        <div className="text-muted-foreground text-sm">
          正确 {counts.correct} · 错误 {counts.wrong} · 跳过 {counts.skip} ·
          未做 {counts.unanswered}
        </div>
      </div>
    </CardContent>
  </Card>
);
