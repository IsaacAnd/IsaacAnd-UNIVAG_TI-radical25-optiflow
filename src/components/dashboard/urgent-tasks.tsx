
'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DemandProps } from '@/components/demandas/demand-card';
import { initialDemands } from '@/lib/demandas-data';

const DEMANDS_STORAGE_KEY = 'multiflow-demands';

type Urgency = 'high' | 'medium' | 'low';

const getDateFromProp = (dateProp: any): Date | null => {
    if (!dateProp) return null;
    if (typeof dateProp === 'string') {
        try {
            const parsed = parseISO(dateProp);
            if (!isNaN(parsed.getTime())) {
                return parsed;
            }
        } catch (e) {
            return null;
        }
    }
    return null;
};

const getUrgency = (isOverdue?: boolean): Urgency => {
  if (isOverdue) return 'high';
  // this can be expanded with more logic for medium/low
  return 'medium';
}

const urgencyStyles: Record<Urgency, string> = {
  high: 'border-red-500 bg-red-500/10 text-red-500',
  medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
  low: 'border-blue-500 bg-blue-500/10',
};

export function UrgentTasks() {
    const [demands, setDemands] = React.useState<DemandProps[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

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

    const urgentDemands = React.useMemo(() => {
        return demands
            .filter(d => d.status !== 'Finalizado' && d.date)
            .map(d => {
                const demandDate = getDateFromProp(d.date);
                return {
                    ...d,
                    isOverdue: demandDate ? demandDate < new Date() && d.status !== 'Finalizado' : false,
                    dateObj: demandDate
                }
            })
            .filter(d => d.isOverdue || (d.dateObj && d.dateObj < new Date(new Date().setDate(new Date().getDate() + 7))))
            .sort((a, b) => (a.isOverdue ? -1 : 1) - (b.isOverdue ? -1 : 1) || (a.dateObj && b.dateObj ? a.dateObj.getTime() - b.dateObj.getTime() : 0))
            .slice(0, 5);
    }, [demands]);
        
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Minhas Tarefas Urgentes</CardTitle>
        <CardDescription className="text-lg">
          Tarefas que requerem atenção imediata.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
             <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border-l-4 p-4 h-16 bg-muted animate-pulse"></div>
                <div className="flex items-center justify-between rounded-lg border-l-4 p-4 h-16 bg-muted animate-pulse"></div>
                <div className="flex items-center justify-between rounded-lg border-l-4 p-4 h-16 bg-muted animate-pulse"></div>
             </div>
        ) : (
            <div className="space-y-4">
            {urgentDemands.map((task) => {
                const urgency = getUrgency(task.isOverdue);
                const deadline = task.isOverdue ? 'Atrasado' : (task.dateObj ? formatDistanceToNow(task.dateObj, { addSuffix: true, locale: ptBR }) : 'Sem prazo');
                return (
                    <div
                    key={task.id}
                    className={cn(
                        'flex items-center justify-between rounded-lg border-l-4 p-4',
                        urgencyStyles[urgency]
                    )}
                    >
                    <div>
                        <p className="font-semibold text-base">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.tags.find(t => t.label !== 'Urgente')?.label || ''}</p>
                    </div>
                    <div
                        className={cn(
                        'text-sm font-medium',
                        urgency === 'high' || urgency === 'medium'
                            ? 'text-current'
                            : 'text-muted-foreground'
                        )}
                    >
                        {deadline}
                    </div>
                    </div>
                )
            })}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
