import { useMemo } from 'react';
import type { QuestionStatus } from '@/types';
import type { ReviewQuestion } from '@/features/review/hooks/useReviewSession';
import { formatDuration } from '@/utils/time';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowRight, Minus, PenTool } from 'lucide-react';

const STATUS_CONFIG = {
  correct: {
    label: '正确',
    icon: Check,
    className: 'text-emerald-600',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20',
  },
  wrong: {
    label: '错误',
    icon: X,
    className: 'text-rose-600',
    bgClass: 'bg-rose-500/10 hover:bg-rose-500/20',
  },
  skip: {
    label: '跳过',
    icon: ArrowRight,
    className: 'text-amber-600',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20',
  },
  unanswered: {
    label: '未做',
    icon: Minus,
    className: 'text-muted-foreground',
    bgClass: 'bg-muted hover:bg-muted/80',
  },
} as const;

const getStatusClass = (status: QuestionStatus) => {
  switch (status) {
    case 'correct':
      return 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600 hover:border-emerald-500/70 hover:bg-emerald-500/25';
    case 'wrong':
      return 'border-rose-500/50 bg-rose-500/15 text-rose-600 hover:border-rose-500/70 hover:bg-rose-500/25';
    case 'skip':
      return 'border-amber-500/50 bg-amber-500/15 text-amber-600 hover:border-amber-500/70 hover:bg-amber-500/25';
    default:
      return 'border-border text-foreground hover:border-primary/50 hover:bg-primary/5';
  }
};

type ReviewQuestionGridProps = {
  questionGrid: ReviewQuestion[];
  questionStatus: Record<number, QuestionStatus>;
  questionTimes?: Record<number, number>;
  onApplyStatus: (questionNumber: number) => void;
  onMarkBatch?: (typeIndex: number, status: QuestionStatus) => void;
  activeStatus?: QuestionStatus;
  onActiveStatusChange?: (status: QuestionStatus) => void;
};

export const ReviewQuestionGrid = ({
  questionGrid,
  questionStatus,
  questionTimes,
  onApplyStatus,
  onMarkBatch,
  activeStatus,
  onActiveStatusChange,
}: ReviewQuestionGridProps) => {
  // 按题型分组
  const groupedQuestions = useMemo(() => {
    const groups: Array<{
      label: string;
      typeIndex: number; // Add typeIndex to group
      questions: ReviewQuestion[];
    }> = [];

    let currentLabel = '';
    let currentTypeIndex = -1;
    let currentGroup: ReviewQuestion[] = [];

    questionGrid.forEach(item => {
      if (item.label !== currentLabel) {
        if (currentGroup.length > 0) {
          groups.push({
            label: currentLabel,
            typeIndex: currentTypeIndex,
            questions: currentGroup,
          });
        }
        currentLabel = item.label;
        currentTypeIndex = item.typeIndex;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        label: currentLabel,
        typeIndex: currentTypeIndex,
        questions: currentGroup,
      });
    }

    return groups;
  }, [questionGrid]);

  return (
    <div className="space-y-4">
      {groupedQuestions.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              {group.label}
              {activeStatus && onActiveStatusChange && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-6 gap-1 px-2 text-xs font-normal",
                        STATUS_CONFIG[activeStatus].className,
                        STATUS_CONFIG[activeStatus].bgClass
                      )}
                    >
                      <PenTool className="h-3 w-3" />
                      <span>{STATUS_CONFIG[activeStatus].label}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-1" align="start">
                    <div className="flex flex-col gap-1">
                      {(Object.keys(STATUS_CONFIG) as QuestionStatus[]).map(
                        (status) => {
                          const config = STATUS_CONFIG[status];
                          const Icon = config.icon;
                          return (
                            <button
                              key={status}
                              onClick={() => onActiveStatusChange(status)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors",
                                activeStatus === status
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Icon className={cn("h-3.5 w-3.5", config.className)} />
                              <span>{config.label}</span>
                              {activeStatus === status && (
                                <Check className="ml-auto h-3 w-3 opacity-50" />
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {onMarkBatch && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onMarkBatch(group.typeIndex, 'correct')}
                  className="text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  一键正确
                </button>
                <button
                  type="button"
                  onClick={() => onMarkBatch(group.typeIndex, 'unanswered')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  一键清空
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {group.questions.map(item => {
              const status = questionStatus[item.number] ?? 'unanswered';
              const timeMs = questionTimes?.[item.number];
              const hasTime = timeMs !== undefined && timeMs > 0;
              const seconds = hasTime ? Math.round(timeMs / 1000) : 0;

              return (
                <button
                  key={`review-q-${item.number}`}
                  type="button"
                  onClick={() => onApplyStatus(item.number)}
                  className={cn(
                    'flex h-12 flex-col items-center justify-center rounded border py-1 text-xs transition-colors',
                    getStatusClass(status)
                  )}
                  title={`${item.label} · 第 ${item.number} 题${hasTime ? ` · ${formatDuration(timeMs)}` : ''}`}
                >
                  <span className="font-medium">{item.number}</span>
                  <span className="text-muted-foreground mt-0.5 text-[10px] leading-none opacity-80">
                    {hasTime ? `${seconds}s` : '--'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
