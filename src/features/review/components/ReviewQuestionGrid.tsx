import type { QuestionStatus } from '@/types';
import type { ReviewQuestion } from '@/features/review/hooks/useReviewSession';

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
  onApplyStatus: (questionNumber: number) => void;
};

export const ReviewQuestionGrid = ({
  questionGrid,
  questionStatus,
  onApplyStatus,
}: ReviewQuestionGridProps) => (
  <div className="space-y-2">
    <p className="text-sm font-medium">题目网格</p>
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
      {questionGrid.map(item => {
        const status = questionStatus[item.number] ?? 'unanswered';
        return (
          <button
            key={`review-q-${item.number}`}
            type="button"
            onClick={() => onApplyStatus(item.number)}
            className={[
              'flex h-9 items-center justify-center rounded border text-xs transition-colors',
              'hover:border-primary/50 hover:bg-primary/5',
              getStatusClass(status),
            ].join(' ')}
            title={`${item.label} · 第 ${item.number} 题`}
          >
            {item.number}
          </button>
        );
      })}
    </div>
  </div>
);
