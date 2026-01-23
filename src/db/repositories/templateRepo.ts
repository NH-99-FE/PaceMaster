import { idb } from '@/db';
import type { Template, TemplateItem } from '@/types';

const TEMPLATE_STORE = 'templates';
const ITEM_STORE = 'template_items';

const buildTotals = (items: TemplateItem[]) => ({
  totalQuestions: items.reduce((sum, item) => sum + item.questionCount, 0),
  totalPlannedTime: items.reduce((sum, item) => sum + item.plannedTime, 0),
});

export const templateRepo = {
  async list() {
    return idb.withStore<Template[]>(TEMPLATE_STORE, 'readonly', store =>
      idb.wrapRequest(store.getAll())
    );
  },

  async getById(id: string) {
    const template = await idb.withStore<Template | undefined>(
      TEMPLATE_STORE,
      'readonly',
      store => idb.wrapRequest(store.get(id))
    );
    if (!template) return undefined;
    const items = await idb.withStore<TemplateItem[]>(
      ITEM_STORE,
      'readonly',
      store => idb.wrapRequest(store.index('template_id').getAll(id))
    );
    return { template, items };
  },

  async getDefaultTemplate() {
    return idb.withStore<Template | undefined>(
      TEMPLATE_STORE,
      'readonly',
      store =>
        idb
          .wrapRequest(store.getAll())
          .then(items => items.find(tpl => tpl.isDefault))
    );
  },

  async create(
    input: Omit<
      Template,
      'totalQuestions' | 'totalPlannedTime' | 'createdAt' | 'updatedAt'
    >,
    items: Omit<TemplateItem, 'templateId'>[]
  ) {
    const now = new Date().toISOString();
    const enrichedItems: TemplateItem[] = items.map(item => ({
      ...item,
      templateId: input.id,
    }));
    const totals = buildTotals(enrichedItems);
    const record: Template = {
      ...input,
      ...totals,
      createdAt: now,
      updatedAt: now,
    };

    await idb.withStores([TEMPLATE_STORE, ITEM_STORE], 'readwrite', stores => {
      stores[TEMPLATE_STORE].put(record);
      enrichedItems.forEach(item => stores[ITEM_STORE].put(item));
    });

    return { template: record, items: enrichedItems };
  },

  async update(input: Template, items: TemplateItem[]) {
    const normalizedItems = items.map(item => ({
      ...item,
      templateId: input.id,
    }));
    const totals = buildTotals(normalizedItems);
    const record: Template = {
      ...input,
      ...totals,
      updatedAt: new Date().toISOString(),
    };

    await idb.withStores([TEMPLATE_STORE, ITEM_STORE], 'readwrite', stores => {
      stores[TEMPLATE_STORE].put(record);
      const itemStore = stores[ITEM_STORE];
      const index = itemStore.index('template_id');
      const request = index.getAllKeys(input.id);
      request.onsuccess = () => {
        const keys = request.result as IDBValidKey[];
        keys.forEach(key => itemStore.delete(key));
        normalizedItems.forEach(item => itemStore.put(item));
      };
    });

    return { template: record, items: normalizedItems };
  },

  async remove(id: string) {
    return idb.withStores([TEMPLATE_STORE, ITEM_STORE], 'readwrite', stores => {
      stores[TEMPLATE_STORE].delete(id);
      const index = stores[ITEM_STORE].index('template_id');
      const request = index.getAllKeys(id);
      request.onsuccess = () => {
        const keys = request.result as IDBValidKey[];
        keys.forEach(key => stores[ITEM_STORE].delete(key));
      };
    });
  },
};
