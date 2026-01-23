import type { QuestionStatus } from '@/types';
import type { ReviewQuestion } from '@/features/review/hooks/useReviewSession';
import { formatDuration } from '@/utils/time';

const getStatusClass = (status: QuestionStatus) => {
  switch (status) {
    case 'correct':
      return 'border-emerald-500/50 bg-emerald-500/15 text-emerald-600';
    case 'wrong':
      return 'border-rose-500/50 bg-rose-500/15 text-rose-600';
    case 'skip':
      return 'border-amber-500/50 bg-amber-500/15 text-amber-600';
    default:
      return 'border-border text-foreground';
  }
};

type ReviewQuestionGridProps = {
  questionGrid: ReviewQuestion[];
  questionStatus: Record<number, QuestionStatus>;
  questionTimes?: Record<number, number>;
  onApplyStatus: (questionNumber: number) => void;
  onMarkAllCorrect?: () => void;
  onClearAll?: () => void;
};

export const ReviewQuestionGrid = ({
  questionGrid,
  questionStatus,
  questionTimes,
  onApplyStatus,
  onMarkAllCorrect,
  onClearAll,
}: ReviewQuestionGridProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium">题目网格</p>
      {(onMarkAllCorrect || onClearAll) && (
        <div className="flex gap-2">
          {onMarkAllCorrect && (
            <button
              type="button"
              onClick={onMarkAllCorrect}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs transition-colors"
            >
              一键正确
            </button>
          )}
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              一键清空
            </button>
          )}
        </div>
      )}
    </div>
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
      {questionGrid.map(item => {
        const status = questionStatus[item.number] ?? 'unanswered';
        const timeMs = questionTimes?.[item.number];
        const hasTime = timeMs !== undefined && timeMs > 0;
        const seconds = hasTime ? Math.round(timeMs / 1000) : 0;

        return (
          <button
            key={`review-q-${item.number}`}
            type="button"
            onClick={() => onApplyStatus(item.number)}
            className={[
              'flex h-12 flex-col items-center justify-center rounded border py-1 text-xs transition-colors',
              'hover:border-primary/50 hover:bg-primary/5',
              getStatusClass(status),
            ].join(' ')}
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
);
