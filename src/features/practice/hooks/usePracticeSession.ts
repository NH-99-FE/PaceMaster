import { useEffect, useMemo, useRef } from 'react';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import {
  useSessionActions,
  useSessionCurrentIndex,
  useSessionCurrentQuestionNumber,
  useSessionIsPaused,
  useSessionMode,
  useSessionOrder,
  useSessionSkips,
  useSessionStatus,
  useSessionTemplateId,
  useSessionTimers,
  useSessionQuestionTimes,
  useSessionActiveSessionId,
  useTemplateActions,
  useTemplateItems,
  useTemplates,
  useQuestionTypes,
} from '@/store/selectors';
import type { PracticeItem, QuestionGridItem } from '@/features/practice/types';

// 练习页核心数据与派生状态集中管理。
export const usePracticeSession = () => {
  useSessionTimer();

  const mode = useSessionMode();
  const status = useSessionStatus();
  const timers = useSessionTimers();
  const isPaused = useSessionIsPaused();
  const actions = useSessionActions();
  const currentIndex = useSessionCurrentIndex();
  const storedQuestion = useSessionCurrentQuestionNumber();
  const skips = useSessionSkips();
  const questionTimes = useSessionQuestionTimes();
  const templateId = useSessionTemplateId();
  const order = useSessionOrder();
  const activeSessionId = useSessionActiveSessionId();

  const templates = useTemplates();
  const templateActions = useTemplateActions();
  const questionTypes = useQuestionTypes();

  const isRunning = status === 'running';
  const canPause = mode === 'practice' && isRunning;
  const isLocked = status === 'running';
  const canNavigate = isRunning;

  // 刷新拦截已移除，避免触发浏览器原生提示。

  const bootstrappedRef = useRef(false);
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    templateActions.bootstrapDefaults();
  }, [templateActions]);

  const activeTemplate =
    templates.find(tpl => tpl.id === templateId) ?? templates[0];

  useEffect(() => {
    if (templates.length === 0) return;
    const hasTemplate =
      !!templateId && templates.some(tpl => tpl.id === templateId);
    if (!hasTemplate) {
      const fallback = templates.find(tpl => tpl.isDefault) ?? templates[0];
      actions.setTemplate(fallback.id);
    }
  }, [templateId, templates, actions]);

  useEffect(() => {
    if (!activeTemplate?.id) return;
    templateActions.loadTemplate(activeTemplate.id);
  }, [activeTemplate?.id, templateActions]);

  const templateItems = useTemplateItems(activeTemplate?.id ?? '');

  useEffect(() => {
    if (!activeTemplate?.id) return;
    if (templateItems.length === 0) return;
    // 运行中不做顺序修正，避免重置计时与进度。
    if (isRunning) return;
    const sorted = [...templateItems].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    const validIds = new Set(sorted.map(item => item.id));
    const filtered = order.filter(id => validIds.has(id));
    const missing = sorted
      .map(item => item.id)
      .filter(id => !filtered.includes(id));
    const normalized = [...filtered, ...missing];
    if (normalized.length === 0) return;
    const isSame =
      normalized.length === order.length &&
      normalized.every((id, idx) => id === order[idx]);
    if (!isSame) {
      actions.setOrder(normalized);
    }
  }, [activeTemplate?.id, templateItems, order, actions, isRunning]);

  const typeNameMap = useMemo(
    () => new Map(questionTypes.map(type => [type.id, type.name])),
    [questionTypes]
  );

  const orderedItems: PracticeItem[] = useMemo(
    () =>
      order
        .map(id => {
          const item = templateItems.find(entry => entry.id === id);
          if (!item) return null;
          return {
            id: item.id,
            label: typeNameMap.get(item.questionTypeId) ?? '题型',
            questionCount: item.questionCount,
            plannedTime: item.plannedTime,
          };
        })
        .filter(Boolean) as PracticeItem[],
    [order, templateItems, typeNameMap]
  );

  const baseItems: PracticeItem[] = useMemo(() => {
    if (templateItems.length === 0) return [];
    const sorted = [...templateItems].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    return sorted.map(item => ({
      id: item.id,
      label: typeNameMap.get(item.questionTypeId) ?? '题型',
      questionCount: item.questionCount,
      plannedTime: item.plannedTime,
    }));
  }, [templateItems, typeNameMap]);

  const activeIndex = Math.min(
    Math.max(currentIndex, 0),
    Math.max(orderedItems.length - 1, 0)
  );
  const currentItem = orderedItems[activeIndex];
  const hasItems = orderedItems.length > 0;

  const totalQuestions = baseItems.reduce(
    (sum, item) => sum + item.questionCount,
    0
  );

  const { questionGrid, ranges, questionNumberToTemplateId } = useMemo(() => {
    const result: QuestionGridItem[] = [];
    const rangeMap: Record<string, { start: number; end: number }> = {};
    const numberMap: Record<number, string> = {};
    let counter = 1;
    baseItems.forEach((item, typeIndex) => {
      const start = counter;
      for (let i = 0; i < item.questionCount; i += 1) {
        result.push({
          number: counter,
          typeIndex,
          label: item.label,
          templateItemId: item.id,
        });
        numberMap[counter] = item.id;
        counter += 1;
      }
      rangeMap[item.id] = { start, end: counter - 1 };
    });
    return {
      questionGrid: result,
      ranges: rangeMap,
      questionNumberToTemplateId: numberMap,
    };
  }, [baseItems]);

  const sequence = useMemo(() => {
    const result: number[] = [];
    order.forEach(id => {
      const range = ranges[id];
      if (!range) return;
      for (let num = range.start; num <= range.end; num += 1) {
        result.push(num);
      }
    });
    return result;
  }, [order, ranges]);

  const sequenceIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    sequence.forEach((num, idx) => map.set(num, idx));
    return map;
  }, [sequence]);

  const customIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    order.forEach((id, idx) => map.set(id, idx));
    return map;
  }, [order]);

  const currentQuestion =
    hasItems && sequence.length > 0
      ? storedQuestion && sequenceIndexMap.has(storedQuestion)
        ? storedQuestion
        : sequence[0]
      : 0;
  const currentSeqIndex = sequenceIndexMap.get(currentQuestion) ?? 0;
  // 基于“练习顺序序列”判断上一题/下一题是否可用。
  const canGoPrev = currentSeqIndex > 0;
  const canGoNext = currentSeqIndex < Math.max(sequence.length - 1, 0);
  const skippedTypeIds = useMemo(() => {
    if (skips.length === 0) return [];
    const skippedSet = new Set(skips);
    const result = new Set<string>();
    questionGrid.forEach(item => {
      if (skippedSet.has(item.number)) {
        result.add(item.templateItemId);
      }
    });
    return Array.from(result);
  }, [skips, questionGrid]);

  const recordCurrentQuestionTime = () => {
    if (!isRunning || currentQuestion <= 0) return;
    if (timers.questionMs <= 0) return;
    // 切题前先把当前小题用时记到 store。
    actions.recordQuestionTime(currentQuestion, timers.questionMs);
  };

  useEffect(() => {
    if (!activeTemplate?.id) {
      if (!isRunning && storedQuestion) {
        actions.setCurrentQuestion(undefined);
      }
      return;
    }
    if (templateItems.length === 0 || order.length === 0) return;
    if (!hasItems || sequence.length === 0) {
      if (!isRunning && storedQuestion) {
        actions.setCurrentQuestion(undefined);
      }
      return;
    }
    const nextQuestion =
      storedQuestion && sequenceIndexMap.has(storedQuestion)
        ? storedQuestion
        : sequence[0];
    if (nextQuestion !== storedQuestion) {
      actions.setCurrentQuestion(nextQuestion);
    }
    const templateId = questionNumberToTemplateId[nextQuestion];
    const targetIndex =
      templateId !== undefined ? customIndexMap.get(templateId) : undefined;
    if (targetIndex !== undefined && targetIndex !== activeIndex) {
      actions.jumpTo(targetIndex);
    }
  }, [
    hasItems,
    sequence,
    storedQuestion,
    sequenceIndexMap,
    questionNumberToTemplateId,
    customIndexMap,
    activeIndex,
    isRunning,
    actions,
    activeTemplate?.id,
    templateItems.length,
    order.length,
  ]);

  useEffect(() => {
    if (!activeTemplate?.id) return;
    if (templateItems.length === 0 || order.length === 0) return;
    if (!hasItems || sequence.length === 0) return;
    if (isRunning) return;
    const nextQuestion = sequence[0];
    if (nextQuestion !== storedQuestion) {
      actions.setCurrentQuestion(nextQuestion);
    }
    const templateId = questionNumberToTemplateId[nextQuestion];
    const targetIndex =
      templateId !== undefined ? customIndexMap.get(templateId) : undefined;
    if (targetIndex !== undefined && targetIndex !== activeIndex) {
      actions.jumpTo(targetIndex);
    }
  }, [
    hasItems,
    sequence,
    isRunning,
    storedQuestion,
    questionNumberToTemplateId,
    customIndexMap,
    activeIndex,
    actions,
    activeTemplate?.id,
    templateItems.length,
    order.length,
  ]);

  const plannedMs = currentItem ? currentItem.plannedTime * 60_000 : 0;
  const questionElapsedMs = useMemo(() => {
    if (currentQuestion <= 0) return 0;
    return (questionTimes[currentQuestion] ?? 0) + timers.questionMs;
  }, [currentQuestion, questionTimes, timers.questionMs]);

  const sectionElapsedMs = useMemo(() => {
    if (!currentItem) return 0;
    const range = ranges[currentItem.id];
    if (!range) return 0;
    let total = 0;
    for (let num = range.start; num <= range.end; num += 1) {
      total += questionTimes[num] ?? 0;
    }
    if (currentQuestion >= range.start && currentQuestion <= range.end) {
      total += timers.questionMs;
    }
    return total;
  }, [currentItem, ranges, questionTimes, currentQuestion, timers.questionMs]);
  const actualMs = sectionElapsedMs;
  const progressValue =
    plannedMs > 0 ? Math.min(100, (actualMs / plannedMs) * 100) : 0;
  const isOvertime = plannedMs > 0 && actualMs > plannedMs;

  const displayTimers = useMemo(
    () => ({
      ...timers,
      sectionMs: sectionElapsedMs,
      questionMs: questionElapsedMs,
    }),
    [timers, sectionElapsedMs, questionElapsedMs]
  );

  const handleStart = () => {
    if (status === 'ended') {
      actions.reset();
      return;
    }
    actions.start();
  };

  const handlePrevQuestion = () => {
    if (!hasItems) return;
    recordCurrentQuestionTime();
    const currentSeqIndex = sequenceIndexMap.get(currentQuestion) ?? 0;
    const prevIndex = Math.max(0, currentSeqIndex - 1);
    const prevQuestion = sequence[prevIndex];
    if (!prevQuestion || prevQuestion === currentQuestion) return;
    actions.setCurrentQuestion(prevQuestion);
    const templateId = questionNumberToTemplateId[prevQuestion];
    const targetIndex =
      templateId !== undefined ? customIndexMap.get(templateId) : undefined;
    if (targetIndex !== undefined) {
      actions.jumpTo(targetIndex);
    }
  };

  const handleNextQuestion = () => {
    if (!hasItems) return;
    recordCurrentQuestionTime();
    const currentSeqIndex = sequenceIndexMap.get(currentQuestion) ?? 0;
    const nextIndex = Math.min(sequence.length - 1, currentSeqIndex + 1);
    const nextQuestion = sequence[nextIndex];
    if (!nextQuestion || nextQuestion === currentQuestion) return;
    actions.setCurrentQuestion(nextQuestion);
    const templateId = questionNumberToTemplateId[nextQuestion];
    const targetIndex =
      templateId !== undefined ? customIndexMap.get(templateId) : undefined;
    if (targetIndex !== undefined) {
      actions.jumpTo(targetIndex);
    }
  };

  const handleSelectQuestion = (questionNumber: number) => {
    if (questionNumber === currentQuestion) return;
    recordCurrentQuestionTime();
    actions.setCurrentQuestion(questionNumber);
    const templateId = questionNumberToTemplateId[questionNumber];
    const targetIndex =
      templateId !== undefined ? customIndexMap.get(templateId) : undefined;
    if (targetIndex !== undefined) {
      actions.jumpTo(targetIndex);
    }
  };

  const handleSkip = () => {
    if (!hasItems) return;
    recordCurrentQuestionTime();
    actions.skip(currentQuestion);
    const currentSeqIndex = sequenceIndexMap.get(currentQuestion) ?? 0;
    const nextIndex = Math.min(sequence.length - 1, currentSeqIndex + 1);
    const nextQuestion = sequence[nextIndex];
    if (!nextQuestion || nextQuestion === currentQuestion) return;
    actions.setCurrentQuestion(nextQuestion);
    const templateId = questionNumberToTemplateId[nextQuestion];
    const targetIndex =
      templateId !== undefined ? customIndexMap.get(templateId) : undefined;
    if (targetIndex !== undefined) {
      actions.jumpTo(targetIndex);
    }
  };

  const handleJumpType = (index: number) => {
    if (index === activeIndex) return;
    recordCurrentQuestionTime();
    const templateId = orderedItems[index]?.id;
    const rangeStart = templateId ? ranges[templateId]?.start : undefined;
    if (rangeStart !== undefined) {
      actions.setCurrentQuestion(rangeStart);
    }
    actions.jumpTo(index);
  };

  const handleEnd = () => {
    recordCurrentQuestionTime();
    actions.end();
  };

  return {
    mode,
    status,
    timers: displayTimers,
    isPaused,
    isRunning,
    canPause,
    isLocked,
    canNavigate,
    templates,
    activeTemplate,
    orderedItems,
    activeIndex,
    currentItem,
    skips,
    hasItems,
    plannedMs,
    actualMs,
    progressValue,
    isOvertime,
    totalQuestions,
    currentQuestion,
    questionGrid,
    skippedTypeIds,
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
    activeSessionId,
  };
};
