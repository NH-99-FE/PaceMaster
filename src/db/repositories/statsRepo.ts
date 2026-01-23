import { idb } from '@/db';
import type { DailyStat } from '@/types';

const STORE = 'stats_daily';

export const statsRepo = {
  async getDailyStats() {
    return idb.withStore<DailyStat[]>(STORE, 'readonly', store =>
      idb.wrapRequest(store.getAll())
    );
  },

  async updateDailyStats(entry: DailyStat) {
    return idb.withStore<DailyStat>(STORE, 'readwrite', async store => {
      const existing = await idb.wrapRequest<DailyStat | undefined>(
        store.get(entry.date)
      );
      const next: DailyStat = existing
        ? {
            ...existing,
            totalSessions: existing.totalSessions + entry.totalSessions,
            totalTimeMs: existing.totalTimeMs + entry.totalTimeMs,
            completionRate: entry.completionRate,
          }
        : entry;
      await idb.wrapRequest(store.put(next));
      return next;
    });
  },
};
