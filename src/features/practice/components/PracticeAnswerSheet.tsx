import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { PracticeItem, QuestionGridItem } from '@/features/practice/types';

type PracticeAnswerSheetProps = {
  questionGrid: QuestionGridItem[];
  currentQuestion: number;
  totalQuestions: number;
  orderedItems: PracticeItem[];
  activeIndex: number;
  skips: number[];
  hasItems: boolean;
  onSelectQuestion: (questionNumber: number) => void;
  onJumpType: (index: number) => void;
};

export const PracticeAnswerSheet = ({
  questionGrid,
  currentQuestion,
  totalQuestions,
  orderedItems,
  activeIndex,
  skips,
  hasItems,
  onSelectQuestion,
  onJumpType,
}: PracticeAnswerSheetProps) => {
  // 根据题号跳过状态计算题型标记。
  const skippedSet = new Set(skips);
  const skippedTypeIds = new Set<string>();
  questionGrid.forEach(item => {
    if (skippedSet.has(item.number)) {
      skippedTypeIds.add(item.templateItemId);
    }
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" disabled={!hasItems}>
          答题卡
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>答题卡</SheetTitle>
          <SheetDescription>
            点击题号可快速跳转（当前题号 {currentQuestion || '-'} / 共{' '}
            {totalQuestions} 题）
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">题目网格</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
              {questionGrid.map(item => {
                const isSelected = currentQuestion === item.number;
                const isSkipped = skippedSet.has(item.number);
                // 只高亮当前题号，其余题号保持轻量状态提示。
                return (
                  <button
                    key={`q-${item.number}`}
                    type="button"
                    onClick={() => onSelectQuestion(item.number)}
                    className={[
                      'flex h-8 items-center justify-center rounded border text-xs transition-colors',
                      'border-border text-foreground hover:border-muted-foreground/40 hover:bg-muted/30',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-primary/60 ring-2'
                        : '',
                      isSkipped ? 'opacity-70' : '',
                    ].join(' ')}
                    title={`${item.label} · 第 ${item.number} 题`}
                  >
                    {item.number}
                  </button>
                );
              })}
            </div>
          </div>

          {orderedItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onJumpType(index)}
              className={[
                'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
                index === activeIndex
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30',
              ].join(' ')}
            >
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="text-muted-foreground mt-1 flex flex-wrap gap-2 text-xs">
                  <Badge variant="secondary">{item.questionCount}题</Badge>
                  <Badge variant="outline">{item.plannedTime}分钟</Badge>
                  {skippedTypeIds.has(item.id) && (
                    <Badge variant="outline">有跳过</Badge>
                  )}
                </div>
              </div>
              <span className="text-muted-foreground text-xs">
                {index + 1}/{orderedItems.length}
              </span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
