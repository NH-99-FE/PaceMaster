import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

type RecordEditDialogProps = {
    open: boolean;
    defaultName: string;
    onSave: (newName: string) => Promise<void>;
    onCancel: () => void;
};

export const RecordEditDialog = ({
    open,
    defaultName,
    onSave,
    onCancel,
}: RecordEditDialogProps) => {
    const [name, setName] = useState(defaultName);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setName(defaultName);
        }
    }, [open, defaultName]);

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        try {
            await onSave(name.trim());
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={open => !open && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>重命名记录</DialogTitle>
                    <DialogDescription>修改该条练习记录的显示名称。</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Input
                            id="record-name"
                            placeholder="输入记录名称"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSave();
                                }
                            }}
                            autoFocus
                        />
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
                        className="w-full sm:w-auto relative"
                        disabled={isSaving || !name.trim()}
                    >
                        <span className={isSaving ? 'opacity-0' : ''}>保存修改</span>
                        {isSaving && (
                            <Loader2 className="absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
