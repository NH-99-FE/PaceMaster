import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sessionRepo } from '@/db/repositories/sessionRepo';
import { useTemplateActions, useTemplates } from '@/store/selectors';
import type { Mode, QuestionRecord, QuestionStatus } from '@/types';

type RecordCounts = Record<QuestionStatus, number>;

export type DashboardRecord = {
  id: string;
  mode: Mode;
  templateName: string;
  endedAt?: string;
  totalTimeMs: number;
  totalQuestions: number;
  accuracyRate: number;
  completionRate: number;
};

export type TrendPoint = {
  dateKey: string;
  label: string;
  accuracyRate: number;
  completionRate: number;
  totalTimeMs: number;
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

const pad = (value: number) => value.toString().padStart(2, '0');
const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const formatLabel = (date: Date) =>
  `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;

const getRecentDates = (days: number) => {
  const result: Date[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const next = new Date(today);
    next.setDate(today.getDate() - i);
    result.push(next);
  }
  return result;
};

const getDateKeyOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return formatDateKey(date);
};

// Dashboard 统计（最近 7 天 + 今日 + 记录列表）。
export const useDashboardStats = () => {
  const templates = useTemplates();
  const templateActions = useTemplateActions();
  const [records, setRecords] = useState<DashboardRecord[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [todayCounts, setTodayCounts] =
    useState<RecordCounts>(buildEmptyCounts());
  const [todayQuestions, setTodayQuestions] = useState(0);
  const [todayTimeMs, setTodayTimeMs] = useState(0);
  const [yesterdayCounts, setYesterdayCounts] =
    useState<RecordCounts>(buildEmptyCounts());
  const [yesterdayQuestions, setYesterdayQuestions] = useState(0);
  const [yesterdayTimeMs, setYesterdayTimeMs] = useState(0);
  const [distributionCounts, setDistributionCounts] =
    useState<RecordCounts>(buildEmptyCounts());
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    templateActions.bootstrapDefaults();
    templateActions.loadTemplates();
  }, [templateActions]);

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
            accuracyRate,
            completionRate,
            counts,
          };
        })
      );

      rows.sort((a, b) => {
        const aTime = a.endedAt ? new Date(a.endedAt).getTime() : 0;
        const bTime = b.endedAt ? new Date(b.endedAt).getTime() : 0;
        return bTime - aTime;
      });

      const dailyMap = new Map<
        string,
        { counts: RecordCounts; totalQuestions: number; totalTimeMs: number }
      >();

      rows.forEach(row => {
        const date = row.endedAt ? new Date(row.endedAt) : new Date();
        const key = formatDateKey(date);
        const existing = dailyMap.get(key) ?? {
          counts: buildEmptyCounts(),
          totalQuestions: 0,
          totalTimeMs: 0,
        };
        existing.counts.correct += row.counts.correct;
        existing.counts.wrong += row.counts.wrong;
        existing.counts.skip += row.counts.skip;
        existing.counts.unanswered += row.counts.unanswered;
        existing.totalQuestions += row.totalQuestions;
        existing.totalTimeMs += row.totalTimeMs;
        dailyMap.set(key, existing);
      });

      const todayKey = getDateKeyOffset(0);
      const today = dailyMap.get(todayKey);
      setTodayCounts(today?.counts ?? buildEmptyCounts());
      setTodayQuestions(today?.totalQuestions ?? 0);
      setTodayTimeMs(today?.totalTimeMs ?? 0);

      const yesterdayKey = getDateKeyOffset(-1);
      const yesterday = dailyMap.get(yesterdayKey);
      setYesterdayCounts(yesterday?.counts ?? buildEmptyCounts());
      setYesterdayQuestions(yesterday?.totalQuestions ?? 0);
      setYesterdayTimeMs(yesterday?.totalTimeMs ?? 0);

      const recentDates = getRecentDates(7);
      const trendPoints = recentDates.map(date => {
        const key = formatDateKey(date);
        const value = dailyMap.get(key);
        const counts = value?.counts ?? buildEmptyCounts();
        const answeredCount = counts.correct + counts.wrong;
        const totalQuestions = value?.totalQuestions ?? 0;
        const accuracyRate =
          answeredCount > 0 ? counts.correct / answeredCount : 0;
        const completionRate =
          totalQuestions > 0 ? answeredCount / totalQuestions : 0;
        return {
          dateKey: key,
          label: formatLabel(date),
          accuracyRate,
          completionRate,
          totalTimeMs: value?.totalTimeMs ?? 0,
        };
      });

      const distribution = trendPoints.reduce<RecordCounts>((acc, point) => {
        const day = dailyMap.get(point.dateKey);
        if (!day) return acc;
        acc.correct += day.counts.correct;
        acc.wrong += day.counts.wrong;
        acc.skip += day.counts.skip;
        acc.unanswered += day.counts.unanswered;
        return acc;
      }, buildEmptyCounts());

      setRecords(
        rows
          .map(({ counts, ...rest }) => {
            void counts;
            return rest;
          })
          .slice(0, 5)
      );
      setTrend(trendPoints);
      setDistributionCounts(distribution);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [templates]);

  useEffect(() => {
    if (templates.length === 0) return;
    refresh();
  }, [templates.length, refresh]);

  const todayAnswered = todayCounts.correct + todayCounts.wrong;
  const todayAccuracy =
    todayAnswered > 0 ? todayCounts.correct / todayAnswered : 0;
  const todayCompletion =
    todayQuestions > 0 ? todayAnswered / todayQuestions : 0;

  const yesterdayAnswered = yesterdayCounts.correct + yesterdayCounts.wrong;
  const yesterdayAccuracy =
    yesterdayAnswered > 0 ? yesterdayCounts.correct / yesterdayAnswered : 0;
  const yesterdayCompletion =
    yesterdayQuestions > 0 ? yesterdayAnswered / yesterdayQuestions : 0;

  const distributionData = useMemo(
    () => [
      { name: '正确', value: distributionCounts.correct, key: 'correct' },
      { name: '错误', value: distributionCounts.wrong, key: 'wrong' },
      { name: '跳过', value: distributionCounts.skip, key: 'skip' },
      { name: '未做', value: distributionCounts.unanswered, key: 'unanswered' },
    ],
    [distributionCounts]
  );

  return {
    records,
    trend,
    distributionData,
    today: {
      totalQuestions: todayQuestions,
      totalTimeMs: todayTimeMs,
      accuracyRate: todayAccuracy,
      completionRate: todayCompletion,
    },
    delta: {
      totalQuestions: todayQuestions - yesterdayQuestions,
      totalTimeMs: todayTimeMs - yesterdayTimeMs,
      accuracyRate: todayAccuracy - yesterdayAccuracy,
      completionRate: todayCompletion - yesterdayCompletion,
    },
    isLoading,
    refresh,
  };
};
