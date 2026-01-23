import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { RootState } from '@/store/rootTypes';
import { createSessionSlice } from '@/store/sessionSlice';
import { createTemplateSlice } from '@/store/templateSlice';
import { createStatsSlice } from '@/store/statsSlice';
import { createUiSlice } from '@/store/uiSlice';

// 全局 store（优先使用细粒度 selector，减少不必要渲染）。
export const useAppStore = create<RootState>()(
  persist(
    immer((set, get, api) => ({
      ...createSessionSlice(set, get, api),
      ...createTemplateSlice(set, get, api),
      ...createStatsSlice(set, get, api),
      ...createUiSlice(set, get, api),
    })),
    {
      name: 'practice-session',
      partialize: state => {
        const { actions: _actions, ...sessionState } = state.session;
        void _actions;
        return { session: sessionState };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<RootState> | undefined;
        const merged = { ...currentState, ...persisted } as RootState;
        if (persisted?.session) {
          const nextSession = {
            ...currentState.session,
            ...persisted.session,
            actions: currentState.session.actions,
          };
          // 刷新后若仍处于进行中，默认暂停等待用户确认继续。
          if (nextSession.status === 'running') {
            nextSession.isPaused = true;
          }
          merged.session = nextSession;
        }
        return merged;
      },
    }
  )
);

// Slice 级别选择器（用于粗粒度订阅）。
export const useSessionStore = () => useAppStore(state => state.session);
export const useTemplateStore = () =>
  useAppStore(state => state.templatesStore);
export const useStatsStore = () => useAppStore(state => state.statsStore);
export const useUiStore = () => useAppStore(state => state.ui);
