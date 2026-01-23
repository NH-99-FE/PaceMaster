import { idb } from '@/db';
import type { QuestionType } from '@/types';

const STORE = 'question_types';

export const questionTypeRepo = {
  async list() {
    return idb.withStore<QuestionType[]>(STORE, 'readonly', store =>
      idb.wrapRequest(store.getAll())
    );
  },

  async getById(id: string) {
    return idb.withStore<QuestionType | undefined>(STORE, 'readonly', store =>
      idb.wrapRequest(store.get(id))
    );
  },

  async create(input: Omit<QuestionType, 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const record: QuestionType = { ...input, createdAt: now, updatedAt: now };
    await idb.withStore(STORE, 'readwrite', store =>
      idb.wrapRequest(store.put(record))
    );
    return record;
  },

  async update(input: QuestionType) {
    const record: QuestionType = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    await idb.withStore(STORE, 'readwrite', store =>
      idb.wrapRequest(store.put(record))
    );
    return record;
  },

  async remove(id: string) {
    return idb.withStore(STORE, 'readwrite', store =>
      idb.wrapRequest(store.delete(id))
    );
  },
};
