import type { StateCreator } from 'zustand';
import type { Mode, SessionStatus, SessionTimers } from '@/types';
import type { RootState } from '@/store/rootTypes';

export type SessionSliceState = {
  mode: Mode;
  status: SessionStatus;
  templateId?: string;
  order: string[];
  currentIndex: number;
  timers: SessionTimers;
  isPaused: boolean;
  startedAt?: number;
  skippedQuestions: number[];
  questionTimes: Record<number, number>;
  currentQuestionNumber?: number;
  endDialogShown: boolean;
  activeSessionId?: string;
};

export type SessionSliceActions = {
  setMode: (mode: Mode) => void;
  setTemplate: (templateId: string) => void;
  setOrder: (order: string[]) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  tick: (deltaMs: number) => void;
  recordQuestionTime: (questionNumber: number, deltaMs: number) => void;
  setCurrentQuestion: (questionNumber?: number) => void;
  next: () => void;
  jumpTo: (index: number) => void;
  back: () => void;
  skip: (questionNumber: number) => void;
  end: () => void;
  reset: () => void;
  markEndDialogShown: () => void;
  setActiveSessionId: (id: string | undefined) => void;
};

export type SessionSlice = {
  session: SessionSliceState & { actions: SessionSliceActions };
};

const initialTimers: SessionTimers = {
  totalMs: 0,
  sectionMs: 0,
  questionMs: 0,
};

const initialState: SessionSliceState = {
  mode: 'practice',
  status: 'idle',
  order: [],
  currentIndex: 0,
  timers: initialTimers,
  isPaused: false,
  skippedQuestions: [],
  questionTimes: {},
  currentQuestionNumber: undefined,
  endDialogShown: false,
  activeSessionId: undefined,
};

export const createSessionSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  SessionSlice
> = set => ({
  session: {
    ...initialState,
    actions: {
      setMode: mode =>
        set(state => {
          state.session.mode = mode;
        }),
      setTemplate: templateId =>
        set(state => {
          state.session.templateId = templateId;
          state.session.status = 'ready';
          state.session.order = [];
          state.session.currentIndex = 0;
          state.session.timers.sectionMs = 0;
          state.session.timers.questionMs = 0;
          // 切换模板时重置题目计时。
          state.session.questionTimes = {};
          state.session.skippedQuestions = [];
          state.session.currentQuestionNumber = undefined;
        }),
      setOrder: order =>
        set(state => {
          state.session.order = order;
          // 顺序变化时重置游标与状态。
          state.session.currentIndex = 0;
          state.session.skippedQuestions = [];
          state.session.timers.sectionMs = 0;
          state.session.timers.questionMs = 0;
          // 顺序变化时重置题目计时。
          state.session.questionTimes = {};
          state.session.currentQuestionNumber = undefined;
        }),
      start: () =>
        set(state => {
          state.session.status = 'running';
          state.session.startedAt = Date.now();
          state.session.isPaused = false;
        }),
      pause: () =>
        set(state => {
          state.session.isPaused = true;
        }),
      resume: () =>
        set(state => {
          state.session.isPaused = false;
        }),
      tick: deltaMs =>
        set(state => {
          if (state.session.isPaused) return;
          state.session.timers.totalMs += deltaMs;
          state.session.timers.sectionMs += deltaMs;
          state.session.timers.questionMs += deltaMs;
        }),
      recordQuestionTime: (questionNumber, deltaMs) =>
        set(state => {
          if (questionNumber <= 0 || deltaMs <= 0) return;
          const prev = state.session.questionTimes[questionNumber] ?? 0;
          // 将当前小题计时累加到对应题号。
          state.session.questionTimes[questionNumber] = prev + deltaMs;
        }),
      setCurrentQuestion: questionNumber =>
        set(state => {
          state.session.currentQuestionNumber = questionNumber;
        }),
      next: () =>
        set(state => {
          const nextIndex = Math.min(
            state.session.order.length - 1,
            state.session.currentIndex + 1
          );
          state.session.currentIndex = nextIndex;
          state.session.timers.sectionMs = 0;
          state.session.timers.questionMs = 0;
        }),
      jumpTo: index =>
        set(state => {
          const isSameType = state.session.currentIndex === index;
          state.session.currentIndex = index;
          if (!isSameType) {
            state.session.timers.sectionMs = 0;
          }
          state.session.timers.questionMs = 0;
        }),
      back: () =>
        set(state => {
          state.session.currentIndex = Math.max(
            0,
            state.session.currentIndex - 1
          );
          state.session.timers.sectionMs = 0;
          state.session.timers.questionMs = 0;
        }),
      skip: questionNumber =>
        set(state => {
          if (questionNumber <= 0) return;
          if (!state.session.skippedQuestions.includes(questionNumber)) {
            state.session.skippedQuestions.push(questionNumber);
          }
        }),
      end: () =>
        set(state => {
          state.session.status = 'ended';
        }),
      reset: () =>
        set(state => {
          // 重置时保留当前模式，避免用户重复切换。
          const currentMode = state.session.mode;
          state.session = {
            ...initialState,
            mode: currentMode,
            actions: state.session.actions,
            activeSessionId: undefined,
          };
        }),
      markEndDialogShown: () =>
        set(state => {
          state.session.endDialogShown = true;
        }),
      setActiveSessionId: id =>
        set(state => {
          state.session.activeSessionId = id;
        }),
    },
  },
});
