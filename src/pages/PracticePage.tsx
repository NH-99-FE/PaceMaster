import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PracticeAnswerSheet } from '@/features/practice/components/PracticeAnswerSheet';
import { PracticeConfigDialog } from '@/features/practice/components/PracticeConfigDialog';
import { PracticePaceCard } from '@/features/practice/components/PracticePaceCard';
import { PracticeRestoreBanner } from '@/features/practice/components/PracticeRestoreBanner';
import { PracticeTimerPanel } from '@/features/practice/components/PracticeTimerPanel';
import { usePracticeSession } from '@/features/practice/hooks/usePracticeSession';

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
  const [restoreDismissed, setRestoreDismissed] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
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
              hasItems={hasItems}
              onSelectQuestion={handleSelectQuestion}
              onJumpType={actions.jumpTo}
            />
          }
          reviewAction={
            status === 'ended' ? (
              <Button variant="outline" onClick={() => navigate('/review')}>
                去复盘
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
    </div>
  );
};

export default PracticePage;
