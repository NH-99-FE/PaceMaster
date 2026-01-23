import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Mode } from '@/types';

type PracticeRestoreBannerProps = {
  mode: Mode;
  onDismiss: () => void;
  onReset: () => void;
};

export const PracticeRestoreBanner = ({
  mode,
  onDismiss,
  onReset,
}: PracticeRestoreBannerProps) => (
  <Card className="border-border/60 bg-muted/20 px-4 py-3 shadow-none">
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">检测到未结束的练习</span>
          <Badge variant="secondary">
            {mode === 'practice' ? '练习' : '模拟'}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          已恢复进度并暂停计时，点击继续后才会开始计时。
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onDismiss}>
          继续
        </Button>
        <Button variant="destructive" size="sm" onClick={onReset}>
          重置
        </Button>
      </div>
    </div>
  </Card>
);
