import { useCallback, useEffect, useMemo, useState } from 'react';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import {
  useTemplateActions,
  useTemplateItems,
  useQuestionTypes,
} from '@/store/selectors';
import type { PracticeItem } from '@/features/practice/types';
import type {
  QuestionRecord,
  QuestionStatus,
  Session,
  SessionItem,
} from '@/types';

export type RecordDetailState = {
  session?: Session;
  sessionItems: SessionItem[];
  questionRecords: QuestionRecord[];
  orderedItems: PracticeItem[];
  questionGrid: Array<{
    number: number;
    typeIndex: number;
    label: string;
    templateItemId: string;
  }>;
  questionStatus: Record<number, QuestionStatus>;
};

const DEFAULT_STATUS: QuestionStatus = 'unanswered';
const DEFAULT_ACTIVE_STATUS: QuestionStatus = 'correct';

export const useRecordDetail = (sessionId?: string) => {
  const templateActions = useTemplateActions();
  const questionTypes = useQuestionTypes();
  const [state, setState] = useState<RecordDetailState>({
    sessionItems: [],
    questionRecords: [],
    orderedItems: [],
    questionGrid: [],
    questionStatus: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeStatus, setActiveStatus] = useState<QuestionStatus>(
    DEFAULT_ACTIVE_STATUS
  );

  useEffect(() => {
    templateActions.bootstrapDefaults();
    templateActions.loadTemplates();
    templateActions.loadQuestionTypes();
  }, [templateActions]);

  const templateItems = useTemplateItems(state.session?.templateId ?? '');

  // 读取 session、题型顺序与题号状态，用于复盘编辑。
  const loadRecord = useCallback(async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const session = await sessionRepo.getSessionById(sessionId);
      if (!session) {
        setState(prev => ({ ...prev, session: undefined }));
        return;
      }

      const [sessionItems, questionRecords] = await Promise.all([
        sessionRepo.getSessionItemsBySession(sessionId),
        sessionRepo.getQuestionRecordsBySession(sessionId),
      ]);

      setState(prev => ({
        ...prev,
        session,
        sessionItems,
        questionRecords,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    if (!state.session?.templateId) return;
    templateActions.loadTemplate(state.session.templateId);
  }, [state.session?.templateId, templateActions]);

  const typeNameMap = useMemo(
    () => new Map(questionTypes.map(type => [type.id, type.name])),
    [questionTypes]
  );

  const orderedItems: PracticeItem[] = useMemo(() => {
    if (!state.session) return [];
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
  }, [state.session, templateItems, typeNameMap]);

  const questionGrid = useMemo(() => {
    const result: RecordDetailState['questionGrid'] = [];
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

  useEffect(() => {
    const nextStatus: Record<number, QuestionStatus> = {};
    questionGrid.forEach(item => {
      nextStatus[item.number] = DEFAULT_STATUS;
    });
    state.questionRecords.forEach(record => {
      nextStatus[record.questionIndex] = record.status;
    });
    setState(prev => ({
      ...prev,
      orderedItems,
      questionGrid,
      questionStatus: nextStatus,
    }));
  }, [orderedItems, questionGrid, state.questionRecords]);

  const counts = useMemo(() => {
    const result: Record<QuestionStatus, number> = {
      correct: 0,
      wrong: 0,
      skip: 0,
      unanswered: 0,
    };
    questionGrid.forEach(item => {
      const status = state.questionStatus[item.number] ?? DEFAULT_STATUS;
      result[status] += 1;
    });
    return result;
  }, [questionGrid, state.questionStatus]);

  const answeredCount = counts.correct + counts.wrong;
  const accuracyRate = answeredCount > 0 ? counts.correct / answeredCount : 0;
  const completionRate =
    questionGrid.length > 0 ? answeredCount / questionGrid.length : 0;

  const applyActiveStatus = (questionNumber: number) => {
    setState(prev => ({
      ...prev,
      questionStatus: {
        ...prev.questionStatus,
        [questionNumber]: activeStatus,
      },
    }));
  };

  const setQuestionStatus = (
    questionNumber: number,
    status: QuestionStatus
  ) => {
    setState(prev => ({
      ...prev,
      questionStatus: {
        ...prev.questionStatus,
        [questionNumber]: status,
      },
    }));
  };

  const markBatch = (typeIndex: number, status: QuestionStatus) => {
    const targetStatus = status === 'unanswered' ? DEFAULT_STATUS : status;
    const nextStatus = { ...state.questionStatus };
    state.questionGrid.forEach(item => {
      if (item.typeIndex === typeIndex) {
        nextStatus[item.number] = targetStatus;
      }
    });
    setState(prev => ({
      ...prev,
      questionStatus: nextStatus,
    }));
  };

  // 保存题号状态修改（更新 question_records）。
  const saveChanges = async () => {
    if (!state.session) return false;
    setIsSaving(true);
    try {
      const existingMap = new Map(
        state.questionRecords.map(record => [record.questionIndex, record])
      );
      const sessionItemMap = new Map(
        state.sessionItems.map(item => [item.templateItemId, item])
      );
      const updatedRecords = questionGrid.map(item => {
        const existing = existingMap.get(item.number);
        const status = state.questionStatus[item.number] ?? DEFAULT_STATUS;
        if (existing) {
          return { ...existing, status };
        }
        const sessionItem = sessionItemMap.get(item.templateItemId);
        return {
          id: crypto.randomUUID(),
          sessionId: state.session!.id,
          sessionItemId: sessionItem?.id ?? '',
          questionIndex: item.number,
          actualTimeMs: 0,
          plannedTime: 0,
          status,
        } satisfies QuestionRecord;
      });

      await sessionRepo.appendQuestionRecords(updatedRecords);
      setState(prev => ({
        ...prev,
        questionRecords: updatedRecords,
      }));
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecord = async () => {
    if (!state.session) return false;
    setIsDeleting(true);
    try {
      await sessionRepo.removeSession(state.session.id);
      return true;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
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
    setQuestionStatus,
    markBatch,
    saveChanges,
    deleteRecord,
  };
};
