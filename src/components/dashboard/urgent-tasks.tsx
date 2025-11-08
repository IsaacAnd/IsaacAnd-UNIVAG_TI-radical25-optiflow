
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
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { ptBR } from 'date-fns/locale';
import type { DemandProps } from '@/components/demandas/demand-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


type Urgency = 'high' | 'medium' | 'low';

const getDateFromProp = (dateProp: any): Date | null => {
    if (!dateProp) return null;
    if (dateProp && typeof (dateProp as Timestamp).toDate === 'function') {
      return (dateProp as Timestamp).toDate();
    }
    if (typeof dateProp === 'string') {
        const parsed = new Date(dateProp);
        if (!isNaN(parsed.getTime())) return parsed;
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
    const firestore = useFirestore();
    const demandsRef = useMemoFirebase(() => collection(firestore, 'demands'), [firestore]);
    const { data: demands, isLoading } = useCollection<DemandProps>(demandsRef);

    const urgentDemands = React.useMemo(() => {
        if (!demands) return [];
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
                const category = task.tags?.find(t => t.label !== 'Urgente')?.label || '';
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
                        <p className="text-sm text-muted-foreground">{category}</p>
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
