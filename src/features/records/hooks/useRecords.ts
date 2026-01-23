import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import { useTemplateActions, useTemplates } from '@/store/selectors';
import type { Mode, QuestionRecord, QuestionStatus } from '@/types';

type RecordCounts = Record<QuestionStatus, number>;

export type ReviewRecord = {
  id: string;
  mode: Mode;
  templateName: string;
  endedAt?: string;
  totalTimeMs: number;
  totalQuestions: number;
  counts: RecordCounts;
  accuracyRate: number;
  completionRate: number;
};

const buildEmptyCounts = (): RecordCounts => ({
  correct: 0,
  wrong: 0,
  skip: 0,
  unanswered: 0,
});

const calcCounts = (records: QuestionRecord[]): RecordCounts => {
  const counts = buildEmptyCounts();
  records.forEach(record => {
    counts[record.status] += 1;
  });
  return counts;
};

// 复盘记录读取（基于 sessions + question_records）。
export const useRecords = () => {
  const templates = useTemplates();
  const templateActions = useTemplateActions();
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    templateActions.bootstrapDefaults();
    templateActions.loadTemplates();
  }, [templateActions]);

  // 拉取 sessions 与题号状态，并聚合为列表数据。
  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    try {
      const sessions = (await sessionRepo.listSessions()).filter(
        session => session.status === 'ended'
      );
      const templateMap = new Map(templates.map(tpl => [tpl.id, tpl.name]));

      const rows = await Promise.all(
        sessions.map(async session => {
          const questionRecords = await sessionRepo.getQuestionRecordsBySession(
            session.id
          );
          const counts = calcCounts(questionRecords);
          const totalQuestions = questionRecords.length;
          const answeredCount = counts.correct + counts.wrong;
          const accuracyRate =
            answeredCount > 0 ? counts.correct / answeredCount : 0;
          const completionRate =
            totalQuestions > 0 ? answeredCount / totalQuestions : 0;

          return {
            id: session.id,
            mode: session.mode,
            templateName: templateMap.get(session.templateId) ?? '未命名模板',
            endedAt: session.endedAt,
            totalTimeMs: session.totalTimeMs,
            totalQuestions,
            counts,
            accuracyRate,
            completionRate,
          } satisfies ReviewRecord;
        })
      );

      rows.sort((a, b) => {
        const aTime = a.endedAt ? new Date(a.endedAt).getTime() : 0;
        const bTime = b.endedAt ? new Date(b.endedAt).getTime() : 0;
        return bTime - aTime;
      });

      setRecords(rows);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [templates]);

  useEffect(() => {
    if (templates.length === 0) return;
    refresh();
  }, [templates.length, refresh]);

  const summary = useMemo(() => {
    if (records.length === 0) {
      return {
        totalSessions: 0,
        avgAccuracy: 0,
        avgCompletion: 0,
        totalTimeMs: 0,
      };
    }
    const totalSessions = records.length;
    const totalTimeMs = records.reduce(
      (sum, record) => sum + record.totalTimeMs,
      0
    );
    const avgAccuracy =
      records.reduce((sum, record) => sum + record.accuracyRate, 0) /
      totalSessions;
    const avgCompletion =
      records.reduce((sum, record) => sum + record.completionRate, 0) /
      totalSessions;
    return {
      totalSessions,
      avgAccuracy,
      avgCompletion,
      totalTimeMs,
    };
  }, [records]);

  return {
    records,
    isLoading,
    summary,
    refresh,
  };
};
