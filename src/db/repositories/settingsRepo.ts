import { idb } from '@/db';
import type { AppSettings } from '@/types';

const STORE = 'settings';

export const settingsRepo = {
  async get() {
    return idb.withStore<AppSettings | undefined>(STORE, 'readonly', store =>
      idb.wrapRequest(store.get('app'))
    );
  },

  async set(settings: AppSettings) {
    return idb.withStore<AppSettings>(STORE, 'readwrite', async store => {
      await idb.wrapRequest(store.put(settings));
      return settings;
    });
  },
};
