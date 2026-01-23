import { useEffect, useMemo, useRef, useState } from 'react';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import {
  useSessionActions,
  useSessionMode,
  useSessionOrder,
  useSessionQuestionTimes,
  useSessionStartedAt,
  useSessionTemplateId,
  useSessionTimers,
  useTemplateActions,
  useTemplateItems,
  useTemplates,
  useQuestionTypes,
} from '@/store/selectors';
import type { PracticeItem } from '@/features/practice/types';
import type {
  QuestionRecord,
  QuestionStatus,
  Session,
  SessionItem,
} from '@/types';

export type ReviewQuestion = {
  number: number;
  typeIndex: number;
  label: string;
  templateItemId: string;
};

const DEFAULT_STATUS: QuestionStatus = 'unanswered';
const DEFAULT_ACTIVE_STATUS: QuestionStatus = 'correct';

// 复盘核心数据与状态（题目状态补录 + 保存）。
export const useReviewSession = () => {
  const mode = useSessionMode();
  const order = useSessionOrder();
  const templateId = useSessionTemplateId();
  const timers = useSessionTimers();
  const startedAt = useSessionStartedAt();
  const actions = useSessionActions();
  const questionTimes = useSessionQuestionTimes();

  const templates = useTemplates();
  const templateActions = useTemplateActions();
  const questionTypes = useQuestionTypes();

  // 初始化默认题型与模板（仅首次执行）。
  const bootstrappedRef = useRef(false);
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    templateActions.bootstrapDefaults();
  }, [templateActions]);

  const activeTemplate =
    templates.find(tpl => tpl.id === templateId) ?? templates[0];

  useEffect(() => {
    if (!templateId && templates.length > 0) {
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
    if (order.length > 0) return;
    const sorted = [...templateItems].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    actions.setOrder(sorted.map(item => item.id));
  }, [activeTemplate?.id, templateItems, order.length, actions]);

  const typeNameMap = useMemo(
    () => new Map(questionTypes.map(type => [type.id, type.name])),
    [questionTypes]
  );

  const orderedItems: PracticeItem[] = useMemo(() => {
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

  const questionGrid: ReviewQuestion[] = useMemo(() => {
    const result: ReviewQuestion[] = [];
    let counter = 1;
    orderedItems.forEach((item, typeIndex) => {
      for (let i = 0; i < item.questionCount; i += 1) {
        result.push({
          number: counter,
          typeIndex,
          label: item.label,
          templateItemId: item.id,
        });
        counter += 1;
      }
    });
    return result;
  }, [orderedItems]);

  const plannedTotalMs = useMemo(
    () =>
      orderedItems.reduce((sum, item) => sum + item.plannedTime * 60_000, 0),
    [orderedItems]
  );

  const totalQuestions = questionGrid.length;
  const reviewKey = `${activeTemplate?.id ?? 'empty'}-${order.join(',')}`;

  const [questionStatus, setQuestionStatus] = useState<
    Record<number, QuestionStatus>
  >({});
  const [activeStatus, setActiveStatus] = useState<QuestionStatus>(
    DEFAULT_ACTIVE_STATUS
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!reviewKey) return;
    // 题型或顺序变化时重建默认状态。
    const initial: Record<number, QuestionStatus> = {};
    questionGrid.forEach(item => {
      initial[item.number] = DEFAULT_STATUS;
    });
    setQuestionStatus(initial);
  }, [reviewKey, questionGrid]);

  const counts = useMemo(() => {
    const result = {
      correct: 0,
      wrong: 0,
      skip: 0,
      unanswered: 0,
    };
    questionGrid.forEach(item => {
      const status = questionStatus[item.number] ?? DEFAULT_STATUS;
      result[status] += 1;
    });
    return result;
  }, [questionGrid, questionStatus]);

  const answeredCount = counts.correct + counts.wrong;
  const accuracyRate = answeredCount > 0 ? counts.correct / answeredCount : 0;
  const completionRate =
    totalQuestions > 0 ? answeredCount / totalQuestions : 0;

  const setQuestionResult = (
    questionNumber: number,
    status: QuestionStatus
  ) => {
    setQuestionStatus(prev => ({
      ...prev,
      [questionNumber]: status,
    }));
  };

  const applyActiveStatus = (questionNumber: number) => {
    setQuestionResult(questionNumber, activeStatus);
  };

  const markAllCorrect = () => {
    const updated: Record<number, QuestionStatus> = {};
    questionGrid.forEach(item => {
      updated[item.number] = 'correct';
    });
    setQuestionStatus(updated);
  };

  const clearAll = () => {
    const updated: Record<number, QuestionStatus> = {};
    questionGrid.forEach(item => {
      updated[item.number] = DEFAULT_STATUS;
    });
    setQuestionStatus(updated);
  };

  const saveReview = async (existingSessionId?: string) => {
    if (!activeTemplate || orderedItems.length === 0) return null;
    setIsSaving(true);
    try {
      const sessionId = existingSessionId ?? crypto.randomUUID();
      const now = new Date().toISOString();
      const startedAtMs =
        typeof startedAt === 'number' ? startedAt : Date.now() - timers.totalMs;

      const session: Session = {
        id: sessionId,
        mode,
        templateId: activeTemplate.id,
        customOrder: order,
        status: 'ended',
        startedAt: new Date(startedAtMs).toISOString(),
        endedAt: now,
        totalTimeMs: timers.totalMs,
        pausedCount: 0,
      };

      const sessionItems: SessionItem[] = orderedItems.map((item, index) => ({
        id: crypto.randomUUID(),
        sessionId,
        templateItemId: item.id,
        // 题型用时从小题用时累加而来。
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
          status: questionStatus[item.number] ?? DEFAULT_STATUS,
        };
      });

      await sessionRepo.createSession(session, sessionItems);
      await sessionRepo.appendQuestionRecords(records);

      return sessionId;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    mode,
    activeTemplate,
    orderedItems,
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
    setQuestionResult,
    applyActiveStatus,
    markAllCorrect,
    clearAll,
    saveReview,
  };
};
