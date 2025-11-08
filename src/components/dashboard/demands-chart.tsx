
'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import type { DemandProps } from '@/components/demandas/demand-card';
import { initialDemands } from '@/lib/demandas-data';

const DEMANDS_STORAGE_KEY = 'multiflow-demands';

const chartConfig = {
  demands: {
    label: 'Demandas',
  },
  toDo: {
    label: 'A Fazer',
    color: 'hsl(var(--chart-1))',
  },
  inProgress: {
    label: 'Em Progresso',
    color: 'hsl(var(--chart-2))',
  },
  inReview: {
    label: 'Prazos Próximos',
    color: 'hsl(var(--chart-4))',
  },
  concluded: {
    label: 'Concluído',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export function DemandsChart() {
  const [hoveredBar, setHoveredBar] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [demands, setDemands] = React.useState<DemandProps[]>([]);

  React.useEffect(() => {
    try {
      const storedDemands = localStorage.getItem(DEMANDS_STORAGE_KEY);
      if (storedDemands) {
        setDemands(JSON.parse(storedDemands));
      } else {
        setDemands(initialDemands as DemandProps[]);
      }
    } catch (error) {
        console.error("Failed to read demands from localStorage", error);
        setDemands(initialDemands as DemandProps[]);
    }
    setIsLoading(false);
  }, []);


  const chartData = React.useMemo(() => {
    if (!demands) {
      return [];
    }
    const statusCounts = demands.reduce((acc, demand) => {
      acc[demand.status] = (acc[demand.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { status: 'A Fazer', demands: statusCounts['Aguardando briefing'] || 0, fill: 'var(--color-toDo)' },
      { status: 'Em Progresso', demands: statusCounts['Em produção'] || 0, fill: 'var(--color-inProgress)' },
      { status: 'Em Revisão', demands: statusCounts['Aprovando'] || 0, fill: 'var(--color-inReview)' },
      { status: 'Concluído', demands: statusCounts['Finalizado'] || 0, fill: 'var(--color-concluded)' },
    ];
  }, [demands]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Status das Demandas</CardTitle>
        <CardDescription className="text-lg">
          Visão geral do progresso das demandas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="h-[350px] flex items-center justify-center">
                <p>Carregando gráfico...</p>
            </div>
        ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
                data={chartData}
                margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
                }}
                accessibilityLayer
                onMouseMove={(state) => {
                if (state.isTooltipActive) {
                    setHoveredBar(state.activeLabel || null);
                } else {
                    setHoveredBar(null);
                }
                }}
                onMouseLeave={() => setHoveredBar(null)}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="status"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 14 }}
                />
                <YAxis tick={{ fontSize: 14 }} />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="demands" radius={8}>
                {chartData.map((entry, index) => (
                    <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className={cn(
                        'transition-opacity',
                        hoveredBar && hoveredBar !== entry.status
                        ? 'opacity-30'
                        : 'opacity-100'
                    )}
                    />
                ))}
                </Bar>
            </BarChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
