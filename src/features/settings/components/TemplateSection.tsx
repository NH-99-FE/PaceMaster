import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useQuestionTypes,
  useTemplateActions,
  useTemplateItemsMap,
  useTemplates,
} from '@/store/selectors';
import { formatDuration } from '@/utils/time';
import type { Template, TemplateItem } from '@/types';

type EditableItem = {
  id: string;
  questionTypeId: string;
  questionCount: number;
  plannedTime: number;
};

type DialogMode = 'create' | 'edit' | 'view';

const buildEditableItems = (items: TemplateItem[]) =>
  items.map(item => ({
    id: item.id,
    questionTypeId: item.questionTypeId,
    questionCount: item.questionCount,
    plannedTime: item.plannedTime,
  }));

export const TemplateSection = () => {
  const templates = useTemplates();
  const questionTypes = useQuestionTypes();
  const templateItemsMap = useTemplateItemsMap();
  const templateActions = useTemplateActions();
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = dialogMode !== null;
  const isReadOnly = dialogMode === 'view';

  useEffect(() => {
    if (!isOpen) return;
    if (dialogMode === 'create') {
      setActiveTemplate(null);
      setName('');
      setDescription('');
      const defaultType = questionTypes[0]?.id ?? '';
      setItems(
        defaultType
          ? [
              {
                id: crypto.randomUUID(),
                questionTypeId: defaultType,
                questionCount: 10,
                plannedTime: 10,
              },
            ]
          : []
      );
      return;
    }

    if (activeTemplate) {
      setName(activeTemplate.name);
      setDescription(activeTemplate.description ?? '');
      const templateItems = templateItemsMap[activeTemplate.id] ?? [];
      setItems(buildEditableItems(templateItems));
    }
  }, [isOpen, dialogMode, activeTemplate, templateItemsMap, questionTypes]);

  const totals = useMemo(() => {
    const totalQuestions = items.reduce(
      (sum, item) => sum + item.questionCount,
      0
    );
    const totalPlannedTime = items.reduce(
      (sum, item) => sum + item.plannedTime,
      0
    );
    return { totalQuestions, totalPlannedTime };
  }, [items]);

  const openCreate = () => setDialogMode('create');
  const openEdit = (template: Template) => {
    setActiveTemplate(template);
    templateActions.loadTemplate(template.id);
    setDialogMode(template.isDefault ? 'view' : 'edit');
  };

  const handleAddItem = () => {
    const typeId = questionTypes[0]?.id ?? '';
    if (!typeId) return;
    setItems(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        questionTypeId: typeId,
        questionCount: 10,
        plannedTime: 10,
      },
    ]);
  };

  const updateItem = (id: string, patch: Partial<EditableItem>) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    setItems(prev => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const [removed] = next.splice(index, 1);
      next.splice(target, 0, removed);
      return next;
    });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (items.length === 0) return;
    setIsSaving(true);
    try {
      const normalizedItems = items.map((item, index) => ({
        ...item,
        orderIndex: index,
      }));
      if (dialogMode === 'create') {
        await templateActions.createTemplate(
          {
            id: crypto.randomUUID(),
            name: trimmed,
            description: description.trim() || undefined,
            isDefault: false,
          },
          normalizedItems
        );
        toast.success('模板已创建');
      } else if (activeTemplate) {
        const itemsWithTemplateId = normalizedItems.map(item => ({
          ...item,
          templateId: activeTemplate.id,
        }));
        await templateActions.updateTemplate(
          {
            ...activeTemplate,
            name: trimmed,
            description: description.trim() || undefined,
          },
          itemsWithTemplateId
        );
        toast.success('模板已保存');
      }
      setDialogMode(null);
    } catch {
      toast.error('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await templateActions.removeTemplate(templateId);
      toast.success('模板已删除');
    } catch {
      toast.error('删除失败，请稍后重试');
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>模板管理</CardTitle>
          <p className="text-muted-foreground text-xs">
            题型顺序、题数与计划用时统一在模板中维护。
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新建模板
        </Button>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <div className="text-muted-foreground text-sm">暂无模板。</div>
        ) : (
          <div className="space-y-3">
            {templates.map(template => (
              <div
                key={template.id}
                className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{template.name}</span>
                    {template.isDefault && (
                      <Badge variant="outline">内置</Badge>
                    )}
                  </div>
                  {template.description && (
                    <div className="text-muted-foreground text-xs">
                      {template.description}
                    </div>
                  )}
                  <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">
                      {template.totalQuestions} 题
                    </Badge>
                    <Badge variant="outline">
                      {template.totalPlannedTime} 分钟
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(template)}
                  >
                    {template.isDefault ? '查看' : '编辑'}
                  </Button>
                  {!template.isDefault && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除模板？</AlertDialogTitle>
                          <AlertDialogDescription>
                            删除后将移除模板与题型配置，且无法恢复。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(template.id)}
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isOpen} onOpenChange={open => !open && setDialogMode(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? '新建模板'
                : dialogMode === 'view'
                  ? '查看模板'
                  : '编辑模板'}
            </DialogTitle>
            <DialogDescription>
              模板题型顺序应与考试设置题型顺序一致。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">模板名称</p>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={isReadOnly}
                  className="mt-2"
                  placeholder="如：行测自定义模板"
                />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">模板描述</p>
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  disabled={isReadOnly}
                  className="mt-2"
                  placeholder="可选"
                />
              </div>
            </div>

            <div className="border-border/60 bg-muted/20 rounded-lg border px-4 py-3 text-sm">
              <div className="text-muted-foreground flex flex-wrap gap-4">
                <span>总题数：{totals.totalQuestions} 题</span>
                <span>计划用时：{totals.totalPlannedTime} 分钟</span>
                <span>
                  预计平均：
                  {totals.totalQuestions > 0
                    ? formatDuration(
                        Math.round(
                          (totals.totalPlannedTime * 60_000) /
                            totals.totalQuestions
                        )
                      )
                    : '--'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">题型配置</p>
                {!isReadOnly && (
                  <Button size="sm" variant="outline" onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    新增题型
                  </Button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="border-border/70 text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                  暂无题型，请添加题型配置。
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="border-border/60 bg-background flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3"
                    >
                      <div className="min-w-40 flex-1">
                        <Select
                          value={item.questionTypeId}
                          onValueChange={value =>
                            updateItem(item.id, { questionTypeId: value })
                          }
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择题型" />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min={1}
                          value={item.questionCount}
                          onChange={e =>
                            updateItem(item.id, {
                              questionCount: Number(e.target.value) || 0,
                            })
                          }
                          disabled={isReadOnly}
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          min={0}
                          value={item.plannedTime}
                          onChange={e =>
                            updateItem(item.id, {
                              plannedTime: Number(e.target.value) || 0,
                            })
                          }
                          disabled={isReadOnly}
                        />
                      </div>
                      {!isReadOnly && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === items.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogMode(null)}>
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim() || items.length === 0}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  保存
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
