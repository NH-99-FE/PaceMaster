import { type MouseEvent } from 'react';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Mode, Template } from '@/types';
import type { PracticeItem } from '@/features/practice/types';

type SortableRowProps = {
  item: PracticeItem;
  index: number;
  isLocked: boolean;
  isActive: boolean;
  isSkipped: boolean;
  canNavigate: boolean;
  onJump: (index: number) => void;
};

// 可拖拽的题型行（开始后锁定拖拽，仅允许点击跳转）。
const SortableRow = ({
  item,
  index,
  isLocked,
  isActive,
  isSkipped,
  canNavigate,
  onJump,
}: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!canNavigate) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-dnd-handle]')) return;
    if (isDragging) return;
    onJump(index);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'border-border bg-background flex items-center gap-2 rounded-md border px-2 py-2 transition-colors',
        'hover:border-muted-foreground/40 hover:bg-muted/30',
        isActive ? 'border-primary/50 bg-primary/5' : '',
        isDragging ? 'opacity-70 shadow-sm' : '',
      ].join(' ')}
      role="button"
      onClick={handleClick}
    >
      <button
        type="button"
        data-dnd-handle
        aria-label="拖拽调整顺序"
        className={[
          'text-muted-foreground rounded p-1 transition-colors',
          isLocked
            ? 'cursor-not-allowed opacity-40'
            : 'hover:text-foreground cursor-grab',
        ].join(' ')}
        disabled={isLocked}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium">{item.label}</span>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">{item.questionCount}题</Badge>
          <Badge variant="outline">{item.plannedTime}分钟</Badge>
          {isActive && <Badge>当前</Badge>}
          {isSkipped && <Badge variant="outline">跳过</Badge>}
        </div>
      </div>
    </div>
  );
};

type PracticeConfigDialogProps = {
  mode: Mode;
  isRunning: boolean;
  isLocked: boolean;
  templates: Template[];
  activeTemplateId?: string;
  orderedItems: PracticeItem[];
  activeIndex: number;
  skippedTypeIds: string[];
  canNavigate: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onModeChange: (mode: Mode) => void;
  onTemplateChange: (templateId: string) => void;
  onOrderChange: (order: string[]) => void;
  onJumpTo: (index: number) => void;
};

export const PracticeConfigDialog = ({
  mode,
  isRunning,
  isLocked,
  templates,
  activeTemplateId,
  orderedItems,
  activeIndex,
  skippedTypeIds,
  canNavigate,
  open,
  onOpenChange,
  onModeChange,
  onTemplateChange,
  onOrderChange,
  onJumpTo,
}: PracticeConfigDialogProps) => {
  const sortableIds = orderedItems.map(item => item.id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (isLocked || !over || active.id === over.id) return;
    const oldIndex = sortableIds.indexOf(active.id as string);
    const newIndex = sortableIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    onOrderChange(arrayMove(sortableIds, oldIndex, newIndex));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">练习配置</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>练习配置</DialogTitle>
          <DialogDescription>
            模式、模板与题型顺序均在开始前可调整。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">模式</p>
            <Tabs
              value={mode}
              onValueChange={value => onModeChange(value as Mode)}
              className="mt-2"
            >
              <TabsList>
                <TabsTrigger value="practice" disabled={isRunning}>
                  练习模式
                </TabsTrigger>
                <TabsTrigger value="mock" disabled={isRunning}>
                  模拟模式
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">模板</p>
            <Select
              value={activeTemplateId ?? ''}
              onValueChange={onTemplateChange}
              disabled={isLocked || templates.length === 0}
            >
              <SelectTrigger className="mt-2 w-full">
                <SelectValue placeholder="选择模板" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">题型顺序</p>
              <span className="text-muted-foreground text-xs">
                {isLocked ? '已锁定' : '拖拽调整'}
              </span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {orderedItems.length > 0 ? (
                    orderedItems.map((item, index) => (
                      <SortableRow
                        key={item.id}
                        item={item}
                        index={index}
                        isLocked={isLocked}
                        isActive={activeIndex === index}
                        isSkipped={skippedTypeIds.includes(item.id)}
                        canNavigate={canNavigate}
                        onJump={onJumpTo}
                      />
                    ))
                  ) : (
                    <div className="text-muted-foreground border-border/60 rounded-md border border-dashed px-3 py-6 text-center text-xs">
                      暂无可用题型，请先在设置中完善模板。
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
