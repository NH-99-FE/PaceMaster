import { useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  useQuestionTypes,
  useTemplateActions,
  useTemplateItemsMap,
} from '@/store/selectors';
import type { QuestionType } from '@/types';

type FormState = {
  name: string;
  shortName: string;
  color: string;
};

const emptyForm: FormState = {
  name: '',
  shortName: '',
  color: '#3b82f6',
};

export const QuestionTypeSection = () => {
  const questionTypes = useQuestionTypes();
  const templateItemsMap = useTemplateItemsMap();
  const templateActions = useTemplateActions();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionType | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const usedTypeIds = useMemo(() => {
    const set = new Set<string>();
    Object.values(templateItemsMap).forEach(items => {
      items.forEach(item => set.add(item.questionTypeId));
    });
    return set;
  }, [templateItemsMap]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (type: QuestionType) => {
    setEditing(type);
    setForm({
      name: type.name,
      shortName: type.shortName ?? '',
      color: type.color ?? '#3b82f6',
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      if (editing) {
        await templateActions.updateQuestionType({
          ...editing,
          name,
          shortName: form.shortName.trim() || undefined,
          color: form.color,
        });
        toast.success('题型已保存');
      } else {
        await templateActions.createQuestionType({
          name,
          shortName: form.shortName.trim() || undefined,
          color: form.color,
        });
        toast.success('题型已创建');
      }
      setIsOpen(false);
    } catch {
      toast.error('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await templateActions.removeQuestionType(id);
      toast.success('题型已删除');
    } catch {
      toast.error('删除失败，请稍后重试');
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>题型管理</CardTitle>
          <p className="text-muted-foreground text-xs">
            管理题型名称与简称，模板将引用这些题型。
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              新建题型
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? '编辑题型' : '新建题型'}</DialogTitle>
              <DialogDescription>
                简称用于题型卡片展示，可选填写。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">题型名称</p>
                <Input
                  value={form.name}
                  onChange={e =>
                    setForm(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="如：言语理解"
                  className="mt-2"
                />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">题型简称</p>
                <Input
                  value={form.shortName}
                  onChange={e =>
                    setForm(prev => ({ ...prev, shortName: e.target.value }))
                  }
                  placeholder="如：言语"
                  className="mt-2"
                />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">颜色</p>
                <div className="mt-2 flex items-center gap-3">
                  <Input
                    type="color"
                    value={form.color}
                    onChange={e =>
                      setForm(prev => ({ ...prev, color: e.target.value }))
                    }
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    value={form.color}
                    onChange={e =>
                      setForm(prev => ({ ...prev, color: e.target.value }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !form.name.trim()}
                >
                  {isSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  保存
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {questionTypes.length === 0 ? (
          <div className="text-muted-foreground text-sm">暂无题型。</div>
        ) : (
          <div className="space-y-3">
            {questionTypes.map(item => {
              const isUsed = usedTypeIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color ?? '#3b82f6' }}
                    />
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {item.shortName
                          ? `简称：${item.shortName}`
                          : '未设置简称'}
                      </div>
                    </div>
                    {isUsed && <Badge variant="outline">使用中</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      编辑
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isUsed}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除题型？</AlertDialogTitle>
                          <AlertDialogDescription>
                            删除后将无法恢复，且模板中引用的题型将失效。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
