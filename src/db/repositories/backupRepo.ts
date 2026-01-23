import { idb } from '@/db';

const STORE_NAMES = [
  'question_types',
  'templates',
  'template_items',
  'sessions',
  'session_items',
  'question_records',
  'stats_daily',
  'settings',
] as const;

type StoreName = (typeof STORE_NAMES)[number];

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  data: Record<StoreName, unknown[]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ensureBackupPayload = (payload: any): payload is BackupPayload => {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.version !== 1) return false;
  if (!payload.data || typeof payload.data !== 'object') return false;
  return STORE_NAMES.every(name => Array.isArray(payload.data[name]));
};

export const backupRepo = {
  exportAll: async (): Promise<BackupPayload> => {
    const db = await idb.openDb();
    const tx = db.transaction(STORE_NAMES, 'readonly');
    const data = {} as BackupPayload['data'];

    await Promise.all(
      STORE_NAMES.map(async name => {
        const store = tx.objectStore(name);
        const items = await idb.wrapRequest(store.getAll());
        data[name] = items as unknown[];
      })
    );

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };
  },
  importAll: async (payload: unknown) => {
    if (!ensureBackupPayload(payload)) {
      throw new Error('备份文件格式不正确');
    }
    // 全量覆盖写入，保持不同表之间的数据一致。
    const storeNames = [...STORE_NAMES];
    await idb.withStores(storeNames, 'readwrite', async stores => {
      await Promise.all(
        STORE_NAMES.map(async name => {
          const store = stores[name];
          await idb.wrapRequest(store.clear());
          const items = payload.data[name] ?? [];
          await Promise.all(
            items.map(item => idb.wrapRequest(store.put(item)))
          );
        })
      );
    });
  },
};
