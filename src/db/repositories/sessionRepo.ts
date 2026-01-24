import { idb } from '@/db';
import type { QuestionRecord, Session, SessionItem } from '@/types';

const SESSION_STORE = 'sessions';
const ITEM_STORE = 'session_items';
const RECORD_STORE = 'question_records';

export const sessionRepo = {
  async createSession(session: Session, items: SessionItem[] = []) {
    await idb.withStores([SESSION_STORE, ITEM_STORE], 'readwrite', stores => {
      stores[SESSION_STORE].put(session);
      items.forEach(item => stores[ITEM_STORE].put(item));
    });
    return session;
  },

  async updateSession(sessionId: string, patch: Partial<Session>) {
    return idb.withStore<Session | undefined>(
      SESSION_STORE,
      'readwrite',
      async store => {
        const existing = await idb.wrapRequest<Session | undefined>(
          store.get(sessionId)
        );
        if (!existing) return undefined;
        const updated: Session = { ...existing, ...patch };
        await idb.wrapRequest(store.put(updated));
        return updated;
      }
    );
  },

  async appendQuestionRecord(record: QuestionRecord) {
    return idb.withStore(RECORD_STORE, 'readwrite', store =>
      idb.wrapRequest(store.put(record))
    );
  },

  async appendQuestionRecords(records: QuestionRecord[]) {
    if (records.length === 0) return;
    return idb.withStore(RECORD_STORE, 'readwrite', store => {
      records.forEach(record => {
        store.put(record);
      });
    });
  },

  async overwriteSession(
    sessionId: string,
    session: Session,
    items: SessionItem[],
    records: QuestionRecord[]
  ) {
    return idb.withStores(
      [SESSION_STORE, ITEM_STORE, RECORD_STORE],
      'readwrite',
      async stores => {
        // 1. 删除旧数据 (Items)
        const itemIndex = stores[ITEM_STORE].index('session_id');
        const itemKeys = await idb.wrapRequest<IDBValidKey[]>(
          itemIndex.getAllKeys(sessionId)
        );
        for (const key of itemKeys) {
          stores[ITEM_STORE].delete(key);
        }

        // 2. 删除旧数据 (Records)
        const recordIndex = stores[RECORD_STORE].index('session_id');
        const recordKeys = await idb.wrapRequest<IDBValidKey[]>(
          recordIndex.getAllKeys(sessionId)
        );
        for (const key of recordKeys) {
          stores[RECORD_STORE].delete(key);
        }

        // 3. 写入新数据
        stores[SESSION_STORE].put(session);
        items.forEach(item => stores[ITEM_STORE].put(item));
        records.forEach(record => stores[RECORD_STORE].put(record));
      }
    );
  },

  async endSession(sessionId: string, patch: Partial<Session>) {
    return sessionRepo.updateSession(sessionId, { ...patch, status: 'ended' });
  },

  async listSessions() {
    return idb.withStore<Session[]>(SESSION_STORE, 'readonly', store =>
      idb.wrapRequest(store.getAll())
    );
  },

  async getSessionById(sessionId: string) {
    return idb.withStore<Session | undefined>(
      SESSION_STORE,
      'readonly',
      store => idb.wrapRequest(store.get(sessionId))
    );
  },

  async getSessionItemsBySession(sessionId: string) {
    return idb.withStore<SessionItem[]>(ITEM_STORE, 'readonly', store => {
      const index = store.index('session_id');
      return idb.wrapRequest(index.getAll(sessionId));
    });
  },

  async getQuestionRecordsBySession(sessionId: string) {
    return idb.withStore<QuestionRecord[]>(RECORD_STORE, 'readonly', store => {
      const index = store.index('session_id');
      return idb.wrapRequest(index.getAll(sessionId));
    });
  },

  async removeSession(sessionId: string) {
    return idb.withStores(
      [SESSION_STORE, ITEM_STORE, RECORD_STORE],
      'readwrite',
      async stores => {
        stores[SESSION_STORE].delete(sessionId);

        const itemIndex = stores[ITEM_STORE].index('session_id');
        const itemKeys = await idb.wrapRequest<IDBValidKey[]>(
          itemIndex.getAllKeys(sessionId)
        );
        itemKeys.forEach(key => stores[ITEM_STORE].delete(key));

        const recordIndex = stores[RECORD_STORE].index('session_id');
        const recordKeys = await idb.wrapRequest<IDBValidKey[]>(
          recordIndex.getAllKeys(sessionId)
        );
        recordKeys.forEach(key => stores[RECORD_STORE].delete(key));
      }
    );
  },

  async restoreRunningSession() {
    return idb.withStore<Session | null>(
      SESSION_STORE,
      'readonly',
      async store => {
        const index = store.index('status');
        const results = await idb.wrapRequest<Session[]>(
          index.getAll('running')
        );
        return results[0] ?? null;
      }
    );
  },
};
