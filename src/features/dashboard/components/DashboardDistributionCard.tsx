import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DistributionItem = {
  name: string;
  value: number;
  key: string;
};

const STATUS_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#94a3b8'];
const formatCount = (value?: number | string) => {
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '-';
  return `${num} 题`;
};

export const DashboardDistributionCard = ({
  data,
}: {
  data: DistributionItem[];
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>题目状态分布</CardTitle>
        <p className="text-muted-foreground text-xs">近 7 天合计</p>
      </CardHeader>
      <CardContent className="flex h-64 flex-col pb-4">
        {total === 0 ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            暂无数据
          </div>
        ) : (
          <div className="flex-1">
            <ResponsiveContainer
              className="[&_.recharts-surface]:outline-none"
              width="100%"
              height={240}
              minWidth={0}
            >
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={84}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      fillOpacity={
                        activeIndex !== null && activeIndex !== index ? 0.35 : 1
                      }
                      stroke={
                        activeIndex === index
                          ? 'hsl(var(--background))'
                          : 'transparent'
                      }
                      strokeWidth={activeIndex === index ? 3 : 1}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="text-muted-foreground mt-3 flex flex-wrap justify-center gap-2 text-xs">
          {data.map((item, index) => (
            <span key={item.key} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[index] }}
              />
              {item.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// 自定义 Tooltip 组件，确保样式受控
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="border-border bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-sm shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: data.payload.fill }} // 使用 Cell 传入的 fill
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="text-muted-foreground mt-1 pl-4 text-xs">
          {formatCount(data.value)}
        </div>
      </div>
    );
  }
  return null;
};
