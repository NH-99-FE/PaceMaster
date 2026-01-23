import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight, Minus } from 'lucide-react';
import type { QuestionStatus } from '@/types';

const STATUS_OPTIONS: Array<{
  value: QuestionStatus;
  label: string;
  icon: React.ReactNode;
  className: string;
}> = [
  {
    value: 'correct',
    label: '正确',
    icon: <Check className="h-4 w-4" />,
    className: 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10',
  },
  {
    value: 'wrong',
    label: '错误',
    icon: <X className="h-4 w-4" />,
    className: 'border-rose-500/40 text-rose-600 bg-rose-500/10',
  },
  {
    value: 'skip',
    label: '跳过',
    icon: <ArrowRight className="h-4 w-4" />,
    className: 'border-amber-500/40 text-amber-600 bg-amber-500/10',
  },
  {
    value: 'unanswered',
    label: '未做',
    icon: <Minus className="h-4 w-4" />,
    className: 'border-border text-muted-foreground bg-muted/40',
  },
];

type ReviewStatusPickerProps = {
  activeStatus: QuestionStatus;
  counts: Record<QuestionStatus, number>;
  onChange: (status: QuestionStatus) => void;
};

export const ReviewStatusPicker = ({
  activeStatus,
  counts,
  onChange,
}: ReviewStatusPickerProps) => (
  <div className="space-y-2">
    <p className="text-sm font-medium">题号标注</p>
    <div className="grid gap-2 sm:grid-cols-2">
      {STATUS_OPTIONS.map(option => {
        const isActive = activeStatus === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors',
              option.className,
              isActive ? 'ring-primary/50 ring-2' : 'hover:border-primary/40',
            ].join(' ')}
          >
            <span className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </span>
            <Badge variant="secondary">{counts[option.value]}</Badge>
          </button>
        );
      })}
    </div>
  </div>
);
