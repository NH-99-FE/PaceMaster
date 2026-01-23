import type { StateCreator } from 'zustand';
import { settingsRepo } from '@/db/repositories/settingsRepo';
import type { AppSettings } from '@/types';
import type { RootState } from '@/store/rootTypes';

export type UISliceState = {
  themeMode: AppSettings['themeMode'];
  colorScheme: AppSettings['colorScheme'];
};

export type UISliceActions = {
  hydrate: () => Promise<void>;
  setThemeMode: (mode: AppSettings['themeMode']) => Promise<void>;
  setColorScheme: (scheme: AppSettings['colorScheme']) => Promise<void>;
};

export type UISlice = {
  ui: UISliceState & { actions: UISliceActions };
};

const defaultState: UISliceState = {
  themeMode: 'system',
  colorScheme: 'azure',
};

export const createUiSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  UISlice
> = (set, get) => ({
  ui: {
    ...defaultState,
    actions: {
      hydrate: async () => {
        const stored = await settingsRepo.get();
        if (!stored) return;
        set(state => {
          state.ui.themeMode = stored.themeMode;
          state.ui.colorScheme = stored.colorScheme;
        });
      },
      setThemeMode: async mode => {
        set(state => {
          state.ui.themeMode = mode;
        });
        const current = get().ui;
        const payload: AppSettings = {
          id: 'app',
          themeMode: mode,
          colorScheme: current.colorScheme,
        };
        await settingsRepo.set(payload);
      },
      setColorScheme: async scheme => {
        set(state => {
          state.ui.colorScheme = scheme;
        });
        const current = get().ui;
        const payload: AppSettings = {
          id: 'app',
          themeMode: current.themeMode,
          colorScheme: scheme,
        };
        await settingsRepo.set(payload);
      },
    },
  },
});
