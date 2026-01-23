const DB_NAME = 'exam-timer-db';
const DB_VERSION = 1;

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('question_types')) {
        db.createObjectStore('question_types', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('template_items')) {
        const store = db.createObjectStore('template_items', { keyPath: 'id' });
        store.createIndex('template_id', 'templateId', { unique: false });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains('session_items')) {
        const store = db.createObjectStore('session_items', { keyPath: 'id' });
        store.createIndex('session_id', 'sessionId', { unique: false });
      }
      if (!db.objectStoreNames.contains('question_records')) {
        const store = db.createObjectStore('question_records', {
          keyPath: 'id',
        });
        store.createIndex('session_id', 'sessionId', { unique: false });
        store.createIndex('session_item_id', 'sessionItemId', {
          unique: false,
        });
      }
      if (!db.objectStoreNames.contains('stats_daily')) {
        db.createObjectStore('stats_daily', { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const wrapRequest = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const waitForTx = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

export const withStore = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => Promise<T> | T
) => {
  const db = await openDb();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  const result = await action(store);
  await waitForTx(tx);
  return result;
};

export const withStores = async <T>(
  storeNames: string[],
  mode: IDBTransactionMode,
  action: (stores: Record<string, IDBObjectStore>) => Promise<T> | T
) => {
  const db = await openDb();
  const tx = db.transaction(storeNames, mode);
  const stores: Record<string, IDBObjectStore> = {};
  storeNames.forEach(name => {
    stores[name] = tx.objectStore(name);
  });
  const result = await action(stores);
  await waitForTx(tx);
  return result;
};

export const idb = {
  openDb,
  wrapRequest,
  withStore,
  withStores,
};
