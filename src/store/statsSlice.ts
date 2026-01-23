import type { StateCreator } from 'zustand';
import { statsRepo } from '@/db/repositories/statsRepo';
import type { DailyStat } from '@/types';
import type { RootState } from '@/store/rootTypes';

export type StatsSliceState = {
  daily: DailyStat[];
};

export type StatsSliceActions = {
  refreshDaily: () => Promise<void>;
  appendDaily: (entry: DailyStat) => Promise<void>;
};

export type StatsSlice = {
  statsStore: StatsSliceState & { actions: StatsSliceActions };
};

const initialState: StatsSliceState = {
  daily: [],
};

export const createStatsSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  StatsSlice
> = set => ({
  statsStore: {
    ...initialState,
    actions: {
      refreshDaily: async () => {
        const items = await statsRepo.getDailyStats();
        set(state => {
          state.statsStore.daily = items;
        });
      },
      appendDaily: async entry => {
        const updated = await statsRepo.updateDailyStats(entry);
        set(state => {
          const idx = state.statsStore.daily.findIndex(
            item => item.date === updated.date
          );
          if (idx >= 0) {
            state.statsStore.daily[idx] = updated;
          } else {
            state.statsStore.daily.push(updated);
          }
        });
      },
    },
  },
});
