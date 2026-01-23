import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';
import { backupRepo } from '@/db/repositories/backupRepo';
import {
  useSessionActions,
  useStatsActions,
  useTemplateActions,
  useUiActions,
} from '@/store/selectors';

const buildFileName = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `exam-timer-backup-${stamp}.json`;
};

export const DataTransferSection = () => {
  const templateActions = useTemplateActions();
  const statsActions = useStatsActions();
  const uiActions = useUiActions();
  const sessionActions = useSessionActions();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const payload = await backupRepo.exportAll();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = buildFileName();
      link.click();
      URL.revokeObjectURL(url);
      toast.success('导出完成，已生成备份文件。');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImportError('');
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const handleImport = async () => {
    if (!pendingFile) return;
    setIsImporting(true);
    setImportError('');
    try {
      const text = await pendingFile.text();
      const payload = JSON.parse(text);
      await backupRepo.importAll(payload);
      // 导入完成后刷新前端缓存。
      await templateActions.loadTemplates();
      await templateActions.loadQuestionTypes();
      await statsActions.refreshDaily();
      await uiActions.hydrate();
      // 导入后清空当前练习状态，避免数据错乱。
      sessionActions.reset();
      toast.success('导入成功，已覆盖本地数据。');
      setConfirmOpen(false);
      setPendingFile(null);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : '导入失败，请检查文件内容。'
      );
      toast.error('导入失败，请检查文件是否正确。');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>数据导入导出</CardTitle>
        <p className="text-muted-foreground text-xs">
          备份当前题型、模板与复盘数据，导入将覆盖本地数据。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? '导出中...' : '导出数据'}
          </Button>
          <Button variant="outline" onClick={handlePickFile}>
            <Upload className="mr-2 h-4 w-4" />
            导入数据
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {importError && (
          <p className="text-destructive text-xs">{importError}</p>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认导入数据？</AlertDialogTitle>
            <AlertDialogDescription>
              导入后将覆盖本地所有题型、模板与练习记录。文件：
              {pendingFile?.name ?? '未选择'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} disabled={isImporting}>
              {isImporting ? '导入中...' : '确认导入'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
