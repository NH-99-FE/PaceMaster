import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/time';

type ModuleTimeData = {
  id: string;
  name: string;
  actualMs: number;
  plannedMs: number;
};

type QuestionTimeData = {
  number: number;
  actualMs: number;
  plannedMs: number;
  label: string;
};

type ReviewTimeAnalysisDialogProps = {
  moduleData: ModuleTimeData[];
  questionData: QuestionTimeData[];
};

const formatShortDuration = (value?: number | string) => {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '-';
  if (num >= 60_000) {
    return `${(num / 60_000).toFixed(1)}m`;
  }
  return `${Math.round(num / 1000)}s`;
};

export const ReviewTimeAnalysisDialog = ({
  moduleData,
  questionData,
}: ReviewTimeAnalysisDialogProps) => {
  const [activeTab, setActiveTab] = useState<'module' | 'question'>('module');
  const hasModuleData = moduleData.length > 0;
  const hasQuestionData = questionData.length > 0;
  const hasActualModuleTime = moduleData.some(item => item.actualMs > 0);
  const hasActualQuestionTime = questionData.some(item => item.actualMs > 0);
  const questionStats = useMemo(() => {
    if (questionData.length === 0) {
      return { maxMs: 0, avgMs: 0 };
    }
    const maxMs = Math.max(...questionData.map(item => item.actualMs));
    const avgMs =
      questionData.reduce((sum, item) => sum + item.actualMs, 0) /
      questionData.length;
    return { maxMs, avgMs };
  }, [questionData]);

  const getTimeTone = (actualMs: number, plannedMs: number) => {
    if (actualMs <= 0 || (plannedMs <= 0 && questionStats.maxMs <= 0)) {
      return 'bg-muted text-muted-foreground border-border';
    }
    const ratio =
      plannedMs > 0
        ? actualMs / plannedMs
        : actualMs / Math.max(1, questionStats.maxMs);
    if (ratio <= 0.8) {
      return 'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
    }
    if (ratio <= 1.1) {
      return 'border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-200';
    }
    if (ratio <= 1.4) {
      return 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    }
    return 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-200';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          用时分析
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>用时分析</DialogTitle>
          <DialogDescription>
            对比模块与题号用时，帮助定位节奏问题。
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'module' | 'question')}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="module">模块用时</TabsTrigger>
            <TabsTrigger value="question">题目用时</TabsTrigger>
          </TabsList>

          <TabsContent value="module" className="space-y-3">
            <div className="border-border bg-card rounded-lg border p-4 shadow-none">
              <div className="text-muted-foreground mb-3 text-xs">
                显示各题型的计划用时与实际用时（单位：分钟）
              </div>
              <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  计划用时
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  实际用时
                </span>
                {!hasActualModuleTime && (
                  <span className="text-muted-foreground/80">
                    暂无实际用时记录
                  </span>
                )}
              </div>
              <div className="min-h-[16rem]">
                {hasModuleData ? (
                  activeTab === 'module' && (
                    <ResponsiveContainer width="100%" height={256} minWidth={0}>
                      <BarChart
                        data={moduleData}
                        margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient
                            id="moduleActualFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#3b82f6"
                              stopOpacity={0.9}
                            />
                            <stop
                              offset="100%"
                              stopColor="#60a5fa"
                              stopOpacity={0.45}
                            />
                          </linearGradient>
                          <linearGradient
                            id="modulePlannedFill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#94a3b8"
                              stopOpacity={0.75}
                            />
                            <stop
                              offset="100%"
                              stopColor="#cbd5f5"
                              stopOpacity={0.2}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          strokeOpacity={0.6}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={value => formatShortDuration(value)}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            formatDuration(Number(value ?? 0)),
                            name === 'plannedMs' ? '计划用时' : '实际用时',
                          ]}
                          labelFormatter={label => `题型：${label}`}
                        />
                        <Bar
                          dataKey="plannedMs"
                          fill="url(#modulePlannedFill)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={32}
                          name="计划用时"
                        />
                        <Bar
                          dataKey="actualMs"
                          fill="url(#moduleActualFill)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={36}
                          name="实际用时"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                ) : (
                  <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                    暂无模块用时数据
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="question" className="space-y-3">
            <div className="border-border bg-card rounded-lg border p-4 shadow-none">
              <div className="text-muted-foreground mb-3 text-xs">
                题号热力网格（颜色基于“实际用时 ÷ 计划单题用时”）
              </div>
              <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />快
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  中等
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  偏慢
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  很慢
                </span>
                {!hasActualQuestionTime && (
                  <span className="text-muted-foreground/80">
                    暂无实际用时记录
                  </span>
                )}
              </div>
              <div className="border-border bg-muted/30 text-muted-foreground mb-4 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-xs">
                <span>题量 {questionData.length}</span>
                <span>平均 {formatShortDuration(questionStats.avgMs)}</span>
                <span>最长 {formatShortDuration(questionStats.maxMs)}</span>
              </div>
              {hasQuestionData ? (
                activeTab === 'question' && (
                  <div
                    className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2"
                    style={{
                      contentVisibility: 'auto',
                      containIntrinsicSize: '480px',
                    }}
                  >
                    {questionData.map(item => {
                      const seconds = Math.round(item.actualMs / 1000);
                      const ratio =
                        item.plannedMs > 0 ? item.actualMs / item.plannedMs : 0;
                      return (
                        <div
                          key={item.number}
                          className={cn(
                            'border-border flex h-12 flex-col items-center justify-center rounded-md border text-[11px] font-medium transition',
                            getTimeTone(item.actualMs, item.plannedMs)
                          )}
                          title={`第 ${item.number} 题 · ${item.label} · 实际 ${formatDuration(
                            item.actualMs
                          )}${item.plannedMs > 0 ? ` · 计划 ${formatDuration(item.plannedMs)} · ${ratio.toFixed(2)}x` : ''}`}
                        >
                          <span>{item.number}</span>
                          <span className="text-[10px] opacity-80">
                            {item.actualMs > 0 ? `${seconds}s` : '--'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                  暂无题目用时数据
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
