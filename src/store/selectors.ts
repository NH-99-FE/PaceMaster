import { useAppStore } from '@/store';
import type {
  Mode,
  SessionStatus,
  SessionTimers,
  Template,
  TemplateItem,
  QuestionType,
  DailyStat,
  AppSettings,
} from '@/types';

// 会话选择器（细粒度，减少不必要渲染）。
export const useSessionMode = () => useAppStore(s => s.session.mode);
export const useSessionStatus = () => useAppStore(s => s.session.status);
export const useSessionTemplateId = () =>
  useAppStore(s => s.session.templateId);
export const useSessionOrder = () => useAppStore(s => s.session.order);
export const useSessionCurrentIndex = () =>
  useAppStore(s => s.session.currentIndex);
export const useSessionTimers = () => useAppStore(s => s.session.timers);
export const useSessionIsPaused = () => useAppStore(s => s.session.isPaused);
export const useSessionStartedAt = () => useAppStore(s => s.session.startedAt);
export const useSessionCurrentQuestionNumber = () =>
  useAppStore(s => s.session.currentQuestionNumber);
export const useSessionActions = () => useAppStore(s => s.session.actions);
export const useSessionSkips = () =>
  useAppStore(s => s.session.skippedQuestions);
export const useSessionQuestionTimes = () =>
  useAppStore(s => s.session.questionTimes);
export const useSessionEndDialogShown = () =>
  useAppStore(s => s.session.endDialogShown);
export const useSessionActiveSessionId = () =>
  useAppStore(s => s.session.activeSessionId);

// 模板选择器。
export const useTemplates = () => useAppStore(s => s.templatesStore.templates);
export const useQuestionTypes = () =>
  useAppStore(s => s.templatesStore.questionTypes);
const EMPTY_TEMPLATE_ITEMS: TemplateItem[] = [];
// 模板明细选择器：确保未命中时返回稳定引用，避免无限渲染。
export const useTemplateItems = (templateId: string) =>
  useAppStore(
    s => s.templatesStore.templateItems[templateId] ?? EMPTY_TEMPLATE_ITEMS
  );
export const useTemplateActions = () =>
  useAppStore(s => s.templatesStore.actions);
export const useTemplateItemsMap = () =>
  useAppStore(s => s.templatesStore.templateItems);

// 统计选择器。
export const useDailyStats = () => useAppStore(s => s.statsStore.daily);
export const useStatsActions = () => useAppStore(s => s.statsStore.actions);

// UI 选择器（主题与布局）。
export const useThemeMode = () => useAppStore(s => s.ui.themeMode);
export const useColorScheme = () => useAppStore(s => s.ui.colorScheme);
export const useUiActions = () => useAppStore(s => s.ui.actions);

export const useHasRunningSession = () =>
  useAppStore(s => s.session.status === 'running');

// 派生选择器。
export const useSessionProgress = () =>
  useAppStore(s => ({
    current: s.session.currentIndex,
    total: s.session.order.length,
  }));

export type {
  Mode,
  SessionStatus,
  SessionTimers,
  Template,
  TemplateItem,
  QuestionType,
  DailyStat,
  AppSettings,
};
