import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReviewQuestionGrid } from '@/features/review/components/ReviewQuestionGrid';
import { ReviewStatusPicker } from '@/features/review/components/ReviewStatusPicker';
import { ReviewSummary } from '@/features/review/components/ReviewSummary';
import { useReviewSession } from '@/features/review/hooks/useReviewSession';

const ReviewPage = () => {
  const navigate = useNavigate();
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const {
    mode,
    activeTemplate,
    questionGrid,
    totalQuestions,
    plannedTotalMs,
    timers,
    questionTimes,
    questionStatus,
    counts,
    accuracyRate,
    completionRate,
    activeStatus,
    isSaving,
    setActiveStatus,
    applyActiveStatus,
    markAllCorrect,
    clearAll,
    saveReview,
  } = useReviewSession();

  const handleSave = async () => {
    try {
      const sessionId = await saveReview();
      if (sessionId) {
        setSavedSessionId(sessionId);
        toast.success('复盘已保存');
      } else {
        toast.error('保存失败，请检查题目与模板设置');
      }
    } catch {
      toast.error('保存失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">复盘补录</h1>
          <p className="text-muted-foreground text-sm">
            当前模式：{mode === 'practice' ? '练习' : '模拟'} · 题目数{' '}
            {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {activeTemplate?.name ?? '未选择模板'}
          </Badge>
          <Button variant="outline" onClick={() => navigate('/practice')}>
            返回练习
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || totalQuestions === 0 || !!savedSessionId}
            className="relative"
          >
            <span className={isSaving ? 'opacity-0' : ''}>
              {savedSessionId ? '已保存' : '保存复盘'}
            </span>
            {isSaving && (
              <Loader2 className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <ReviewSummary
          totalQuestions={totalQuestions}
          plannedTotalMs={plannedTotalMs}
          totalMs={timers.totalMs}
          counts={counts}
          accuracyRate={accuracyRate}
          completionRate={completionRate}
        />

        <div className="border-border bg-card rounded-lg border p-4 shadow-none">
          <ReviewStatusPicker
            activeStatus={activeStatus}
            counts={counts}
            onChange={setActiveStatus}
          />
          <div className="text-muted-foreground mt-4 text-xs">
            选择状态后点击题号即可批量补录。
          </div>
        </div>
      </div>

      <div className="border-border bg-card rounded-lg border p-4 shadow-none">
        <ReviewQuestionGrid
          questionGrid={questionGrid}
          questionStatus={questionStatus}
          questionTimes={questionTimes}
          onApplyStatus={applyActiveStatus}
          onMarkAllCorrect={markAllCorrect}
          onClearAll={clearAll}
        />
      </div>
    </div>
  );
};

export default ReviewPage;
