import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PracticeEndDialogProps = {
  open: boolean;
  defaultName: string;
  onSave: (name: string) => Promise<string | null>;
  onCancel: () => void;
};

export const PracticeEndDialog = ({
  open,
  defaultName,
  onSave,
  onCancel,
}: PracticeEndDialogProps) => {
  const navigate = useNavigate();
  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(name.trim() || defaultName);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndReview = async () => {
    setIsSaving(true);
    try {
      const sessionId = await onSave(name.trim() || defaultName);
      if (sessionId) {
        navigate(`/review/${sessionId}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={open => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>练习结束</DialogTitle>
          <DialogDescription>
            为本次练习记录命名，方便后续查看和管理
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="session-name" className="text-sm font-medium">
              记录名称
            </label>
            <Input
              id="session-name"
              placeholder="输入记录名称"
              value={defaultName}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
            />
            <p className="text-muted-foreground text-xs">
              留空将使用默认名称：{defaultName}
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            保存记录
          </Button>
          <Button
            onClick={handleSaveAndReview}
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            保存并复盘
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
