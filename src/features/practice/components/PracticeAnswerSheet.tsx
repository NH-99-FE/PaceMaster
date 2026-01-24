import { useMemo, useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
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
  questionTimes: Record<number, number>;
  hasItems: boolean;
  isRunning: boolean;
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
  questionTimes,
  hasItems,
  isRunning,
  onSelectQuestion,
  onJumpType,
}: PracticeAnswerSheetProps) => {
  const [open, setOpen] = useState(false);

  // 根据题号跳过状态计算题型标记。
  const skippedSet = new Set(skips);
  const skippedTypeIds = new Set<string>();
  questionGrid.forEach(item => {
    if (skippedSet.has(item.number)) {
      skippedTypeIds.add(item.templateItemId);
    }
  });

  const handleSelectQuestion = (questionNumber: number) => {
    onSelectQuestion(questionNumber);
    // 只在计时过程中自动关闭抽屉
    if (isRunning) {
      setOpen(false);
    }
  };

  const handleJumpType = (index: number) => {
    onJumpType(index);
    // 只在计时过程中自动关闭抽屉
    if (isRunning) {
      setOpen(false);
    }
  };

  // 按题型分组
  const groupedQuestions = useMemo(() => {
    const groups: Array<{
      label: string;
      questions: QuestionGridItem[];
    }> = [];

    let currentLabel = '';
    let currentGroup: QuestionGridItem[] = [];

    questionGrid.forEach(item => {
      if (item.label !== currentLabel) {
        if (currentGroup.length > 0) {
          groups.push({ label: currentLabel, questions: currentGroup });
        }
        currentLabel = item.label;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ label: currentLabel, questions: currentGroup });
    }

    return groups;
  }, [questionGrid]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
            <div className="space-y-4">
              {groupedQuestions.map((group, groupIndex) => (
                <div key={`group-${groupIndex}`} className="space-y-2">
                  <div className="text-muted-foreground text-xs font-medium">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                    {group.questions.map(item => {
                      const isSelected = currentQuestion === item.number;
                      const isSkipped = skippedSet.has(item.number);
                      const hasAnswered = (questionTimes[item.number] ?? 0) > 0;
                      // 只高亮当前题号，其余题号保持轻量状态提示。
                      return (
                        <button
                          key={`q-${item.number}`}
                          type="button"
                          onClick={() => handleSelectQuestion(item.number)}
                          className={[
                            'relative flex h-8 items-center justify-center rounded border text-xs transition-colors',
                            'border-border text-foreground hover:border-muted-foreground/40 hover:bg-muted/30',
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary ring-primary/60 ring-2'
                              : '',
                            isSkipped ? 'opacity-70' : '',
                          ].join(' ')}
                          title={`${item.label} · 第 ${item.number} 题${isSkipped ? ' · 已跳过' : hasAnswered ? ' · 已作答' : ''}`}
                        >
                          {item.number}
                          {!isSelected && (
                            <>
                              {isSkipped ? (
                                <AlertCircle className="text-accent absolute top-0.5 right-0.5 h-3 w-3 stroke-[2.5]" />
                              ) : hasAnswered ? (
                                <Check className="text-primary absolute top-0.5 right-0.5 h-3 w-3 stroke-[3]" />
                              ) : null}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {orderedItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleJumpType(index)}
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
