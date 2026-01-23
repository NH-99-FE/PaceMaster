import type { StateCreator } from 'zustand';
import { questionTypeRepo } from '@/db/repositories/questionTypeRepo';
import { templateRepo } from '@/db/repositories/templateRepo';
import type { QuestionType, Template, TemplateItem } from '@/types';
import type { RootState } from '@/store/rootTypes';

export type TemplateSliceState = {
  questionTypes: QuestionType[];
  templates: Template[];
  templateItems: Record<string, TemplateItem[]>;
};

export type TemplateSliceActions = {
  bootstrapDefaults: () => Promise<void>;
  loadQuestionTypes: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;
  createQuestionType: (
    input: Omit<QuestionType, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<QuestionType>;
  updateQuestionType: (input: QuestionType) => Promise<QuestionType>;
  removeQuestionType: (id: string) => Promise<void>;
  createTemplate: (
    input: Omit<
      Template,
      'createdAt' | 'updatedAt' | 'totalQuestions' | 'totalPlannedTime'
    >,
    items: Omit<TemplateItem, 'templateId'>[]
  ) => Promise<{ template: Template; items: TemplateItem[] }>;
  updateTemplate: (
    input: Template,
    items: TemplateItem[]
  ) => Promise<{ template: Template; items: TemplateItem[] }>;
  removeTemplate: (id: string) => Promise<void>;
};

export type TemplateSlice = {
  templatesStore: TemplateSliceState & { actions: TemplateSliceActions };
};

const initialState: TemplateSliceState = {
  questionTypes: [],
  templates: [],
  templateItems: {},
};

const defaultQuestionTypes: Array<{
  id: string;
  name: string;
  shortName: string;
  color: string;
}> = [
  { id: 'type-lang', name: '言语理解', shortName: '言语', color: '#2F6FED' },
  { id: 'type-logic', name: '判断推理', shortName: '判断', color: '#16B8A9' },
  { id: 'type-math', name: '数量关系', shortName: '数量', color: '#F59E0B' },
  { id: 'type-data', name: '资料分析', shortName: '资料', color: '#0EA5E9' },
  { id: 'type-common', name: '常识判断', shortName: '常识', color: '#E11D48' },
];

const defaultTemplate = {
  id: 'civil-service-default',
  name: '行测标准模板',
  description: '内置行测标准模板',
  isDefault: true,
};

const defaultTemplateItems = [
  { id: 'tpl-lang', typeId: 'type-lang', count: 40, planned: 30 },
  { id: 'tpl-logic', typeId: 'type-logic', count: 40, planned: 35 },
  { id: 'tpl-math', typeId: 'type-math', count: 15, planned: 20 },
  { id: 'tpl-data', typeId: 'type-data', count: 20, planned: 30 },
  { id: 'tpl-common', typeId: 'type-common', count: 20, planned: 10 },
];

export const createTemplateSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  TemplateSlice
> = set => ({
  templatesStore: {
    ...initialState,
    actions: {
      bootstrapDefaults: async () => {
        // 初始化题型与模板（只在空库时写入默认数据）。
        const existingTypes = await questionTypeRepo.list();
        const typeMap = new Map(existingTypes.map(item => [item.id, item]));
        const createdTypes: QuestionType[] = [];

        for (const item of defaultQuestionTypes) {
          if (typeMap.has(item.id)) continue;
          const created = await questionTypeRepo.create({
            id: item.id,
            name: item.name,
            shortName: item.shortName,
            color: item.color,
          });
          createdTypes.push(created);
        }

        const types = [...existingTypes, ...createdTypes];

        const existingTemplates = await templateRepo.list();
        let templates = existingTemplates;

        if (existingTemplates.length === 0) {
          const items: Omit<TemplateItem, 'templateId'>[] =
            defaultTemplateItems.map((item, index) => ({
              id: item.id,
              questionTypeId: item.typeId,
              questionCount: item.count,
              plannedTime: item.planned,
              orderIndex: index,
            }));

          const result = await templateRepo.create(
            {
              ...defaultTemplate,
            },
            items
          );

          templates = [result.template];
          set(state => {
            state.templatesStore.templateItems = {
              ...state.templatesStore.templateItems,
              [result.template.id]: result.items,
            };
          });
        }

        set(state => {
          state.templatesStore.questionTypes = types;
          state.templatesStore.templates = templates;
        });
      },
      loadQuestionTypes: async () => {
        const items = await questionTypeRepo.list();
        set(state => {
          state.templatesStore.questionTypes = items;
        });
      },
      loadTemplates: async () => {
        const templates = await templateRepo.list();
        set(state => {
          state.templatesStore.templates = templates;
        });
      },
      loadTemplate: async templateId => {
        const result = await templateRepo.getById(templateId);
        if (!result) return;
        set(state => {
          state.templatesStore.templateItems = {
            ...state.templatesStore.templateItems,
            [templateId]: [...result.items].sort(
              (a, b) => a.orderIndex - b.orderIndex
            ),
          };
        });
      },
      createQuestionType: async input => {
        const record = await questionTypeRepo.create({
          ...input,
          id: crypto.randomUUID(),
        });
        set(state => {
          state.templatesStore.questionTypes.push(record);
        });
        return record;
      },
      updateQuestionType: async input => {
        const record = await questionTypeRepo.update(input);
        set(state => {
          const idx = state.templatesStore.questionTypes.findIndex(
            item => item.id === record.id
          );
          if (idx >= 0) state.templatesStore.questionTypes[idx] = record;
        });
        return record;
      },
      removeQuestionType: async id => {
        await questionTypeRepo.remove(id);
        set(state => {
          state.templatesStore.questionTypes =
            state.templatesStore.questionTypes.filter(item => item.id !== id);
        });
      },
      createTemplate: async (input, items) => {
        const result = await templateRepo.create(input, items);
        set(state => {
          state.templatesStore.templates.push(result.template);
          state.templatesStore.templateItems = {
            ...state.templatesStore.templateItems,
            [result.template.id]: result.items,
          };
        });
        return result;
      },
      updateTemplate: async (input, items) => {
        const result = await templateRepo.update(input, items);
        set(state => {
          const idx = state.templatesStore.templates.findIndex(
            item => item.id === result.template.id
          );
          if (idx >= 0) state.templatesStore.templates[idx] = result.template;
          state.templatesStore.templateItems = {
            ...state.templatesStore.templateItems,
            [result.template.id]: result.items,
          };
        });
        return result;
      },
      removeTemplate: async id => {
        await templateRepo.remove(id);
        set(state => {
          state.templatesStore.templates =
            state.templatesStore.templates.filter(item => item.id !== id);
          const nextItems = { ...state.templatesStore.templateItems };
          delete nextItems[id];
          state.templatesStore.templateItems = nextItems;
        });
      },
    },
  },
});
