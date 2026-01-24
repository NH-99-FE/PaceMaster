import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrendPoint } from '@/features/dashboard/hooks/useDashboardStats';

type DashboardTrendCardProps = {
  data: TrendPoint[];
};

const formatPercent = (value?: number | string) => {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '-';
  return `${(num * 100).toFixed(1)}%`;
};

const getSeriesLabel = (name?: string) => {
  if (name === 'accuracyRate') return '正确率';
  if (name === 'completionRate') return '完成率';
  return name ?? '';
};

export const DashboardTrendCard = ({ data }: DashboardTrendCardProps) => (
  <Card className="shadow-none">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>近 7 天趋势</CardTitle>
        <p className="text-muted-foreground text-xs">正确率 & 完成率</p>
      </div>
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          正确率
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          完成率
        </span>
      </div>
    </CardHeader>
    <CardContent className="h-64 [&_.recharts-surface]:outline-none">
      <ResponsiveContainer width="100%" height={256} minWidth={0}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="completionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            strokeOpacity={0.6}
          />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 1]}
            tickFormatter={value => `${Math.round(value * 100)}%`}
          />
          <Tooltip
            formatter={(value, name) => [
              formatPercent(value as number | string),
              getSeriesLabel(name as string),
            ]}
            labelFormatter={label => `日期 ${label}`}
            cursor={{ stroke: 'hsl(var(--border))', strokeDasharray: '4 4' }}
            contentStyle={{
              borderRadius: 10,
              borderColor: 'hsl(var(--border))',
              background: 'hsl(var(--background))',
            }}
          />
          <Area
            type="monotone"
            dataKey="accuracyRate"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#accuracyFill)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="completionRate"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#completionFill)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
