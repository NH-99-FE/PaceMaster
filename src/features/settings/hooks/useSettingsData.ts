import { useEffect, useMemo, useRef } from 'react';
import { useTemplateActions, useTemplates } from '@/store/selectors';

// 设置页数据加载：默认模板与题型列表。
export const useSettingsData = () => {
  const templateActions = useTemplateActions();
  const templates = useTemplates();
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    templateActions.bootstrapDefaults();
  }, [templateActions]);

  useEffect(() => {
    templateActions.loadQuestionTypes();
    templateActions.loadTemplates();
  }, [templateActions]);

  useEffect(() => {
    if (templates.length === 0) return;
    // 预加载模板明细，方便后续校验题型使用情况。
    templates.forEach(template => {
      templateActions.loadTemplate(template.id);
    });
  }, [templates, templateActions]);

  const defaultTemplate = useMemo(
    () => templates.find(tpl => tpl.isDefault),
    [templates]
  );

  return {
    defaultTemplate,
  };
};
