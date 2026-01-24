import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PracticeAnswerSheet } from '@/features/practice/components/PracticeAnswerSheet';
import { PracticeConfigDialog } from '@/features/practice/components/PracticeConfigDialog';
import { PracticeEndDialog } from '@/features/practice/components/PracticeEndDialog';
import { PracticePaceCard } from '@/features/practice/components/PracticePaceCard';
import { PracticeRestoreBanner } from '@/features/practice/components/PracticeRestoreBanner';
import { PracticeTimerPanel } from '@/features/practice/components/PracticeTimerPanel';
import { usePracticeSession } from '@/features/practice/hooks/usePracticeSession';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import { formatDateTime } from '@/utils/time';
import { useSessionQuestionTimes, useSessionStartedAt, useSessionEndDialogShown } from '@/store/selectors';
import type { Session, SessionItem, QuestionRecord } from '@/types';

const PracticePage = () => {
  const {
    mode,
    status,
    timers,
    isPaused,
    isRunning,
    canPause,
    canNavigate,
    isLocked,
    templates,
    activeTemplate,
    orderedItems,
    activeIndex,
    currentItem,
    skips,
    skippedTypeIds,
    hasItems,
    plannedMs,
    actualMs,
    progressValue,
    isOvertime,
    totalQuestions,
    currentQuestion,
    questionGrid,
    canGoPrev,
    canGoNext,
    handleStart,
    handlePrevQuestion,
    handleNextQuestion,
    handleSelectQuestion,
    handleSkip,
    handleJumpType,
    handleEnd,
    actions,
  } = usePracticeSession();
  const navigate = useNavigate();
  const questionTimes = useSessionQuestionTimes();
  const startedAt = useSessionStartedAt();
  const endDialogShown = useSessionEndDialogShown();
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const { activeSessionId } = usePracticeSession();
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const shouldInitializeRestore = status === 'running' && timers.totalMs > 0;
  const [hasRestorePrompt, setHasRestorePrompt] = useState(
    shouldInitializeRestore
  );

  const showRestore =
    hasRestorePrompt &&
    status === 'running' &&
    timers.totalMs > 0 &&
    !restoreDismissed;

  const handleResetSession = () => {
    actions.reset();
    setHasRestorePrompt(false);
    setRestoreDismissed(true);
  };

  // 当练习结束时自动弹出命名弹窗（只在未显示过时弹出）
  useEffect(() => {
    if (status === 'ended' && !endDialogShown) {
      queueMicrotask(() => setEndDialogOpen(true));
    }
  }, [status, endDialogShown]);

  // 监听空格键触发下一题
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在练习进行中且可以导航时响应
      if (!isRunning || !canNavigate) return;

      // 如果焦点在输入框或弹窗中，不响应
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        configOpen ||
        endDialogOpen
      ) {
        return;
      }

      // 空格键触发下一题
      if (e.code === 'Space' && canGoNext) {
        e.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, canNavigate, canGoNext, configOpen, endDialogOpen, handleNextQuestion]);

  const generateDefaultName = () => {
    const activeTemplateName = activeTemplate?.name ?? '练习';
    const now = new Date();
    return `${activeTemplateName} - ${formatDateTime(now.toISOString())}`;
  };

  const ensureSessionSaved = async (name?: string) => {
    if (activeSessionId) return activeSessionId;
    if (!activeTemplate || orderedItems.length === 0) return null;

    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();
    const startedAtMs =
      typeof startedAt === 'number' ? startedAt : Date.now() - timers.totalMs;

    const sessionName = name ?? generateDefaultName();

    const session: Session = {
      id: sessionId,
      name: sessionName,
      mode,
      templateId: activeTemplate.id,
      customOrder: orderedItems.map(item => item.id),
      status: 'ended', // 或 'reviewing'，取决于是否要区分
      startedAt: new Date(startedAtMs).toISOString(),
      endedAt: now,
      totalTimeMs: timers.totalMs,
      pausedCount: 0,
    };

    const sessionItems: SessionItem[] = orderedItems.map((item, index) => ({
      id: crypto.randomUUID(),
      sessionId,
      templateItemId: item.id,
      actualTimeMs: 0,
      plannedTime: item.plannedTime * 60_000,
      questionCount: item.questionCount,
      overtimeCount: 0,
      orderIndex: index,
    }));

    const sessionItemMap = new Map<number, SessionItem>();
    sessionItems.forEach((item, index) => {
      sessionItemMap.set(index, item);
    });

    const plannedPerQuestionMap = new Map<number, number>();
    orderedItems.forEach((item, index) => {
      const plannedMs = item.plannedTime * 60_000;
      const perQuestion =
        item.questionCount > 0
          ? Math.round(plannedMs / item.questionCount)
          : 0;
      plannedPerQuestionMap.set(index, perQuestion);
    });

    const typeActualTime = new Map<number, number>();
    questionGrid.forEach(item => {
      const timeMs = questionTimes[item.number] ?? 0;
      typeActualTime.set(
        item.typeIndex,
        (typeActualTime.get(item.typeIndex) ?? 0) + timeMs
      );
    });

    sessionItems.forEach(item => {
      const timeMs = typeActualTime.get(item.orderIndex) ?? 0;
      item.actualTimeMs = timeMs;
    });

    const records: QuestionRecord[] = questionGrid.map(item => {
      const sessionItem = sessionItemMap.get(item.typeIndex);
      return {
        id: crypto.randomUUID(),
        sessionId,
        sessionItemId: sessionItem?.id ?? '',
        questionIndex: item.number,
        actualTimeMs: questionTimes[item.number] ?? 0,
        plannedTime: plannedPerQuestionMap.get(item.typeIndex) ?? 0,
        status: 'unanswered',
      };
    });

    await sessionRepo.createSession(session, sessionItems);
    await sessionRepo.appendQuestionRecords(records);
    actions.setActiveSessionId(sessionId);
    return sessionId;
  };

  const handleSaveSession = async (name: string) => {
    try {
      const sessionId = await ensureSessionSaved(name);
      if (sessionId) {
        // 如果已存在 ID（即 Draft 转正），这里应当更新名字？
        // 简单起见，ensureSessionSaved 若 id 存在直接返回。
        // 若需支持改名，可在此调用 sessionRepo.updateSession(sessionId, { name })。
        // 按目前逻辑，ensureSessionSaved 只负责确保有记录。
        // 如果是弹窗主动保存，我们希望更新名字。
        if (activeSessionId) {
          await sessionRepo.updateSession(activeSessionId, { name });
        }

        setEndDialogOpen(false);
        actions.markEndDialogShown();
        toast.success('练习记录已保存');
        return sessionId;
      }
      return null;
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请稍后重试');
      return null;
    }
  };

  const handleGoReview = async () => {
    if (!activeSessionId) {
      // 没 ID 则创建 Draft
      const id = await ensureSessionSaved();
      if (id) {
        navigate(`/review/${id}`);
      } else {
        toast.error('无法进入复盘，请检查数据');
      }
    } else {
      // 有 ID 直接进
      navigate(`/review/${activeSessionId}`);
    }
  };

  const handleCancelSave = () => {
    setEndDialogOpen(false);
    actions.markEndDialogShown();
  };

  // 页面只做布局与拼装，业务逻辑集中在 features。
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">练习计时</h1>
          <p className="text-muted-foreground text-sm">
            当前模式：{mode === 'practice' ? '练习' : '模拟'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {activeTemplate?.name ?? '未选择模板'}
          </Badge>
          <PracticeConfigDialog
            mode={mode}
            isRunning={isRunning}
            isLocked={isLocked}
            templates={templates}
            activeTemplateId={activeTemplate?.id}
            orderedItems={orderedItems}
            activeIndex={activeIndex}
            skippedTypeIds={skippedTypeIds}
            canNavigate={canNavigate}
            open={configOpen}
            onOpenChange={setConfigOpen}
            onModeChange={actions.setMode}
            onTemplateChange={actions.setTemplate}
            onOrderChange={actions.setOrder}
            onJumpTo={handleJumpType}
          />
        </div>
      </div>

      {showRestore && (
        <PracticeRestoreBanner
          mode={mode}
          onDismiss={() => {
            actions.resume();
            setHasRestorePrompt(false);
            setRestoreDismissed(true);
          }}
          onReset={handleResetSession}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <PracticeTimerPanel
          timers={timers}
          status={status}
          isPaused={isPaused}
          isRunning={isRunning}
          canPause={canPause}
          canNavigate={canNavigate}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          hasItems={hasItems}
          onStart={handleStart}
          onPauseToggle={() => (isPaused ? actions.resume() : actions.pause())}
          onEnd={handleEnd}
          onPrevQuestion={handlePrevQuestion}
          onNextQuestion={handleNextQuestion}
          onSkip={handleSkip}
          onOpenConfig={() => setConfigOpen(true)}
          answerSheet={
            <PracticeAnswerSheet
              questionGrid={questionGrid}
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
              orderedItems={orderedItems}
              activeIndex={activeIndex}
              skips={skips}
              questionTimes={questionTimes}
              hasItems={hasItems}
              isRunning={isRunning}
              onSelectQuestion={handleSelectQuestion}
              onJumpType={actions.jumpTo}
            />
          }
          reviewAction={
            status === 'ended' ? (
              <Button
                variant="outline"
                onClick={handleGoReview}
              >
                {activeSessionId ? '补录复盘' : '去复盘'}
              </Button>
            ) : null
          }
        />

        <PracticePaceCard
          currentItem={currentItem}
          activeIndex={activeIndex}
          totalTypes={orderedItems.length}
          plannedMs={plannedMs}
          actualMs={actualMs}
          progressValue={progressValue}
          isOvertime={isOvertime}
        />
      </div>

      <PracticeEndDialog
        open={endDialogOpen}
        defaultName={generateDefaultName()}
        onSave={handleSaveSession}
        onCancel={handleCancelSave}
      />
    </div>
  );
};


export default PracticePage;
