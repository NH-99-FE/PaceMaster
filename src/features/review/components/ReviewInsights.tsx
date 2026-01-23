import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDuration } from '@/utils/time';
import type { PracticeItem } from '@/features/practice/types';
import type { QuestionRecord, QuestionStatus, SessionItem } from '@/types';

type ReviewInsightsProps = {
  orderedItems: PracticeItem[];
  sessionItems: SessionItem[];
  questionGrid: Array<{
    number: number;
    typeIndex: number;
    label: string;
    templateItemId: string;
  }>;
  questionStatus: Record<number, QuestionStatus>;
  questionRecords: QuestionRecord[];
};

const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

export const ReviewInsights = ({
  orderedItems,
  sessionItems,
  questionGrid,
  questionStatus,
  questionRecords,
}: ReviewInsightsProps) => {
  const wrongByType = useMemo(() => {
    const base = orderedItems.map(item => ({
      id: item.id,
      label: item.label,
      total: item.questionCount,
      wrong: 0,
    }));
    const map = new Map(base.map(item => [item.id, item]));
    questionGrid.forEach(item => {
      const status = questionStatus[item.number] ?? 'unanswered';
      if (status !== 'wrong') return;
      const target = map.get(item.templateItemId);
      if (target) {
        target.wrong += 1;
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.wrong - a.wrong)
      .slice(0, 3);
  }, [orderedItems, questionGrid, questionStatus]);

  const slowTypes = useMemo(() => {
    const sessionMap = new Map(
      sessionItems.map(item => [item.templateItemId, item])
    );
    return orderedItems
      .map(item => {
        const plannedMs = item.plannedTime * 60_000;
        const actualMs = sessionMap.get(item.id)?.actualTimeMs ?? 0;
        return {
          id: item.id,
          label: item.label,
          plannedMs,
          actualMs,
          ratio: plannedMs > 0 ? actualMs / plannedMs : 0,
        };
      })
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 3);
  }, [orderedItems, sessionItems]);

  const slowQuestions = useMemo(() => {
    const timeMap = new Map(
      questionRecords.map(record => [record.questionIndex, record.actualTimeMs])
    );
    return questionGrid
      .map(item => ({
        number: item.number,
        label: item.label,
        actualMs: timeMap.get(item.number) ?? 0,
      }))
      .sort((a, b) => b.actualMs - a.actualMs)
      .slice(0, 5);
  }, [questionGrid, questionRecords]);

  const hasSlowQuestion = slowQuestions.some(item => item.actualMs > 0);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>复盘洞察</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="border-border/60 bg-muted/20 rounded-lg border p-3">
            <div className="text-sm font-medium">错题最多模块</div>
            <p className="text-muted-foreground mt-1 text-xs">
              统计错误题数，关注薄弱环节。
            </p>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              {wrongByType.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground text-xs">
                    错 {item.wrong} / {item.total}
                  </span>
                </div>
              ))}
              {wrongByType.length === 0 && (
                <div className="text-muted-foreground text-xs">暂无数据</div>
              )}
            </div>
          </div>

          <div className="border-border/60 bg-muted/20 rounded-lg border p-3">
            <div className="text-sm font-medium">偏慢模块</div>
            <p className="text-muted-foreground mt-1 text-xs">
              实际用时 / 计划用时，建议优先优化。
            </p>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              {slowTypes.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.plannedMs > 0
                      ? `${formatPercent(item.ratio)} · ${formatDuration(
                          item.actualMs
                        )}`
                      : '未设定计划'}
                  </span>
                </div>
              ))}
              {slowTypes.length === 0 && (
                <div className="text-muted-foreground text-xs">暂无数据</div>
              )}
            </div>
          </div>

          <div className="border-border/60 bg-muted/20 rounded-lg border p-3">
            <div className="text-sm font-medium">耗时最长题目</div>
            <p className="text-muted-foreground mt-1 text-xs">
              关注耗时高题目，优化解题节奏。
            </p>
            <Separator className="my-3" />
            <div className="space-y-2 text-sm">
              {hasSlowQuestion ? (
                slowQuestions.map(item => (
                  <div
                    key={item.number}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">
                      第 {item.number} 题 · {item.label}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDuration(item.actualMs)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs">
                  暂无题目用时记录
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
