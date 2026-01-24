import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRecords, type ReviewRecord } from '@/features/records/hooks/useRecords';
import { RecordEditDialog } from '@/features/records/components/RecordEditDialog';
import { formatDateTime, formatDuration } from '@/utils/time';
import { sessionRepo } from '@/db/repositories/sessionRepo';

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const RecordsPage = () => {
  const { records, isLoading, summary, refresh } = useRecords();
  const navigate = useNavigate();
  const [editingRecord, setEditingRecord] = useState<ReviewRecord | null>(null);

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('记录已刷新');
    } catch {
      toast.error('刷新失败，请稍后重试');
    }
  };

  const handleEditClick = (e: React.MouseEvent, record: ReviewRecord) => {
    e.stopPropagation();
    setEditingRecord(record);
  };

  const handleSaveRename = async (newName: string) => {
    if (!editingRecord) return;
    try {
      await sessionRepo.updateSession(editingRecord.id, { name: newName });
      await refresh();
      toast.success('重命名成功');
      setEditingRecord(null);
    } catch {
      toast.error('重命名失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">我的记录</h1>
          <p className="text-muted-foreground text-sm">
            查看每次复盘结果与节奏表现
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="relative"
        >
          <span className={isLoading ? 'opacity-0' : ''}>刷新</span>
          {isLoading && (
            <Loader2 className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          )}
        </Button>
      </div>

      <Card className="shadow-none">
        <CardContent className="grid grid-cols-2 gap-2 p-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs">总记录数</p>
            <div className="mt-1 text-base font-semibold">
              {summary.totalSessions}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">平均正确率</p>
            <div className="mt-1 text-base font-semibold">
              {formatPercent(summary.avgAccuracy)}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">平均完成率</p>
            <div className="mt-1 text-base font-semibold">
              {formatPercent(summary.avgCompletion)}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">累计用时</p>
            <div className="mt-1 text-base font-semibold">
              {formatDuration(summary.totalTimeMs)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
            <span>所有练习记录</span>
            <span className="text-muted-foreground text-xs">
              点击记录可查看并修改复盘 · 共 {records.length} 条
            </span>
          </div>
          <Separator />
          {records.length === 0 ? (
            <div className="text-muted-foreground py-10 text-center text-sm">
              暂无复盘记录，完成一次练习并保存复盘即可在这里查看。
            </div>
          ) : (
            <div className="space-y-2">
              {records.map(record => (
                <div
                  key={record.id}
                  onClick={() => navigate(`/records/${record.id}`)}
                  className="border-border hover:border-primary/40 hover:bg-primary/5 flex w-full cursor-pointer flex-col gap-2 rounded-md border px-3 py-2 text-left transition-colors md:flex-row md:items-center md:justify-between group"
                >
                  <div className="w-full space-y-1 md:w-auto">
                    <div className="flex items-center justify-between gap-2 md:justify-start">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate max-w-[10em] md:max-w-[8em] lg:max-w-[15em]">
                          {record.name}
                        </span>
                        <button
                          type="button"
                          onClick={e => handleEditClick(e, record)}
                          className="text-muted-foreground hover:text-foreground shrink-0 p-1 opacity-100 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                          title="重命名"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            record.mode === 'practice' ? 'secondary' : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {record.mode === 'practice' ? '练习' : '模拟'}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {record.endedAt
                            ? formatDateTime(record.endedAt)
                            : '未记录时间'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                    <span>正确率 {formatPercent(record.accuracyRate)}</span>
                    <span>完成率 {formatPercent(record.completionRate)}</span>
                    <span>题数 {record.totalQuestions}</span>
                    <span>用时 {formatDuration(record.totalTimeMs)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RecordEditDialog
        open={!!editingRecord}
        defaultName={editingRecord?.name ?? ''}
        onSave={handleSaveRename}
        onCancel={() => setEditingRecord(null)}
      />
    </div>
  );
};

export default RecordsPage;
