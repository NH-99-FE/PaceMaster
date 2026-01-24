import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ReviewQuestionGrid } from '@/features/review/components/ReviewQuestionGrid';
import { ReviewInsights } from '@/features/review/components/ReviewInsights';
import { ReviewStatusPicker } from '@/features/review/components/ReviewStatusPicker';
import { ReviewSummary } from '@/features/review/components/ReviewSummary';
import { ReviewTimeAnalysisDialog } from '@/features/review/components/ReviewTimeAnalysisDialog';
import { useRecordDetail } from '@/features/records/hooks/useRecordDetail';
import { useTemplates } from '@/store/selectors';
import { formatDateTime } from '@/utils/time';

const RecordDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    state,
    isLoading,
    isSaving,
    isDeleting,
    counts,
    accuracyRate,
    completionRate,
    activeStatus,
    setActiveStatus,
    applyActiveStatus,
    markBatch,
    saveChanges,
    deleteRecord,
  } = useRecordDetail(id);
  const templates = useTemplates();
  const templateName = useMemo(() => {
    if (!state.session) return '未命名模板';
    return (
      templates.find(tpl => tpl.id === state.session?.templateId)?.name ??
      '未命名模板'
    );
  }, [templates, state.session]);

  const totalQuestions = state.questionGrid.length;
  const plannedTotalMs = useMemo(
    () =>
      state.orderedItems.reduce(
        (sum, item) => sum + item.plannedTime * 60_000,
        0
      ),
    [state.orderedItems]
  );

  const moduleTimeData = useMemo(() => {
    const itemMap = new Map(
      state.sessionItems.map(item => [item.templateItemId, item])
    );
    return state.orderedItems.map(item => {
      const sessionItem = itemMap.get(item.id);
      return {
        id: item.id,
        name: item.label,
        actualMs: sessionItem?.actualTimeMs ?? 0,
        plannedMs: item.plannedTime * 60_000,
      };
    });
  }, [state.orderedItems, state.sessionItems]);

  const questionTimeData = useMemo(() => {
    const timeMap = new Map(
      state.questionRecords.map(record => [
        record.questionIndex,
        record.actualTimeMs,
      ])
    );
    const plannedMap = new Map(
      state.orderedItems.map(item => [
        item.id,
        item.questionCount > 0
          ? Math.round((item.plannedTime * 60_000) / item.questionCount)
          : 0,
      ])
    );
    return state.questionGrid.map(item => ({
      number: item.number,
      actualMs: timeMap.get(item.number) ?? 0,
      plannedMs: plannedMap.get(item.templateItemId) ?? 0,
      label: item.label,
    }));
  }, [state.questionGrid, state.questionRecords, state.orderedItems]);

  const questionTimeMap = useMemo(() => {
    const timeMap: Record<number, number> = {};
    state.questionRecords.forEach(record => {
      timeMap[record.questionIndex] = record.actualTimeMs;
    });
    return timeMap;
  }, [state.questionRecords]);

  if (!id) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
        缺少记录编号。
      </div>
    );
  }

  if (isLoading && !state.session) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
        记录加载中...
      </div>
    );
  }

  if (!isLoading && !state.session) {
    return (
      <div className="border-border bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
        未找到该记录。
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/records')}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">复盘详情</h1>
            {state.session?.name && (
              <span className="text-muted-foreground text-sm font-normal">
                · {state.session.name}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {state.session?.endedAt
              ? formatDateTime(state.session.endedAt)
              : '未记录时间'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{templateName}</Badge>
          {state.session && (
            <Badge
              variant={
                state.session.mode === 'practice' ? 'secondary' : 'outline'
              }
            >
              {state.session.mode === 'practice' ? '练习' : '模拟'}
            </Badge>
          )}
          <Button variant="outline" onClick={() => navigate('/records')}>
            返回
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeleting || !state.session}
                className="relative"
              >
                <span className={isDeleting ? 'opacity-0' : ''}>删除</span>
                {isDeleting && (
                  <Loader2 className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除复盘记录？</AlertDialogTitle>
                <AlertDialogDescription>
                  删除后将移除该次复盘的题号状态与记录数据，且无法恢复。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      const ok = await deleteRecord();
                      if (ok) {
                        toast.success('记录已删除');
                        navigate('/records');
                      } else {
                        toast.error('删除失败，请稍后重试');
                      }
                    } catch {
                      toast.error('删除失败，请稍后重试');
                    }
                  }}
                >
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            onClick={async () => {
              try {
                const ok = await saveChanges();
                if (ok) {
                  toast.success('修改已保存');
                } else {
                  toast.error('保存失败，请稍后重试');
                }
              } catch {
                toast.error('保存失败，请稍后重试');
              }
            }}
            disabled={isSaving || !state.session}
            className="relative"
          >
            <span className={isSaving ? 'opacity-0' : ''}>保存</span>
            {isSaving && (
              <Loader2 className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            )}
          </Button>
        </div>
      </div>

      {state.session && (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <ReviewSummary
              totalQuestions={totalQuestions}
              plannedTotalMs={plannedTotalMs}
              totalMs={state.session.totalTimeMs}
              counts={counts}
              accuracyRate={accuracyRate}
              completionRate={completionRate}
              action={
                <ReviewTimeAnalysisDialog
                  moduleData={moduleTimeData}
                  questionData={questionTimeData}
                />
              }
            />

            <div className="border-border bg-card rounded-lg border p-4 shadow-none">
              <ReviewStatusPicker
                activeStatus={activeStatus}
                counts={counts}
                onChange={setActiveStatus}
              />
              <div className="text-muted-foreground mt-4 text-xs">
                选择状态后点击题号即可更新记录。
              </div>
            </div>
          </div>

          <ReviewInsights
            orderedItems={state.orderedItems}
            sessionItems={state.sessionItems}
            questionGrid={state.questionGrid}
            questionStatus={state.questionStatus}
            questionRecords={state.questionRecords}
          />
        </>
      )}

      <div className="border-border bg-card rounded-lg border p-4 shadow-none">
        <ReviewQuestionGrid
          questionGrid={state.questionGrid}
          questionStatus={state.questionStatus}
          questionTimes={questionTimeMap}
          onApplyStatus={applyActiveStatus}
          onMarkBatch={markBatch}
        />
      </div>
    </div>
  );
};

export default RecordDetailPage;
