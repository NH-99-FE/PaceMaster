import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SessionStatus, SessionTimers } from '@/types';
import { formatDuration } from '@/utils/time';

type PracticeTimerPanelProps = {
  timers: SessionTimers;
  status: SessionStatus;
  isPaused: boolean;
  isRunning: boolean;
  canPause: boolean;
  canNavigate: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  hasItems: boolean;
  currentQuestion?: number;
  totalQuestions?: number;
  onStart: () => void;
  onPauseToggle: () => void;
  onEnd: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onSkip: () => void;
  onOpenConfig?: () => void;
  answerSheet?: ReactNode;
  reviewAction?: ReactNode;
};

export const PracticeTimerPanel = ({
  timers,
  status,
  isPaused,
  isRunning,
  canPause,
  canNavigate,
  canGoPrev,
  canGoNext,
  hasItems,
  currentQuestion,
  totalQuestions,
  onStart,
  onPauseToggle,
  onEnd,
  onPrevQuestion,
  onNextQuestion,
  onSkip,
  onOpenConfig,
  answerSheet,
  reviewAction,
}: PracticeTimerPanelProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasQuestionStats = Boolean(hasItems && totalQuestions);
  const currentDisplay =
    hasQuestionStats && currentQuestion && currentQuestion > 0
      ? currentQuestion
      : '-';
  const totalDisplay = hasQuestionStats ? totalQuestions : '-';

  const handleStartClick = () => {
    if (isRunning) return;
    if (status === 'ended') {
      onStart();
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>计时面板</CardTitle>
        <div className="flex items-center gap-1 rounded-md border border-border/60 bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
          <span>题号</span>
          <span className="text-foreground">{currentDisplay}</span>
          <span>/</span>
          <span>{totalDisplay}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-xs">总计时</p>
            <div className="mt-2 text-3xl font-semibold tracking-tight md:text-2xl">
              {formatDuration(timers.totalMs)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <div className="border-border/60 bg-muted/20 rounded-md border px-3 py-2">
              <p className="text-muted-foreground text-xs">大题计时</p>
              <div className="mt-1 text-xl font-semibold tracking-tight">
                {formatDuration(timers.sectionMs)}
              </div>
            </div>
            <div className="border-border/60 bg-muted/20 rounded-md border px-3 py-2">
              <p className="text-muted-foreground text-xs">小题计时</p>
              <div className="mt-1 text-xl font-semibold tracking-tight">
                {formatDuration(timers.questionMs)}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleStartClick} disabled={isRunning}>
            {status === 'ended' ? '重新开始' : '开始计时'}
          </Button>
          <Button
            variant="secondary"
            onClick={onPauseToggle}
            disabled={!canPause}
          >
            {isPaused ? '继续' : '暂停'}
          </Button>
          <Button variant="outline" onClick={onEnd} disabled={!isRunning}>
            结束
          </Button>
          {answerSheet}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={onPrevQuestion}
            disabled={!canNavigate || !hasItems || !canGoPrev}
          >
            上一题
          </Button>
          <Button
            variant="outline"
            onClick={onNextQuestion}
            disabled={!canNavigate || !hasItems || !canGoNext}
          >
            下一题
          </Button>
          <Button variant="secondary" onClick={onSkip} disabled={!canNavigate}>
            跳过
          </Button>
          {reviewAction}
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认开始计时？</AlertDialogTitle>
            <AlertDialogDescription>
              开始后练习配置将被锁定，模拟模式不允许暂停。
              若需要调整模板或顺序，请先进入练习配置。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消计时</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                onOpenConfig?.();
              }}
            >
              练习配置
            </Button>
            <AlertDialogAction
              onClick={() => {
                onStart();
                toast.success('计时已开始');
              }}
            >
              开始计时
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
