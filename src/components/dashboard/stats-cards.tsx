'use client';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, ListTodo } from 'lucide-react';
import { isAfter, isBefore, addDays, startOfToday, Timestamp } from 'date-fns';
import type { DemandProps } from '@/components/demandas/demand-card';
import type { Project } from '@/components/projetos/projects-table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


const getDateFromProp = (dateProp: any): Date | null => {
    if (!dateProp) return null;
    if (dateProp && typeof (dateProp as Timestamp).toDate === 'function') {
      return (dateProp as Timestamp).toDate();
    }
     if (typeof dateProp === 'string') { // Fallback for ISO strings
        const parsed = new Date(dateProp);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    return null;
};

export function StatsCards() {
  const firestore = useFirestore();

  const demandsRef = useMemoFirebase(() => collection(firestore, 'demands'), [firestore]);
  const { data: demands, isLoading: isLoadingDemands } = useCollection<DemandProps>(demandsRef);

  const projectsRef = useMemoFirebase(() => collection(firestore, 'projects'), [firestore]);
  const { data: projects, isLoading: isLoadingProjects } = useCollection<Project>(projectsRef);

  const isLoading = isLoadingDemands || isLoadingProjects;

  const stats = React.useMemo(() => {
    const today = startOfToday();
    const nextWeek = addDays(today, 7);

    const pendingDemands = demands?.filter(d => d.status !== 'Finalizado').length || 0;
    const concludedDemands = demands?.filter(d => d.status === 'Finalizado').length || 0;
    
    const demandsDueSoon = demands?.filter(d => {
      if (d.status === 'Finalizado') return false;
      const demandDate = getDateFromProp(d.date);
      if (!demandDate) return false;
      return isAfter(demandDate, today) && isBefore(demandDate, nextWeek);
    }).length || 0;

    const projectsDueSoon = projects?.filter(p => {
      if (p.status.label === 'Concluído' || !p.deadline) return false;
      const projectDate = getDateFromProp(p.deadline);
       if (!projectDate) return false;
      return isAfter(projectDate, today) && isBefore(projectDate, nextWeek);
    }).length || 0;

    const dueSoonTotal = demandsDueSoon + projectsDueSoon;

    return [
      {
        title: 'Demandas Pendentes',
        value: pendingDemands,
        icon: ListTodo,
        color: 'bg-[#A0C4FF]/20 text-[#2563EB]',
        description: 'Total de demandas não finalizadas',
      },
      {
        title: 'Tarefas Concluídas',
        value: concludedDemands,
        icon: CheckCircle,
        color: 'bg-green-500/10 text-green-600',
        description: 'Demandas finalizadas nesta semana',
      },
      {
        title: 'Prazos Próximos',
        value: dueSoonTotal,
        icon: Clock,
        color: 'bg-red-500/10 text-red-600',
        description: 'Demandas e projetos para 7 dias',
      },
    ];
  }, [demands, projects]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="text-3xl font-bold">-</div>
            ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
            )}
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
